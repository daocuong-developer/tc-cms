# admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Role, Permission, Organization, Department # Import các model mới

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Thêm 'organization' và 'department' vào list_display
    list_display = ('email', 'full_name', 'is_staff', 'is_active', 'organization', 'department', 'get_roles')
    # Thêm 'organization' và 'department' vào search_fields
    search_fields = ('email', 'full_name', 'organization__name', 'department__name')
    ordering = ('email',)
    # Thêm 'organization' và 'department' vào list_filter
    list_filter = ('is_staff', 'is_active', 'roles', 'organization', 'department')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'username')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        # Thêm 'organization' và 'department' vào fieldsets để quản lý trong form chỉnh sửa
        ('Organization and Department', {'fields': ('organization', 'department')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password', 'password2'), # Đổi password1, password2 thành password
        }),
        # Có thể thêm organization và department vào add_fieldsets nếu muốn gán ngay khi tạo user
        ('Organization and Department', {
            'classes': ('wide',),
            'fields': ('organization', 'department'),
        }),
    )

    def get_roles(self, obj):
        return ", ".join([role.name for role in obj.roles.all()])
    get_roles.short_description = 'Roles'

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    filter_horizontal = ('permissions', 'users')

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('codename', 'description', 'get_roles')
    search_fields = ('codename', 'description')
    list_filter = ('roles',)

    def get_roles(self, obj):
        return ", ".join([role.name for role in obj.roles.all()])
    get_roles.short_description = 'Roles'

# --- NEW: Register Organization Model ---
@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

# --- NEW: Register Department Model ---
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'description', 'created_at')
    search_fields = ('name', 'organization__name')
    list_filter = ('organization',)
    ordering = ('organization__name', 'name')