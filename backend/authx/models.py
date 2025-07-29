from django.contrib.auth.models import AbstractUser
from django.db import models

# --- NEW: Organization Model ---
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

# --- NEW: Department Model ---
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
    
    
class User(AbstractUser):
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

   
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
    
# --- Existing Permission Model ---
class Permission(models.Model):
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
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
