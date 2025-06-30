from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta
import uuid

class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'), 
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100, verbose_name="Nombre Completo")
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, verbose_name="Teléfono")
    age = models.PositiveIntegerField(validators=[MinValueValidator(0), MaxValueValidator(120)], null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='O')
    address = models.TextField(blank=True, verbose_name="Dirección")
    medical_history = models.TextField(blank=True, verbose_name="Historia Médica")
    allergies = models.TextField(blank=True, verbose_name="Alergias")
    emergency_contact = models.CharField(max_length=200, blank=True, verbose_name="Contacto de Emergencia")
    priority_level = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
    
    def __str__(self):
        return self.name
    
    def get_total_appointments(self):
        """Calcula el total de citas del paciente"""
        return self.appointment_set.count()
    
    def get_pending_appointments(self):
        """Obtiene citas pendientes"""
        return self.appointment_set.filter(
            status__in=['scheduled', 'confirmed']
        ).count()
    
    def get_next_appointment(self):
        """Obtiene la próxima cita"""
        return self.appointment_set.filter(
            status__in=['scheduled', 'confirmed'],
            date__gte=datetime.now().date()
        ).order_by('date', 'time').first()
    
    def clean(self):
        """Validaciones personalizadas"""
        if self.age and self.age < 0:
            raise ValidationError("La edad no puede ser negativa")
        if self.email and User.objects.filter(email=self.email).exclude(patient=self).exists():
            raise ValidationError("Este email ya está registrado")

class Doctor(models.Model):
    SPECIALTY_CHOICES = [
        ('general', 'Medicina General'),
        ('cardiology', 'Cardiología'),
        ('neurology', 'Neurología'),
        ('pediatrics', 'Pediatría'),
        ('psychiatry', 'Psiquiatría'),
        ('orthopedics', 'Traumatología'),
        ('dermatology', 'Dermatología'),
        ('gynecology', 'Ginecología'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100, verbose_name="Nombre Completo")
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    specialty = models.CharField(max_length=50, choices=SPECIALTY_CHOICES)
    license_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Número de Licencia")  # Temporalmente permitir null
    experience_years = models.PositiveIntegerField(default=0, verbose_name="Años de Experiencia")
    education = models.TextField(blank=True, verbose_name="Educación")
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_available = models.BooleanField(default=True, verbose_name="Disponible")
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Doctor"
        verbose_name_plural = "Doctores"
    
    def __str__(self):
        return f"Dr. {self.name} - {self.get_specialty_display()}"
    
    def get_total_appointments(self):
        """Total de citas del doctor"""
        return self.appointment_set.count()
    
    def get_appointments_today(self):
        """Citas de hoy"""
        return self.appointment_set.filter(date=datetime.now().date()).count()
    
    def get_average_rating(self):
        """Promedio de calificaciones"""
        ratings = self.appointment_set.filter(
            rating__isnull=False
        ).aggregate(models.Avg('rating'))
        return ratings['rating__avg'] or 0
    
    def get_next_available_slot(self):
        """Próximo horario disponible"""
        # Lógica para encontrar el próximo slot disponible
        today = datetime.now().date()
        busy_slots = self.appointment_set.filter(
            date__gte=today,
            status__in=['scheduled', 'confirmed']
        ).values_list('date', 'time')
        
        # Retornar el primer slot libre (simplificado)
        return today + timedelta(days=1)

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Programada'),
        ('confirmed', 'Confirmada'),
        ('in-progress', 'En Progreso'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
        ('no-show', 'No se presentó'),
        ('rescheduled', 'Reprogramada'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    TYPE_CHOICES = [
        ('consultation', 'Consulta'),
        ('follow_up', 'Seguimiento'),
        ('emergency', 'Emergencia'),
        ('routine', 'Rutina'),
    ]
    
    # Relaciones
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, verbose_name="Paciente")
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, verbose_name="Doctor")
    
    # Información básica
    date = models.DateField(verbose_name="Fecha")
    time = models.TimeField(verbose_name="Hora")
    reason = models.TextField(verbose_name="Motivo de la consulta")
    appointment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='consultation')
    
    # Estado y prioridad
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Información adicional
    notes = models.TextField(blank=True, verbose_name="Notas del doctor")
    patient_notes = models.TextField(blank=True, verbose_name="Notas del paciente")
    location = models.CharField(max_length=200, blank=True, verbose_name="Ubicación")
    duration_minutes = models.PositiveIntegerField(default=30, verbose_name="Duración (minutos)")
    
    # Seguimiento
    diagnosis = models.TextField(blank=True, verbose_name="Diagnóstico")
    treatment = models.TextField(blank=True, verbose_name="Tratamiento")
    prescription = models.TextField(blank=True, verbose_name="Prescripción")
    rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Sistema
    guestId = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['doctor', 'date', 'time']
        ordering = ['-date', '-time']
        verbose_name = "Cita Médica"
        verbose_name_plural = "Citas Médicas"
    
    def __str__(self):
        return f"{self.patient.name} - Dr. {self.doctor.name} ({self.date} {self.time})"
    
    def get_duration_hours(self):
        """Duración en horas"""
        return self.duration_minutes / 60
    
    def is_today(self):
        """Verifica si la cita es hoy"""
        return self.date == datetime.now().date()
    
    def is_past_due(self):
        """Verifica si la cita ya pasó"""
        now = datetime.now()
        appointment_datetime = datetime.combine(self.date, self.time)
        return appointment_datetime < now
    
    def time_until_appointment(self):
        """Tiempo restante hasta la cita"""
        now = datetime.now()
        appointment_datetime = datetime.combine(self.date, self.time)
        if appointment_datetime > now:
            return appointment_datetime - now
        return timedelta(0)
    
    def can_be_cancelled(self):
        """Verifica si puede ser cancelada (24h antes)"""
        now = datetime.now()
        appointment_datetime = datetime.combine(self.date, self.time)
        return appointment_datetime - now > timedelta(hours=24)
    
    def clean(self):
        """Validaciones personalizadas"""
        # Validar que la fecha no sea en el pasado
        if self.date < datetime.now().date():
            raise ValidationError("No se pueden crear citas en fechas pasadas")
        
        # Validar horario de trabajo (8:00 - 18:00)
        if self.time.hour < 8 or self.time.hour >= 18:
            raise ValidationError("Las citas solo pueden ser entre 8:00 y 18:00")
        
        # Validar que el doctor esté disponible
        if not self.doctor.is_available:
            raise ValidationError("El doctor no está disponible")

# Modelo adicional para horarios de doctores
class DoctorSchedule(models.Model):
    WEEKDAY_CHOICES = [
        (0, 'Lunes'),
        (1, 'Martes'),
        (2, 'Miércoles'),
        (3, 'Jueves'),
        (4, 'Viernes'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='schedules')
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['doctor', 'weekday']
        verbose_name = "Horario del Doctor"
        verbose_name_plural = "Horarios de Doctores"
    
    def __str__(self):
        return f"Dr. {self.doctor.name} - {self.get_weekday_display()}"
