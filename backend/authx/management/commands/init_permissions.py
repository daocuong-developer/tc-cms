from django.core.management.base import BaseCommand
from django.apps import apps
from authx.models import Permission

# Các loại quyền mặc định
CRUD_ACTIONS = [
    ("create", "Create"),
    ("view", "View"),
    ("update", "Update"),
    ("delete", "Delete"),
]

# Các quyền tùy chỉnh
CUSTOM_PERMISSIONS = [
    {
        "codename": "can_share_role",
        "name": "Can share role",
        "module": "role",
        "type": "custom",
        "description": "Permission to share roles with other users"
    },
    # Thêm các quyền tùy chỉnh khác vào đây nếu cần
]

class Command(BaseCommand):
    help = "Auto-generate CRUD and custom permissions for all models"

    def handle(self, *args, **options):
        created_count = 0

        # Tạo quyền CRUD
        for model in apps.get_models():
            app_label = model._meta.app_label
            model_name = model.__name__.lower()

            if model_name in ["permission", "role"]:
                continue

            for action_code, action_name in CRUD_ACTIONS:
                codename = f"{model_name}:{action_code}"
                name = f"{action_name} {model.__name__}"

                perm, created = Permission.objects.get_or_create(
                    codename=codename,
                    defaults={
                        "name": name,
                        "module": model_name,
                        "type": action_code,
                        "description": f"{action_name} {model.__name__} permission"
                    }
                )

                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"Created permission: {codename}"))
                else:
                    self.stdout.write(self.style.WARNING(f"Permission already exists: {codename}"))

        # Tạo quyền tùy chỉnh
        for perm_data in CUSTOM_PERMISSIONS:
            perm, created = Permission.objects.get_or_create(
                codename=perm_data["codename"],
                defaults=perm_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created custom permission: {perm_data['codename']}"))
            else:
                self.stdout.write(self.style.WARNING(f"Custom permission already exists: {perm_data['codename']}"))

        self.stdout.write(self.style.SUCCESS(f"✅ Done. {created_count} new permissions created."))