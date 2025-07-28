# models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

# --- Existing User Model ---
class User(AbstractUser):
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # New fields for Organization and Department
    organization = models.ForeignKey(
        'Organization',  # Sử dụng chuỗi để tham chiếu model 'Organization' nếu nó được định nghĩa sau User
        on_delete=models.SET_NULL, # Khi Organization bị xóa, trường này sẽ là NULL
        null=True,
        blank=True,
        related_name='users'
    )
    department = models.ForeignKey(
        'Department', # Sử dụng chuỗi để tham chiếu model 'Department'
        on_delete=models.SET_NULL, # Khi Department bị xóa, trường này sẽ là NULL
        null=True,
        blank=True,
        related_name='users'
    )

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

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
    users = models.ManyToManyField(User, related_name='roles') # Giữ nguyên mối quan hệ này
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        ordering = ['name']

    def __str__(self):
        return self.name

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
        on_delete=models.CASCADE, # Khi Organization bị xóa, các Department của nó cũng bị xóa
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