from django.contrib import admin
from django.utils.html import format_html
from .models import Patient, Doctor, Appointment

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'gender', 'created_at_formatted']
    list_filter = ['gender', 'created_at']
    search_fields = ['name', 'email']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('name', 'email', 'gender')
        }),
        ('Información Médica', {
            'fields': ('medical_history', 'allergies', 'emergency_contact')
        }),
        ('Sistema', {
            'fields': ('user', 'created_at'),
            'classes': ('collapse',)
        })
    )
    
    def created_at_formatted(self, obj):
        return obj.created_at.strftime("%d/%m/%Y %H:%M")
    created_at_formatted.short_description = 'Fecha de Registro'
    created_at_formatted.admin_order_field = 'created_at'

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialty', 'email', 'created_at_formatted']
    list_filter = ['specialty', 'created_at']
    search_fields = ['name', 'email', 'specialty']
    ordering = ['name']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('name', 'email')
        }),
        ('Información Profesional', {
            'fields': ('specialty',)
        }),
        ('Sistema', {
            'fields': ('user', 'created_at'),
            'classes': ('collapse',)
        })
    )
    
    def created_at_formatted(self, obj):
        return obj.created_at.strftime("%d/%m/%Y %H:%M")
    created_at_formatted.short_description = 'Fecha de Registro'

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient_name', 'doctor_name', 'date', 'time', 'status_badge', 'created_at_formatted']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['patient__name', 'doctor__name', 'reason', 'notes']
    ordering = ['-date', '-time']
    readonly_fields = ['created_at', 'guestId']
    
    fieldsets = (
        ('Información de la Cita', {
            'fields': ('patient', 'doctor', 'date', 'time', 'reason')
        }),
        ('Detalles', {
            'fields': ('status', 'location', 'notes')
        }),
        ('Sistema', {
            'fields': ('guestId', 'created_at'),
            'classes': ('collapse',)
        })
    )
    
    def patient_name(self, obj):
        return obj.patient.name if obj.patient else 'N/A'
    patient_name.short_description = 'Paciente'
    
    def doctor_name(self, obj):
        return obj.doctor.name if obj.doctor else 'N/A'
    doctor_name.short_description = 'Doctor'
    
    def status_badge(self, obj):
        colors = {
            'scheduled': '#17a2b8',  # azul
            'confirmed': '#28a745',  # verde
            'in-progress': '#ffc107', # amarillo
            'completed': '#6c757d',  # gris
            'cancelled': '#dc3545',  # rojo
            'no-show': '#6f42c1'     # morado
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'
    
    def created_at_formatted(self, obj):
        return obj.created_at.strftime("%d/%m/%Y %H:%M")
    created_at_formatted.short_description = 'Creada'
    
    # Acciones personalizadas
    actions = ['mark_as_confirmed', 'mark_as_cancelled', 'mark_as_completed']
    
    def mark_as_confirmed(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} citas confirmadas.')
    mark_as_confirmed.short_description = "Confirmar citas seleccionadas"
    
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} citas canceladas.')
    mark_as_cancelled.short_description = "Cancelar citas seleccionadas"
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} citas completadas.')
    mark_as_completed.short_description = "Marcar como completadas"

# Personalizar el título del admin
admin.site.site_header = "🏥 SaludPlus - Panel de Administración"
admin.site.site_title = "SaludPlus Admin"
admin.site.index_title = "Gestión del Sistema de Salud"
