from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'patients',   views.PatientViewSet,   basename='patient')
router.register(r'doctors',    views.DoctorViewSet,    basename='doctor')
router.register(r'appointments',views.AppointmentViewSet,basename='appointment')

urlpatterns = [
    path('', include(router.urls)),

    # Estadísticas
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Registro y login custom
    path('auth/register/', views.AuthRegisterView.as_view(), name='register'),
    path('auth/login/',    views.AuthLoginView.as_view(),    name='login'),
    path('auth/token/',    obtain_auth_token,                name='api_token_auth'),

    # Testing y debug
    path('create-test-data/', views.CreateTestDataView.as_view(), name='create_test_data'),
    path('debug/patient-fields/', views.DebugPatientFieldsView.as_view(), name='debug_patient_fields'),
]