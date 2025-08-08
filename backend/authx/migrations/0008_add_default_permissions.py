from django.db import migrations

def add_default_permissions(apps, schema_editor):
    Permission = apps.get_model('authx', 'Permission')  
    models_to_add = [
        "user",
        "department",
        "group",
        "role",
        "organization",
    ]
    default_types = ["add", "change", "delete", "view"]

    for model in models_to_add:
        for perm_type in default_types:
            codename = f"{perm_type}_{model}"
            if not Permission.objects.filter(codename=codename).exists():
                Permission.objects.create(
                    codename=codename,
                    name=f"{perm_type.capitalize()} {model.capitalize()}",
                    description=f"{perm_type.capitalize()} {model.capitalize()} permission",
                    module=model,
                    type=perm_type
                )

def remove_default_permissions(apps, schema_editor):
    Permission = apps.get_model('authx', 'Permission')
    models_to_remove = [
        "user",
        "department",
        "group",
        "role",
        "organization",
    ]
    default_types = ["add", "change", "delete", "view"]

    for model in models_to_remove:
        for perm_type in default_types:
            codename = f"{perm_type}_{model}"
            Permission.objects.filter(codename=codename).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('authx', '0007_group'),
    ]

    operations = [
        migrations.RunPython(add_default_permissions, remove_default_permissions),
    ]
