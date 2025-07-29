from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import Permission, Role, Organization, Department

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

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'codename', 'description']

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), source='permissions', write_only=True
    ) 

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'permission_ids']

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
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
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'username', 'is_staff', 'is_superuser',
                  'roles', 'role_ids', 'organization', 'organization_id',
                  'department', 'department_id']
        read_only_fields = ['id']
        extra_kwargs = {
            'username': {'required': False}, 
            'email': {'required': True}, 
        }

    # Custom create method để xử lý password và roles
    def create(self, validated_data):
        roles_data = validated_data.pop('roles', []) 
        password = validated_data.pop('password', None) 
        user = User(**validated_data)
        if password is not None:
            user.set_password(password)
        user.save()
        user.roles.set(roles_data) 
        return user

    # Custom update method để xử lý password và roles
    def update(self, instance, validated_data):
        roles_data = validated_data.pop('roles', None) 
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password is not None:
            instance.set_password(password)
        
        instance.save()
        
        if roles_data is not None: 
            instance.roles.set(roles_data)
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        queryset = Organization.objects.all(), source = 'organization', write_only = True, required = True, allow_null=True
     )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset = Department.objects.all(), source='department', write_only =True, required=True, allow_null=True
    )

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'password_confirm', 'username', 'organization_id', 'department_id']
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
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Must include "email" and "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs


# NEW: Serializer để trả về User và Permissions của họ sau khi đăng nhập
class UserAuthSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    organization = OrganizationSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    permissions = serializers.SerializerMethodField() 
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'is_staff', 'is_superuser',
                  'roles', 'organization', 'department', 'permissions')

    def get_permissions(self, obj):
        return obj.get_all_permissions_codename()