from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
# ✅ COMENTAR TEMPORALMENTE: Estas rutas del router causan conflicto
# router.register(r'patients', views.PatientViewSet)
# router.register(r'doctors', views.DoctorViewSet)
# router.register(r'appointments', views.AppointmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Estadísticas
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Registro y login custom
    path('auth/register/', views.AuthRegisterView.as_view(), name='register'),
    path('auth/login/',    views.AuthLoginView.as_view(),    name='login'),
    # TokenAuth si lo quieres también
    path('auth/token/',    obtain_auth_token,          name='api_token_auth'),

    # Usuarios
    path('users/', views.UserListView.as_view(), name='user-list'),

    # ✅ RUTAS PRINCIPALES para el API Tester y Dashboard
    path('patients/', views.PatientListView.as_view(), name='patient_list'),
    path('doctors/', views.DoctorListView.as_view(), name='doctor_list'),
    
    # ✅ OPCIÓN 1: Una vista que maneja GET y POST
    #path('appointments/', views.AppointmentCreateView.as_view(), name='appointments'),
    
    # ✅ OPCIÓN 2: Vistas separadas (comentar la línea de arriba y usar estas)
    path('appointments/', views.AppointmentListView.as_view(), name='appointment_list'),
    path('appointments/create/', views.AppointmentCreateView.as_view(), name='appointment_create'),
    
    path('appointments/<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment_detail'),

    # Testing y debug
    path('create-test-data/', views.CreateTestDataView.as_view(), name='create_test_data'),
    path('debug/patient-fields/', views.DebugPatientFieldsView.as_view(), name='debug_patient_fields'),
]