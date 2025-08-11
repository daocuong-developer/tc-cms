from django.apps import AppConfig
from django.db.models.signals import post_migrate

# --- Gộp Permisson --- 
def sync_permissions(sender, **kwargs):
    from django.contrib.auth.models import Permission as DjangoPermission
    from .models import Permission as CustomPermission  

    for p in DjangoPermission.objects.select_related('content_type').all():
        CustomPermission.objects.update_or_create(
            codename=p.codename,
            defaults={
                'name': p.name,
                'description': '',
                'module': p.content_type.app_label,
                'type': 'system',
            }
        )

class AuthxConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authx'  

    def ready(self):
        post_migrate.connect(sync_permissions, sender=self)
