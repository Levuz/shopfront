from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from django.shortcuts import render, redirect, get_object_or_404

from .models import Category, Product, Order

User = get_user_model()


@staff_member_required
def panel(request):
    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'create_product':
            title = request.POST.get('title', '').strip()
            if title:
                p = Product(
                    title=title,
                    description=request.POST.get('description', ''),
                    price=request.POST.get('price') or 0,
                    stock=request.POST.get('stock') or 0,
                    category_id=request.POST.get('category') or None,
                    is_active=request.POST.get('is_active') == 'on',
                )
                if request.FILES.get('image'):
                    p.image = request.FILES['image']
                p.save()
                messages.success(request, f'Product "{p.title}" created.')
            else:
                messages.error(request, 'Title is required.')
            return redirect('admin_panel')

        if action == 'update_product':
            p = get_object_or_404(Product, pk=request.POST.get('product_id'))
            p.title = request.POST.get('title', p.title).strip() or p.title
            p.description = request.POST.get('description', p.description)
            p.price = request.POST.get('price') or p.price
            p.stock = request.POST.get('stock') or p.stock
            p.category_id = request.POST.get('category') or None
            p.is_active = request.POST.get('is_active') == 'on'
            if request.FILES.get('image'):
                p.image = request.FILES['image']
            p.save()
            messages.success(request, f'Product "{p.title}" updated.')
            return redirect('admin_panel')

        if action == 'delete_product':
            p = get_object_or_404(Product, pk=request.POST.get('product_id'))
            name = p.title
            p.delete()
            messages.success(request, f'Deleted "{name}".')
            return redirect('admin_panel')

        if action == 'update_order':
            o = get_object_or_404(Order, pk=request.POST.get('order_id'))
            o.status = request.POST.get('status', o.status)
            o.save()
            messages.success(request, f'Order #{o.id} → {o.status}')
            return redirect('admin_panel')

        if action == 'add_category':
            name = request.POST.get('name', '').strip()
            if name:
                Category.objects.get_or_create(name=name)
                messages.success(request, f'Category "{name}" added.')
            return redirect('admin_panel')

        if action == 'delete_category':
            c = get_object_or_404(Category, pk=request.POST.get('category_id'))
            name = c.name
            c.delete()
            messages.success(request, f'Deleted category "{name}".')
            return redirect('admin_panel')

        if action == 'create_user':
            username = request.POST.get('username', '').strip()
            password = request.POST.get('password', '')
            email = request.POST.get('email', '').strip()

            if not username or not password:
                messages.error(request, 'Username and password are required.')
            elif User.objects.filter(username__iexact=username).exists():
                messages.error(request, f'Username "{username}" is already taken.')
            elif email and User.objects.filter(email__iexact=email).exists():
                messages.error(request, f'Email "{email}" is already registered.')
            else:
                u = User.objects.create_user(
                    username=username,
                    password=password,
                    email=email,
                )
                u.first_name = request.POST.get('first_name', '')
                u.last_name = request.POST.get('last_name', '')
                u.phone = request.POST.get('phone', '')
                u.address = request.POST.get('address', '')
                u.is_admin = request.POST.get('is_admin') == 'on'
                u.is_customer = request.POST.get('is_customer') == 'on' or not u.is_admin
                u.is_staff = u.is_admin
                u.is_active = request.POST.get('is_active') == 'on'
                u.save()
                messages.success(request, f'User "{u.username}" created.')
            return redirect('admin_panel')

        if action == 'update_user':
            u = get_object_or_404(User, pk=request.POST.get('user_id'))

            new_username = request.POST.get('username', u.username).strip() or u.username
            if new_username.lower() != u.username.lower() and \
               User.objects.filter(username__iexact=new_username).exclude(pk=u.pk).exists():
                messages.error(request, f'Username "{new_username}" is taken.')
                return redirect('admin_panel')

            new_email = request.POST.get('email', '').strip()
            if new_email and new_email.lower() != (u.email or '').lower() and \
               User.objects.filter(email__iexact=new_email).exclude(pk=u.pk).exists():
                messages.error(request, f'Email "{new_email}" is already registered.')
                return redirect('admin_panel')

            u.username = new_username
            u.email = new_email
            u.first_name = request.POST.get('first_name', u.first_name)
            u.last_name = request.POST.get('last_name', u.last_name)
            u.phone = request.POST.get('phone', u.phone)
            u.address = request.POST.get('address', u.address)
            u.is_admin = request.POST.get('is_admin') == 'on'
            u.is_customer = request.POST.get('is_customer') == 'on' or not u.is_admin
            u.is_staff = u.is_admin
            u.is_active = request.POST.get('is_active') == 'on'

            new_password = request.POST.get('password', '').strip()
            if new_password:
                u.set_password(new_password)

            u.save()
            messages.success(request, f'User "{u.username}" updated.')
            return redirect('admin_panel')

        if action == 'delete_user':
            u = get_object_or_404(User, pk=request.POST.get('user_id'))

            if u.pk == request.user.pk:
                messages.error(request, 'You cannot delete your own account.')
            elif u.is_superuser:
                messages.error(request, 'Superusers cannot be deleted from this panel.')
            else:
                name = u.username
                u.delete()
                messages.success(request, f'User "{name}" deleted.')
            return redirect('admin_panel')

    revenue = Order.objects.exclude(status='Cancelled').aggregate(
        t=Sum('total_price'))['t'] or 0

    ctx = {
        'total_revenue': revenue,
        'total_orders': Order.objects.count(),
        'total_products': Product.objects.count(),
        'total_categories': Category.objects.count(),
        'total_users': User.objects.count(),
        'recent_orders': Order.objects.select_related('user').order_by('-created_at')[:8],
        'products': Product.objects.select_related('category').order_by('-created_at'),
        'orders': Order.objects.select_related('user').order_by('-created_at'),
        'categories': Category.objects.annotate(product_count=Count('products')).order_by('name'),
        'users': User.objects.annotate(order_count=Count('orders')).order_by('-date_joined'),
        'STATUSES': ['Pending', 'Processing', 'Completed', 'Cancelled'],
        'current_user_id': request.user.pk,
    }
    return render(request, 'admin_panel.html', ctx)