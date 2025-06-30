from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'doctors', views.DoctorViewSet)
router.register(r'appointments', views.AppointmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Autenticación
    path('auth/login/', views.AuthLoginView.as_view(), name='auth-login'),
    path('auth/register/', views.AuthRegisterView.as_view(), name='auth-register'),
    path('auth/register-form/', views.register_form_view, name='register-form'),
    path('auth/login-form/', views.login_form_view, name='login-form'),
    
    # Estadísticas
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Usuarios
    path('users/', views.UserListView.as_view(), name='user-list'),
]