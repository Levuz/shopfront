from rest_framework.permissions import BasePermission, SAFE_METHODS


def _is_admin(user):
    return bool(
        user and user.is_authenticated and (user.is_admin or user.is_staff)
    )


class IsAdminRole(BasePermission):
    """Only admin-flagged (or Django staff) users."""
    message = 'Administrator privileges are required.'

    def has_permission(self, request, view):
        return _is_admin(request.user)


class IsAdminOrReadOnly(BasePermission):
    """Anyone can read; only admins can write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return _is_admin(request.user)


class IsOwnerOrAdmin(BasePermission):
    """Object-level: owner or admin."""

    def has_object_permission(self, request, view, obj):
        if _is_admin(request.user):
            return True
        return getattr(obj, 'user_id', None) == request.user.id