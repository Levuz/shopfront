from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Category, Product, Order
from .permissions import IsAdminRole
from .serializers import (
    # auth
    RegisterSerializer, UserSerializer,
    CustomTokenObtainPairSerializer, AdminUserSerializer,
    # store
    CategorySerializer, ProductSerializer,
    # orders
    OrderSerializer, OrderCreateSerializer,
)

User = get_user_model()


# ═══════════════════════════════════════════════════════════ AUTH
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ═══════════════════════════════════════════════════════ CATEGORY
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


# ═══════════════════════════════════════════════════════ PRODUCT (public)
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('category')

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category) if category.isdigit() \
                 else qs.filter(category__slug=category)

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        in_stock = self.request.query_params.get('in_stock')
        if in_stock in ('1', 'true', 'True'):
            qs = qs.filter(stock__gt=0)

        return qs


# ═══════════════════════════════════════════════════════ PRODUCT (admin CRUD)
class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'stock', 'created_at', 'title']
    ordering = ['-created_at']


# ═══════════════════════════════════════════════════════ ORDERS (customer)
class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderSerializer(order, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items__product')
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.prefetch_related('items__product')
        if self.request.user.is_admin or self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)


# ═══════════════════════════════════════════════════════ ORDERS (admin)
class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('user').prefetch_related('items__product')
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ['get', 'put', 'patch', 'head', 'options']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['id', 'user__username', 'user__email', 'full_name', 'email']
    ordering_fields = ['created_at', 'total_price', 'status']
    ordering = ['-created_at']


# ═══════════════════════════════════════════════════════ USERS (admin)
class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().prefetch_related('orders')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']


# ═══════════════════════════════════════════════════════ STATS
class AdminStatsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        paid = Order.objects.exclude(status='Cancelled')

        revenue = paid.aggregate(t=Sum('total_price'))['t'] or 0
        total_orders = Order.objects.count()
        pending = Order.objects.filter(status='Pending').count()
        processing = Order.objects.filter(status='Processing').count()
        completed = Order.objects.filter(status='Completed').count()
        cancelled = Order.objects.filter(status='Cancelled').count()

        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        low_stock = Product.objects.filter(stock__lte=5, is_active=True).count()

        total_users = User.objects.filter(is_customer=True).count()

        recent = Order.objects.select_related('user').order_by('-created_at')[:6]

        # Last 7 days revenue series
        today = timezone.now().date()
        series = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            amount = paid.filter(created_at__date=day).aggregate(
                t=Sum('total_price')
            )['t'] or 0
            series.append({'date': day.strftime('%a'), 'revenue': float(amount)})

        return Response({
            'total_revenue': float(revenue),
            'total_orders': total_orders,
            'total_products': total_products,
            'active_products': active_products,
            'low_stock_products': low_stock,
            'total_users': total_users,
            'orders_by_status': {
                'Pending': pending,
                'Processing': processing,
                'Completed': completed,
                'Cancelled': cancelled,
            },
            'recent_orders': OrderSerializer(
                recent, many=True, context={'request': request}
            ).data,
            'revenue_series': series,
        })