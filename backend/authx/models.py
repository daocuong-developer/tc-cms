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

    # NEW: Thêm trường để theo dõi trạng thái online và thời gian đăng xuất
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
        # Nếu là superuser, luôn có tất cả quyền
        if self.is_superuser:
            return True
            
        # Tách quyền ra thành app_label và codename
        try:
            app_label, codename = perm.split('.')
        except ValueError:
            return False

        # Lấy tất cả các codename quyền từ các vai trò của người dùng
        user_permissions_codenames = self.get_all_permissions_codename()
        
        # Kiểm tra xem codename quyền đó có trong danh sách không
        return codename in user_permissions_codenames

    # Thêm hàm này để tích hợp với các hệ thống permission mặc định của Django
    def has_perms(self, perm_list, obj=None):
        return all(self.has_perm(perm, obj) for perm in perm_list)

    # Hàm bạn đã viết để lấy tất cả các codename quyền từ các vai trò của họ
    def get_all_permissions_codename(self):
        permissions = set() 
        for role in self.roles.all():
            for perm in role.permissions.all():
                permissions.add(perm.codename)
        return list(permissions)
    
# --- Existing Permission Model ---
class Permission(models.Model):
    # Old fields
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # New fields to be added
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
