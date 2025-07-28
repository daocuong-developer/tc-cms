from django.core.management.base import BaseCommand
from authx.models import Permission, Role, User

class Command(BaseCommand):
    help = 'Setup initial permissions and roles'

    def handle(self, *args, **kwargs):
        # Create permissions
        permissions_data = [
            ('user:list', 'Can list users'),
            ('user:create', 'Can create users'),
            ('user:edit', 'Can edit users'),
            ('user:delete', 'Can delete users'),
            ('role:list', 'Can list roles'),
            ('role:create', 'Can create roles'),
            ('role:edit', 'Can edit roles'),
            ('role:delete', 'Can delete roles'),
        ]

        permissions = []
        for codename, description in permissions_data:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                defaults={'description': description}
            )
            permissions.append(permission)
            if created:
                self.stdout.write(f'Created permission: {codename}')

        # Create admin role
        admin_role, created = Role.objects.get_or_create(
            name='Admin',
            defaults={'description': 'Administrator with full access'}
        )
        if created:
            self.stdout.write('Created role: Admin')

        # Add all permissions to admin role
        admin_role.permissions.add(*permissions)
        self.stdout.write('Added all permissions to Admin role')

        # Get the superuser and assign admin role
        try:
            superuser = User.objects.get(username='thiennt')
            admin_role.users.add(superuser)
            self.stdout.write('Assigned Admin role to superuser')
        except User.DoesNotExist:
            self.stdout.write('Superuser not found')

        self.stdout.write(self.style.SUCCESS('Successfully set up initial roles and permissions'))
