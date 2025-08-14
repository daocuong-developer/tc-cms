from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import Permission, Role, Organization, Department, Group, Contract, Software, Customer
from django.db.models import Count
from rest_framework.validators import ValidationError

User = get_user_model()

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(), source='organization', write_only=True
    )

    class Meta:
        model = Department
        fields = '__all__'

class DepartmentNestedSerializer(serializers.ModelSerializer):
    organization = serializers.CharField(source='organization.name', read_only=True)
    class Meta:
        model = Department
        fields = ['id', 'name', 'organization']

class GroupSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(), source='organization', write_only=True
    )

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'organization', 'organization_id']

class GroupNestedSerializer(serializers.ModelSerializer):
    organization = serializers.CharField(source='organization.name', read_only=True)
    class Meta:
        model = Group
        fields = ['id', 'name', 'organization']

class PermissionSerializer(serializers.ModelSerializer):
    is_default = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = ['id', 'name', 'module', 'description', 'type', 'codename', 'is_default']
        extra_fields = ['is_default']

    def get_is_default(self, obj):
        default_prefixes = ("add_", "change_", "delete_", "view_")
        return obj.codename.startswith(default_prefixes)
    
class RoleSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), source='permissions', write_only=True
    )
    user_count = serializers.SerializerMethodField()
    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'permission_ids', 'user_count']
    def get_user_count(self, obj):
        return obj.users.count()

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'customerName', 'email', 'phone', 'deviceName', 'organization']

class ContractSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )

    customer_device_name = serializers.CharField(source='customer.deviceName', read_only=True)
    customer_organization = serializers.CharField(source='customer.organization', read_only=True)
    class Meta:
        model = Contract
        fields = ['id', 'timesMarked', 'startDate', 'endDate', 'status', 
                  'customer', 'customer_id', 'customer_device_name', 'customer_organization']
        
class SoftwareSerialzer(serializers.ModelSerializer):
    class Meta:
        model = Software
        fields = '__all__'

class UserNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'username']

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSimpleSerializer(many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Role.objects.all(), source='roles', write_only=True, required=False
    )

    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(), source='organization', write_only=True, required=False, allow_null=True
    )

    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department', write_only=True, required=False, allow_null=True
    )

    groups = GroupSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all(), source='groups', write_only=True, required=False
    )

    is_active = serializers.BooleanField(read_only=True)
    is_online = serializers.BooleanField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)
    last_logout = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'username', 'is_staff', 'is_superuser',
                  'last_login', 'is_active', 'is_online', 'last_logout',
                  'roles', 'role_ids', 'organization', 'organization_id',
                  'department', 'department_id', 'groups', 'group_ids']
        read_only_fields = ['id', 'last_login', 'is_active', 'is_online']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': True},
        }

    def validate(self, attrs):
        # Lấy organization từ dữ liệu mới hoặc từ instance hiện tại (trường hợp update)
        organization = attrs.get('organization') or getattr(self.instance, 'organization', None)
        department = attrs.get('department') or getattr(self.instance, 'department', None)

        if organization and department:
            if department.organization != organization:
                raise serializers.ValidationError({
                    'department_id': 'Department does not belong to the selected organization.'
                })
        return attrs

    def create(self, validated_data):
        roles_data = validated_data.pop('roles', [])
        groups_data = validated_data.pop('groups', [])
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password is not None:
            user.set_password(password)
        user.save()
        user.roles.set(roles_data)
        user.groups.set(groups_data)
        return user

    def update(self, instance, validated_data):
        roles_data = validated_data.pop('roles', None)
        groups_data = validated_data.pop('groups', None)
        password = validated_data.pop('password', None)

        instance.email = validated_data.get('email', instance.email)
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.username = validated_data.get('username', instance.username)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.is_superuser = validated_data.get('is_superuser', instance.is_superuser)

        if 'department' in validated_data:
            instance.department = validated_data['department']
        if 'organization' in validated_data:
            instance.organization = validated_data['organization']

        if password:
            instance.set_password(password)

        instance.save()

        if roles_data is not None:
            instance.roles.set(roles_data)

        if groups_data is not None:
            instance.groups.set(groups_data)
            
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'password_confirm', 'username']
        extra_kwargs = {
            'username': {'required': False}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = validated_data['email']

        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)

            if not user:
                raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')
        else:
            raise serializers.ValidationError('Must include "email" and "password".', code='authorization')

        attrs['user'] = user
        return attrs

class UserAuthSerializer(serializers.ModelSerializer):
    roles = RoleSimpleSerializer(many=True, read_only=True)
    organization = OrganizationSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    permissions = serializers.SerializerMethodField()

    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_online = serializers.BooleanField(read_only=True)
    last_logout = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'is_staff', 'is_superuser',
                  'last_login', 'is_active', 'is_online', 'last_logout',
                  'roles', 'organization', 'department', 'permissions')

    def get_permissions(self, obj):
        return obj.get_all_permissions_codename()
