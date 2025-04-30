from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView, UserProfileView, AdminLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
]
