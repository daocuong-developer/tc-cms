
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    OrganizationSerializer, DepartmentSerializer,
    RoleSerializer, PermissionSerializer, UserAuthSerializer
)

from .permissions import permission_required
from .models import Role, Permission, Organization, Department 

User = get_user_model()
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
    
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user'] 

         # Cập nhật trạng thái online khi đăng nhập thành công
        user.is_online = True
        user.save()

        # Tạo token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Trả về response
        return Response({
            'refresh': str(refresh),
            'access': access_token,
            'user': UserAuthSerializer(user).data, 
        }, status=status.HTTP_200_OK)
    
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('organization', 'department').prefetch_related('roles', 'roles__permissions').order_by('email')
    # queryset = User.objects.all().order_by('email')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] 

    def get_permissions(self):
        if self.action in ['register', 'create']:
            return [AllowAny()]
        elif self.action in ['list']:
            return [IsAdminUser()]
        elif self.action in ['retrieve', 'me']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            if self.request.user.is_superuser or (self.request.user == self.get_object()):
                return [IsAuthenticated()]
            return [IsAdminUser()]
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

# NEW: ViewSet cho Role
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by('name')
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser] 

# NEW: ViewSet cho Permission
class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all().order_by('codename')
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser] 

# NEW: ViewSet cho Organization
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all().order_by('name')
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated] 

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

# NEW: ViewSet cho Department
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
        if user.is_superuser:
            return Department.objects.all().order_by('organization__name', 'name')
        if user.organization:
            return Department.objects.filter(organization=user.organization).order_by('name')
        return Department.objects.none() 

# Existing logout view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()

        # Cập nhật trạng thái online khi đăng xuất
        user = request.user
        user.is_online = False
        user.save()

        return Response({"detail": "Successfully logged out."})
    except Exception:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
    
