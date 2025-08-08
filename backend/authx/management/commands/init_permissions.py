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

class Command(BaseCommand):
    help = "Auto-generate CRUD permissions for all models"

    def handle(self, *args, **options):
        created_count = 0

        # Lặp qua toàn bộ model trong project
        for model in apps.get_models():
            app_label = model._meta.app_label
            model_name = model.__name__.lower()

            # Bỏ qua một số model hệ thống nếu không cần
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

        self.stdout.write(self.style.SUCCESS(f"✅ Done. {created_count} new permissions created."))
