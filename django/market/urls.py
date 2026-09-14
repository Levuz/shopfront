from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, ProfileView,
    CategoryViewSet, ProductViewSet,
    OrderCreateView, MyOrdersView, OrderDetailView,
    AdminProductViewSet, AdminOrderViewSet, AdminUserViewSet, AdminStatsView,
)
from . import admin_views

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('categories', CategoryViewSet, basename='category')
router.register('admin/products', AdminProductViewSet, basename='admin-product')
router.register('admin/orders', AdminOrderViewSet, basename='admin-order')
router.register('admin/users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', ProfileView.as_view(), name='profile'),
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/my-orders/', MyOrdersView.as_view(), name='my-orders'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('panel/', admin_views.panel, name='admin_panel'),
    path('', include(router.urls)),
]