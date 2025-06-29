from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, PatientViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet)
router.register(r'patients', PatientViewSet)

urlpatterns = router.urls