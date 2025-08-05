from functools import wraps
from rest_framework.response import Response
from rest_framework import permissions, status

def permission_required(codename):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.roles.filter(permissions__codename=codename).exists():
                return Response(
                    {"detail": "You do not have permission to perform this action."},
                    status=status.HTTP_403_FORBIDDEN
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

class HasPermission(permissions.BasePermission):
    def __init__(self, codename):
        self.codename = codename

    def has_permission(self, request, view):
        return request.user.roles.filter(permissions__codename=self.codename).exists()
    
class IsSelfOrAdmin(permissions.BasePermission):
    """
    Cho phép nếu là superuser hoặc là chính user đang thao tác.
    Dùng để thay thế đoạn gọi self.get_object() trong get_permissions().
    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or obj == request.user
