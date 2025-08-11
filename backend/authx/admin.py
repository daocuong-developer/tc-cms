from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Role, Permission, Organization, Department, Group, Customer, Contract, Software

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'is_staff', 'is_active', 'organization', 'department', 'get_roles')
    search_fields = ('email', 'full_name', 'organization__name', 'department__name')
    ordering = ('email',)
    list_filter = ('is_staff', 'is_active', 'roles', 'organization', 'department')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'username')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Organization and Department', {'fields': ('organization', 'department')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password', 'password2'),
        }),
        ('Organization and Department', {
            'classes': ('wide',),
            'fields': ('organization', 'department'),
        }),
    )

    def get_roles(self, obj):
        return ", ".join([role.name for role in obj.roles.all()])
    get_roles.short_description = 'Roles'

# Registers the Role model
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    filter_horizontal = ('permissions', 'users')

# Registers the Permission model
@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('codename', 'description', 'get_roles')
    search_fields = ('codename', 'description')
    list_filter = ('roles',)

    def get_roles(self, obj):
        return ", ".join([role.name for role in obj.roles.all()])
    get_roles.short_description = 'Roles'

# Registers the Organization model
@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

# Registers the Group model
@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'description')
    list_filter = ('organization',)
    search_fields = ('name', 'description')

# Registers the Department model
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'description', 'created_at')
    search_fields = ('name', 'organization__name')
    list_filter = ('organization',)
    ordering = ('organization__name', 'name')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        'customerName', 'email', 'phone', 'deviceName', 
        'get_organization_name',
        'created_at'
    )
    search_fields = ('customerName', 'email', 'phone')
    ordering = ('customerName',)
    list_filter = (
        'department__organization', 
        'group__organization',     
    )

    def get_organization_name(self, obj):
        if obj.department and obj.department.organization:
            return obj.department.organization.name
        if obj.group and obj.group.organization:
            return obj.group.organization.name
        return "N/A"
    
    get_organization_name.short_description = 'Organization' 

# Registers the Contract model
@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('customer', 'get_customer_device_name', 'get_customer_organization', 'status', 'startDate', 'endDate', 'timesMarked')
    search_fields = ('customer__customerName',)
    list_filter = ('status', 'customer__department__organization', 'customer__group__organization',)
    ordering = ('-startDate',)
    raw_id_fields = ('customer',)

    def get_customer_device_name(self, obj):
        return obj.customer.deviceName if obj.customer else None
    get_customer_device_name.short_description = 'Device Name'
    
    def get_customer_organization(self, obj):
        if obj.customer.department:
            return obj.customer.department.organization
        if obj.customer.group:
            return obj.customer.group.organization
        return None
    get_customer_organization.short_description = 'Organization'

# Registers the Software model
@admin.register(Software)
class SoftwareAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'platform', 'status', 'isCurrentVersion', 'lastUpdated')
    search_fields = ('name', 'version', 'platform')
    list_filter = ('platform', 'status', 'isCurrentVersion')
    ordering = ('name', '-version')