from django.contrib.auth.models import AbstractUser
from django.db import models

# --- Organization Model ---
class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
        ordering = ['name']

    def __str__(self):
        return self.name

# ---  Department Model ---
class Department(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE, 
        related_name='departments'
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        unique_together = ('name', 'organization') 
        ordering = ['organization__name', 'name']

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

# ---  Group Model ---
class Group(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='groups'
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Group'
        verbose_name_plural = 'Groups'
        unique_together = ('name', 'organization')
        ordering = ['organization__name', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.organization.name})"
    
# --- User ---
class User(AbstractUser):
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    is_online = models.BooleanField(default=False)
    last_logout = models.DateTimeField(null=True, blank=True)
    
    organization = models.ForeignKey(
        'Organization',  
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    
    department = models.ForeignKey(
        'Department', 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='users'
    )

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email
    
    def get_all_permissions_codename(self):
        """
        Trả về danh sách tất cả các codename quyền mà người dùng có
        thông qua các vai trò của họ.
        """
        permissions = set() 
        for role in self.roles.all():
            for perm in role.permissions.all():
                permissions.add(perm.codename)
        return list(permissions) 
    
    def has_perm(self, perm, obj=None):
        """
        Kiểm tra xem người dùng có quyền cụ thể hay không,
        bao gồm cả quyền từ các vai trò tùy chỉnh.
        """
        if self.is_superuser:
            return True
            
        try:
            app_label, codename = perm.split('.')
        except ValueError:
            return False

        user_permissions_codenames = self.get_all_permissions_codename()
        
        return codename in user_permissions_codenames

    def has_perms(self, perm_list, obj=None):
        return all(self.has_perm(perm, obj) for perm in perm_list)

    def get_all_permissions_codename(self):
        permissions = set() 
        for role in self.roles.all():
            for perm in role.permissions.all():
                permissions.add(perm.codename)
        return list(permissions)
    
# --- Existing Permission Model ---
class Permission(models.Model):
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    name = models.CharField(max_length=255, blank=True)
    module = models.CharField(max_length=255, blank=True)
    type = models.CharField(max_length=50, blank=True)
    
    # Other fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
        ordering = ['codename']

    def __str__(self):
        return self.codename
    
    
# --- Existing Role Model ---
class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, related_name='roles')
    users = models.ManyToManyField(User, related_name='roles') 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        ordering = ['name']

    def __str__(self):
        return self.name
