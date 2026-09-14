from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Category, Product, Order, OrderItem


# ------------------------------------------------------------------ USERS
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_admin', 'is_customer', 'is_staff', 'is_active')
    list_filter = ('is_admin', 'is_customer', 'is_staff', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Roles & Profile', {
            'fields': ('is_admin', 'is_customer', 'phone', 'address', 'avatar'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Roles', {'fields': ('is_admin', 'is_customer')}),
    )


# -------------------------------------------------------------- CATEGORY
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}


# --------------------------------------------------------------- PRODUCT
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'stock', 'category', 'is_active', 'created_at')
    list_filter = ('is_active', 'category')
    search_fields = ('title', 'description')
    list_editable = ('price', 'stock', 'is_active')


# ----------------------------------------------------------- ORDER INLINE
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('title', 'price', 'quantity')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_price', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__username', 'email')
    inlines = [OrderItemInline]