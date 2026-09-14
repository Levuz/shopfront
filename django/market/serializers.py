from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Category, Product, Order, OrderItem

User = get_user_model()


# ═══════════════════════════════════════════════════════════ USERS
class UserSerializer(serializers.ModelSerializer):
    role = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'phone', 'address', 'avatar',
            'is_admin', 'is_customer', 'is_staff', 'role',
            'date_joined', 'last_login',
        )
        read_only_fields = (
            'id', 'is_admin', 'is_customer', 'is_staff',
            'date_joined', 'last_login',
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'password2',
            'first_name', 'last_name',
        )

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.is_customer = True
        user.is_admin = False
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds full user payload to the standard JWT response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user, context=self.context).data
        return data


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.ReadOnlyField()
    order_count = serializers.IntegerField(source='orders.count', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'full_name', 'role',
            'is_admin', 'is_customer', 'is_active', 'order_count',
            'date_joined', 'last_login',
        )
        read_only_fields = ('id', 'date_joined', 'last_login')


# ═══════════════════════════════════════════════════════ CATEGORY
class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'product_count', 'created_at')
        read_only_fields = ('slug',)


# ═══════════════════════════════════════════════════════ PRODUCT
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    image_url = serializers.SerializerMethodField()
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id', 'title', 'slug', 'description', 'price', 'stock',
            'category', 'category_name', 'category_slug',
            'image', 'image_url', 'is_active', 'in_stock',
            'created_at', 'updated_at',
        )
        read_only_fields = ('slug', 'created_at', 'updated_at')

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url


# ═══════════════════════════════════════════════════════ ORDER
class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()
    product_image = serializers.SerializerMethodField()
    product_slug = serializers.CharField(source='product.slug', read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            'id', 'product', 'product_slug', 'title', 'price',
            'quantity', 'subtotal', 'product_image',
        )

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            request = self.context.get('request')
            url = obj.product.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    item_count = serializers.ReadOnlyField()

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'username', 'user_email', 'status', 'total_price',
            'full_name', 'email', 'phone', 'address',
            'items', 'item_count', 'created_at', 'updated_at',
        )
        read_only_fields = ('user', 'total_price', 'created_at', 'updated_at')


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('id', 'status')


# ------------------------------------------------------ Order creation
class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=999)


class OrderCreateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, allow_blank=True, required=False)
    address = serializers.CharField()
    items = OrderItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Your cart is empty.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        items_data = validated_data.pop('items')

        order = Order.objects.create(
            user=user, total_price=Decimal('0.00'), **validated_data
        )

        total = Decimal('0.00')
        for row in items_data:
            try:
                product = Product.objects.select_for_update().get(
                    pk=row['product_id'], is_active=True
                )
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    {'items': f"Product #{row['product_id']} is unavailable."}
                )

            qty = row['quantity']
            if product.stock < qty:
                raise serializers.ValidationError(
                    {'items': f"Only {product.stock} left in stock for “{product.title}”."}
                )

            product.stock -= qty
            product.save(update_fields=['stock'])

            OrderItem.objects.create(
                order=order,
                product=product,
                title=product.title,
                price=product.price,
                quantity=qty,
            )
            total += product.price * qty

        order.total_price = total
        order.save(update_fields=['total_price'])
        return order