from django.db import models
from django.contrib.auth.models import User

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    phone = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    # Puedes agregar más campos según tu necesidad

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Appointment(models.Model):
    patient_name = models.CharField(max_length=100)
    doctor_name = models.CharField(max_length=100)
    date = models.DateTimeField()
    status = models.CharField(max_length=20, default='scheduled')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.patient_name} - {self.date}"
