from django.urls import path,  include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView


from .views import (
    CustomTokenObtainPairView, 
    UserViewSet, RoleViewSet, PermissionViewSet,
    OrganizationViewSet, DepartmentViewSet, 
    logout 
)

app_name = 'authx'
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'organizations', OrganizationViewSet) 
router.register(r'departments', DepartmentViewSet)   


urlpatterns = [
    # Authentication endpoints
    path('register/',  UserViewSet.as_view({'post': 'register'}), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', logout, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User endpoints
    # path('me/', views.me, name='me'),
    # path('users/', views.user_list, name='user_list'),
    path('', include(router.urls))  
]


