from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify


# ═══════════════════════════════════════════════════════════ USER
class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=True)

    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_joined']

    @property
    def role(self):
        return 'admin' if (self.is_admin or self.is_staff) else 'customer'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.username

    def __str__(self):
        return self.username


# ═══════════════════════════════════════════════════════ CATEGORY
class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ═══════════════════════════════════════════════════════ PRODUCT
class Product(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(
        Category, related_name='products',
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['-created_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200] or 'product'
            slug, i = base, 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{i}'
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def in_stock(self):
        return self.stock > 0

    def __str__(self):
        return self.title


# ═══════════════════════════════════════════════════════ ORDER
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='orders', on_delete=models.CASCADE,
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    full_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]

    @property
    def item_count(self):
        return sum(i.quantity for i in self.items.all())

    def __str__(self):
        return f'Order #{self.pk} — {self.user.username}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(
        Product, related_name='order_items',
        on_delete=models.SET_NULL, null=True,
    )
    title = models.CharField(max_length=200)   # snapshot at order time
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def subtotal(self):
        return self.price * self.quantity

    def __str__(self):
        return f'{self.quantity} × {self.title}'