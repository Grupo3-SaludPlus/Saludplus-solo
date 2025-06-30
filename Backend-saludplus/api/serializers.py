from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Patient, Doctor, Appointment, DoctorSchedule

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']

class PatientSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source='user', read_only=True)
    total_appointments = serializers.SerializerMethodField()
    pending_appointments = serializers.SerializerMethodField()
    next_appointment_date = serializers.SerializerMethodField()
    age_group = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'email', 'phone', 'age', 'gender', 'address',
            'medical_history', 'allergies', 'emergency_contact', 'priority_level',
            'is_active', 'created_at', 'updated_at', 'user_info',
            'total_appointments', 'pending_appointments', 'next_appointment_date', 'age_group'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_total_appointments(self, obj):
        return obj.get_total_appointments()
    
    def get_pending_appointments(self, obj):
        return obj.get_pending_appointments()
    
    def get_next_appointment_date(self, obj):
        next_apt = obj.get_next_appointment()
        return next_apt.date if next_apt else None
    
    def get_age_group(self, obj):
        if not obj.age:
            return "No especificado"
        if obj.age < 18:
            return "Menor de edad"
        elif obj.age < 65:
            return "Adulto"
        else:
            return "Adulto mayor"
    
    def validate_email(self, value):
        if Patient.objects.filter(email=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value
    
    def validate_age(self, value):
        if value is not None and (value < 0 or value > 120):
            raise serializers.ValidationError("La edad debe estar entre 0 y 120 años.")
        return value

class DoctorSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source='user', read_only=True)
    total_appointments = serializers.SerializerMethodField()
    appointments_today = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    specialty_display = serializers.CharField(source='get_specialty_display', read_only=True)
    availability_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'name', 'email', 'phone', 'specialty', 'specialty_display',
            'license_number', 'experience_years', 'education', 'consultation_fee',
            'is_available', 'rating', 'created_at', 'updated_at', 'user_info',
            'total_appointments', 'appointments_today', 'average_rating', 'availability_status'
        ]
        read_only_fields = ['created_at', 'updated_at', 'rating']
    
    def get_total_appointments(self, obj):
        return obj.get_total_appointments()
    
    def get_appointments_today(self, obj):
        return obj.get_appointments_today()
    
    def get_average_rating(self, obj):
        return round(obj.get_average_rating(), 2)
    
    def get_availability_status(self, obj):
        if not obj.is_available:
            return "No disponible"
        
        today_appointments = obj.get_appointments_today()
        if today_appointments == 0:
            return "Completamente disponible"
        elif today_appointments < 5:
            return "Parcialmente disponible"
        else:
            return "Ocupado"
    
    def validate_license_number(self, value):
        if Doctor.objects.filter(license_number=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("Este número de licencia ya está registrado.")
        return value
    
    def validate_experience_years(self, value):
        if value < 0 or value > 60:
            raise serializers.ValidationError("Los años de experiencia deben estar entre 0 y 60.")
        return value

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    doctor_specialty = serializers.CharField(source='doctor.specialty', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    type_display = serializers.CharField(source='get_appointment_type_display', read_only=True)
    is_today = serializers.SerializerMethodField()
    is_past_due = serializers.SerializerMethodField()
    time_until = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    duration_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'doctor_specialty',
            'date', 'time', 'reason', 'appointment_type', 'type_display',
            'status', 'status_display', 'priority', 'priority_display',
            'notes', 'patient_notes', 'location', 'duration_minutes', 'duration_hours',
            'diagnosis', 'treatment', 'prescription', 'rating',
            'guestId', 'created_at', 'updated_at',
            'is_today', 'is_past_due', 'time_until', 'can_cancel'
        ]
        read_only_fields = ['created_at', 'updated_at', 'guestId']
    
    def get_is_today(self, obj):
        return obj.is_today()
    
    def get_is_past_due(self, obj):
        return obj.is_past_due()
    
    def get_time_until(self, obj):
        delta = obj.time_until_appointment()
        if delta.total_seconds() > 0:
            hours = int(delta.total_seconds() // 3600)
            minutes = int((delta.total_seconds() % 3600) // 60)
            return f"{hours}h {minutes}m"
        return "Cita pasada"
    
    def get_can_cancel(self, obj):
        return obj.can_be_cancelled()
    
    def get_duration_hours(self, obj):
        return obj.get_duration_hours()
    
    def validate(self, data):
        """Validaciones complejas que involucran múltiples campos"""
        from datetime import datetime, time
        
        # Validar que la fecha no sea en el pasado
        if data.get('date') and data['date'] < datetime.now().date():
            raise serializers.ValidationError("No se pueden crear citas en fechas pasadas.")
        
        # Validar horario de trabajo
        appointment_time = data.get('time')
        if appointment_time and (appointment_time.hour < 8 or appointment_time.hour >= 18):
            raise serializers.ValidationError("Las citas solo pueden ser entre 8:00 y 18:00.")
        
        # Validar que el doctor esté disponible
        doctor = data.get('doctor')
        if doctor and not doctor.is_available:
            raise serializers.ValidationError("El doctor seleccionado no está disponible.")
        
        # Validar conflictos de horario (solo para creación/actualización)
        if data.get('doctor') and data.get('date') and data.get('time'):
            existing_appointments = Appointment.objects.filter(
                doctor=data['doctor'],
                date=data['date'],
                time=data['time'],
                status__in=['scheduled', 'confirmed']
            )
            
            # Excluir la cita actual si estamos actualizando
            if self.instance:
                existing_appointments = existing_appointments.exclude(id=self.instance.id)
            
            if existing_appointments.exists():
                raise serializers.ValidationError("El doctor ya tiene una cita programada en ese horario.")
        
        return data
    
    def validate_rating(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5.")
        return value

class DoctorScheduleSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)
    
    class Meta:
        model = DoctorSchedule
        fields = [
            'id', 'doctor', 'doctor_name', 'weekday', 'weekday_display',
            'start_time', 'end_time', 'is_active'
        ]
    
    def validate(self, data):
        if data.get('start_time') and data.get('end_time'):
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError("La hora de inicio debe ser anterior a la hora de fin.")
        return data

# Serializers especializados para casos específicos
class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer simplificado para crear citas"""
    
    class Meta:
        model = Appointment
        fields = [
            'patient', 'doctor', 'date', 'time', 'reason',
            'appointment_type', 'priority', 'location', 'patient_notes'
        ]
    
    def validate(self, data):
        # Reutilizar las validaciones del serializer principal
        return AppointmentSerializer().validate(data)

class AppointmentUpdateStatusSerializer(serializers.ModelSerializer):
    """Serializer para actualizar solo el estado de citas"""
    
    class Meta:
        model = Appointment
        fields = ['status', 'notes']
    
    def validate_status(self, value):
        # Validar transiciones de estado válidas
        if self.instance:
            current_status = self.instance.status
            valid_transitions = {
                'scheduled': ['confirmed', 'cancelled'],
                'confirmed': ['in-progress', 'cancelled', 'no-show'],
                'in-progress': ['completed'],
                'completed': [],  # No se puede cambiar desde completado
                'cancelled': [],  # No se puede cambiar desde cancelado
                'no-show': []     # No se puede cambiar desde no-show
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"No se puede cambiar de '{current_status}' a '{value}'."
                )
        
        return value

class PatientSummarySerializer(serializers.ModelSerializer):
    """Serializer para resumen de paciente"""
    next_appointment = serializers.SerializerMethodField()
    recent_appointments = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'email', 'age', 'gender',
            'total_appointments', 'pending_appointments',
            'next_appointment', 'recent_appointments'
        ]
    
    def get_next_appointment(self, obj):
        next_apt = obj.get_next_appointment()
        if next_apt:
            return {
                'id': next_apt.id,
                'date': next_apt.date,
                'time': next_apt.time,
                'doctor_name': next_apt.doctor.name,
                'reason': next_apt.reason
            }
        return None
    
    def get_recent_appointments(self, obj):
        recent = obj.appointment_set.filter(
            status='completed'
        ).order_by('-date')[:3]
        
        return [{
            'date': apt.date,
            'doctor_name': apt.doctor.name,
            'diagnosis': apt.diagnosis
        } for apt in recent]