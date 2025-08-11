from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Permission as CustomPermission
from django.contrib.auth.models import Permission as DjangoPermission
from django.contrib.auth import get_user_model
from datetime import datetime, timezone
from django.contrib.auth.models import update_last_login
from django.db import models 

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    OrganizationSerializer, DepartmentSerializer,
    RoleSerializer, PermissionSerializer, UserAuthSerializer, GroupSerializer, ContractSerializer, SoftwareSerialzer, CustomerSerializer
)
from .models import Role, Permission, Organization, Department, Group, Contract, Software, Customer
from .permissions import permission_required, IsSelfOrAdmin  


User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        update_last_login(None, user)
        
        # Cập nhật trạng thái online
        user.is_online = True
        user.save()

        # Tạo token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            'refresh': str(refresh),
            'access': access_token,
            'user': UserAuthSerializer(user).data,
        }, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.all().select_related('organization', 'department').prefetch_related('roles','groups')

    def get_permissions(self):
        if self.action in ['register', 'create']:
            return [AllowAny()]
        elif self.action == 'list':
            return [IsAdminUser()]
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSelfOrAdmin()] 
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserAuthSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserAuthSerializer(request.user)
        return Response(serializer.data)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by('name')
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser]


class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser]


    @action(detail=False, methods=['get'])
    def merged(self, request):
        
        # Lấy quyền custom từ bảng authx
        custom_perms = list(CustomPermission.objects.values(
            'id', 'codename', 'name', 'description', 'module', 'type'
        ))

        # Lấy quyền hệ thống Django
        system_perms = list(DjangoPermission.objects.values(
            'id',
            codename=models.F('codename'),
            name=models.F('name'),
            description=models.Value('', output_field=models.CharField()),  
            module=models.F('content_type__app_label'),
            type=models.Value('default', output_field=models.CharField())
        ))

        merged = {p['codename']: p for p in system_perms + custom_perms}
        return Response(list(merged.values()))
       

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('organization__name', 'name')
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Group.objects.all().order_by('organization__name', 'name')
        if user.organization:
            return Group.objects.filter(organization=user.organization).order_by('name')
        return Group.objects.none()
    

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all().order_by('name')
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('organization__name', 'name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.has_perm('authx.view_all_departments') or user.is_superuser:
            return Department.objects.all().order_by('organization__name', 'name')

        if user.organization:
            return Department.objects.filter(organization=user.organization).order_by('name')

        return Department.objects.none()

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.is_superuser or user.has_perm('authx.view_all_customers'):
            return Customer.objects.all()

        if user.organization:
            return Customer.objects.filter(organization=user.organization.name)
        
        return Customer.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()] 
        return [IsAuthenticated()]
    
class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class SoftwareViewSet(viewsets.ModelViewSet):
    queryset = Software.objects.all()
    serializer_class = SoftwareSerialzer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()

        user = request.user
        user.is_online = False
        user.last_logout = datetime.now(timezone.utc)
        user.save()

        return Response({"detail": "Successfully logged out."})
    except Exception:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
