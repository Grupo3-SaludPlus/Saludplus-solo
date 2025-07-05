from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.shortcuts import render
from django.db.models import Q, Count, Avg
from datetime import datetime, timedelta
from .models import Patient, Doctor, Appointment, DoctorSchedule
from .serializers import PatientSerializer, DoctorSerializer, AppointmentSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'priority_level', 'is_active']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at', 'age']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """Obtener todas las citas de un paciente"""
        patient = self.get_object()
        appointments = patient.appointment_set.all().order_by('-date', '-time')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def medical_summary(self, request, pk=None):
        """Resumen médico del paciente"""
        patient = self.get_object()
        total_appointments = patient.get_total_appointments()
        pending_appointments = patient.get_pending_appointments()
        next_appointment = patient.get_next_appointment()
        
        return Response({
            'patient': PatientSerializer(patient).data,
            'statistics': {
                'total_appointments': total_appointments,
                'pending_appointments': pending_appointments,
                'completed_appointments': total_appointments - pending_appointments,
            },
            'next_appointment': AppointmentSerializer(next_appointment).data if next_appointment else None
        })

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialty', 'is_available']
    search_fields = ['name', 'email', 'specialty']
    ordering_fields = ['name', 'rating', 'experience_years']
    ordering = ['name']
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """Obtener horario del doctor"""
        doctor = self.get_object()
        date_str = request.query_params.get('date', datetime.now().date())
        
        if isinstance(date_str, str):
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                date = datetime.now().date()
        else:
            date = date_str
            
        appointments = doctor.appointment_set.filter(
            date=date,
            status__in=['scheduled', 'confirmed']
        ).order_by('time')
        
        return Response({
            'doctor': DoctorSerializer(doctor).data,
            'date': date,
            'appointments': AppointmentSerializer(appointments, many=True).data,
            'total_appointments_today': doctor.get_appointments_today()
        })
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Estadísticas del doctor"""
        doctor = self.get_object()
        
        return Response({
            'doctor': DoctorSerializer(doctor).data,
            'statistics': {
                'total_appointments': doctor.get_total_appointments(),
                'appointments_today': doctor.get_appointments_today(),
                'average_rating': doctor.get_average_rating(),
                'next_available_slot': doctor.get_next_available_slot()
            }
        })

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'appointment_type', 'date']
    search_fields = ['patient__name', 'doctor__name', 'reason']
    ordering_fields = ['date', 'time', 'created_at']
    ordering = ['-date', '-time']
    
    def get_queryset(self):
        queryset = Appointment.objects.all()
        
        # Filtros adicionales por query params
        status = self.request.query_params.get('status', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        doctor_id = self.request.query_params.get('doctor', None)
        patient_id = self.request.query_params.get('patient', None)
        
        if status:
            queryset = queryset.filter(status=status)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmar una cita"""
        appointment = self.get_object()
        
        if appointment.status != 'scheduled':
            return Response(
                {'error': 'Solo se pueden confirmar citas programadas'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'confirmed'
        appointment.save()
        
        return Response({
            'message': 'Cita confirmada exitosamente',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancelar una cita"""
        appointment = self.get_object()
        
        if not appointment.can_be_cancelled():
            return Response(
                {'error': 'No se puede cancelar una cita con menos de 24 horas de anticipación'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        return Response({
            'message': 'Cita cancelada exitosamente',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Completar una cita con diagnóstico"""
        appointment = self.get_object()
        
        if appointment.status not in ['confirmed', 'in-progress']:
            return Response(
                {'error': 'Solo se pueden completar citas confirmadas o en progreso'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar información médica
        appointment.status = 'completed'
        appointment.diagnosis = request.data.get('diagnosis', '')
        appointment.treatment = request.data.get('treatment', '')
        appointment.prescription = request.data.get('prescription', '')
        appointment.notes = request.data.get('notes', '')
        appointment.save()
        
        return Response({
            'message': 'Cita completada exitosamente',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Citas de hoy"""
        today = datetime.now().date()
        appointments = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Próximas citas (siguientes 7 días)"""
        today = datetime.now().date()
        next_week = today + timedelta(days=7)
        appointments = self.get_queryset().filter(
            date__range=[today, next_week],
            status__in=['scheduled', 'confirmed']
        )
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

# Vistas de estadísticas generales
class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Estadísticas generales del sistema"""
        today = datetime.now().date()
        
        stats = {
            'patients': {
                'total': Patient.objects.count(),
                'active': Patient.objects.filter(is_active=True).count(),
                'new_this_month': Patient.objects.filter(
                    created_at__month=today.month,
                    created_at__year=today.year
                ).count()
            },
            'doctors': {
                'total': Doctor.objects.count(),
                'available': Doctor.objects.filter(is_available=True).count(),
                'specialties': Doctor.objects.values('specialty').annotate(
                    count=Count('specialty')
                ).order_by('-count')
            },
            'appointments': {
                'total': Appointment.objects.count(),
                'today': Appointment.objects.filter(date=today).count(),
                'pending': Appointment.objects.filter(
                    status__in=['scheduled', 'confirmed']
                ).count(),
                'completed_this_month': Appointment.objects.filter(
                    status='completed',
                    date__month=today.month,
                    date__year=today.year
                ).count(),
                'by_status': Appointment.objects.values('status').annotate(
                    count=Count('status')
                )
            }
        }
        
        return Response(stats)

# Mantener las vistas de autenticación existentes...
class AuthLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(email=email)
            authenticated_user = authenticate(username=user.username, password=password)
            
            if authenticated_user:
                token, created = Token.objects.get_or_create(user=authenticated_user)
                
                # ✅ DETECTAR automáticamente el rol del usuario
                profile_data = {}
                detected_role = 'patient'  # Default
                
                # 🔑 VERIFICAR PRIMERO SI ES ADMIN/SUPERUSER (ANTES de buscar Doctor/Patient)
                if authenticated_user.is_superuser or authenticated_user.is_staff:
                    detected_role = 'admin'
                    profile_data = {
                        'name': authenticated_user.get_full_name() or authenticated_user.username,
                        'email': authenticated_user.email,
                        'is_admin': True,
                        'is_superuser': authenticated_user.is_superuser,
                        'is_staff': authenticated_user.is_staff
                    }
                    print(f"🔑 Admin detected: {authenticated_user.email}")  # DEBUG
                else:
                    try:
                        # Buscar si es doctor
                        doctor_profile = Doctor.objects.get(user=authenticated_user)
                        profile_data = DoctorSerializer(doctor_profile).data
                        detected_role = 'doctor'
                        print(f"👨‍⚕️ Doctor detected: {doctor_profile.name}")  # DEBUG
                    except Doctor.DoesNotExist:
                        try:
                            # Buscar si es paciente
                            patient_profile = Patient.objects.get(user=authenticated_user)
                            profile_data = PatientSerializer(patient_profile).data
                            detected_role = 'patient'
                            print(f"🏥 Patient detected: {patient_profile.name}")  # DEBUG
                        except Patient.DoesNotExist:
                            # Si no tiene perfil, mantener como paciente por defecto
                            detected_role = 'patient'
                            profile_data = {
                                'name': authenticated_user.get_full_name() or authenticated_user.username,
                                'email': authenticated_user.email
                            }
                            print(f"👤 Default patient role assigned")  # DEBUG
                
                print(f"✅ Final role: {detected_role}")  # DEBUG
                
                return Response({
                    'token': token.key,
                    'user': {
                        'id': authenticated_user.id,
                        'name': authenticated_user.get_full_name() or authenticated_user.username,
                        'email': authenticated_user.email,
                        'role': detected_role,  # ✅ Rol detectado automáticamente
                        'profile': profile_data
                    }
                })
            else:
                print(f"❌ Authentication failed for: {email}")  # DEBUG
                return Response({'error': 'Credenciales inválidas'}, status=400)
        except User.DoesNotExist:
            print(f"❌ User not found: {email}")  # DEBUG
            return Response({'error': 'Usuario no encontrado'}, status=404)
        except Exception as e:
            print(f"💥 Unexpected error: {str(e)}")  # DEBUG
            return Response({'error': 'Error interno del servidor'}, status=500)

class AuthRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'patient')
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'El email ya está registrado'}, status=400)
        
        # Crear usuario
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name.split()[0] if name else '',
            last_name=' '.join(name.split()[1:]) if name and len(name.split()) > 1 else ''
        )
        
        # Crear perfil según el rol
        if role == 'patient':
            patient = Patient.objects.create(
                user=user,
                name=name,
                email=email
            )
            profile_data = PatientSerializer(patient).data
        else:
            # Generar número de licencia único
            last_doctor = Doctor.objects.order_by('-id').first()
            license_num = f"LIC-{(last_doctor.id + 1) if last_doctor else 1:06d}"
            
            doctor = Doctor.objects.create(
                user=user,
                name=name,
                email=email,
                specialty=request.data.get('specialty', 'general'),
                license_number=license_num
            )
            profile_data = DoctorSerializer(doctor).data
        
        # Crear token
        token = Token.objects.create(user=user)
        
        return Response({
            'message': 'Usuario registrado exitosamente',
            'token': token.key,
            'user': {
                'id': user.id,
                'name': name,
                'email': email,
                'role': role,
                'profile': profile_data
            }
        })

class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        users = User.objects.all()
        user_list = []
        
        for user in users:
            user_data = {
                'id': user.id,
                'name': user.get_full_name() or user.username,
                'email': user.email,
                'date_joined': user.date_joined
            }
            user_list.append(user_data)
        
        return Response(user_list)

class PatientListView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            patients = Patient.objects.all()
            patients_data = []
            
            for patient in patients:
                # ✅ MANEJO SEGURO: Verificar qué campos existen
                patient_info = {
                    'id': patient.id,
                    'name': patient.name,
                }
                
                # Manejar email de diferentes formas
                if hasattr(patient, 'user') and patient.user:
                    patient_info['email'] = patient.user.email
                elif hasattr(patient, 'email'):
                    patient_info['email'] = patient.email
                else:
                    patient_info['email'] = 'Sin email'
                
                # Manejar teléfono
                if hasattr(patient, 'phone'):
                    patient_info['phone'] = patient.phone
                else:
                    patient_info['phone'] = 'Sin teléfono'
                
                # ✅ PROBAR DIFERENTES NOMBRES para fecha de nacimiento
                birth_date_value = None
                for field_name in ['birth_date', 'birthdate', 'date_of_birth', 'birthday']:
                    if hasattr(patient, field_name):
                        birth_date_value = getattr(patient, field_name)
                        break
                
                patient_info['birth_date'] = str(birth_date_value) if birth_date_value else 'Sin fecha'
                
                # Agregar otros campos comunes
                if hasattr(patient, 'gender'):
                    patient_info['gender'] = patient.gender
                
                patients_data.append(patient_info)
            
            print(f"✅ Enviando {len(patients_data)} pacientes")
            print(f"📋 Ejemplo de paciente: {patients_data[0] if patients_data else 'Sin pacientes'}")
            
            return Response(patients_data, status=200)
            
        except Exception as e:
            print(f"❌ Error en PatientListView: {str(e)}")
            import traceback
            print(f"📋 Traceback completo: {traceback.format_exc()}")
            return Response({'error': str(e)}, status=500)

class DoctorListView(APIView):
    permission_classes = [permissions.AllowAny]  # ✅ CAMBIAR: Sin autenticación para testing
    
    def get(self, request):
        try:
            doctors = Doctor.objects.all()
            doctors_data = []
            for doctor in doctors:
                doctors_data.append({
                    'id': doctor.id,
                    'name': doctor.name,
                    'email': doctor.user.email if doctor.user else doctor.email,
                    'specialty': doctor.specialty,
                    'phone': doctor.phone,
                    'license_number': doctor.license_number
                })
            print(f"✅ Enviando {len(doctors_data)} doctores")
            return Response(doctors_data, status=200)
        except Exception as e:
            print(f"❌ Error en DoctorListView: {str(e)}")
            return Response({'error': str(e)}, status=500)

class AppointmentCreateView(APIView):
    permission_classes = [permissions.AllowAny]  # ✅ CAMBIAR: Sin autenticación para testing
    
    def post(self, request):
        try:
            data = request.data
            print(f"📅 Datos recibidos para cita: {data}")
            
            # Obtener paciente y doctor
            try:
                patient = Patient.objects.get(id=data.get('patient_id'))
                print(f"✅ Paciente encontrado: {patient.name}")
            except Patient.DoesNotExist:
                return Response({'error': f'Paciente con ID {data.get("patient_id")} no encontrado'}, status=400)
            
            try:
                doctor = Doctor.objects.get(id=data.get('doctor_id'))
                print(f"✅ Doctor encontrado: {doctor.name}")
            except Doctor.DoesNotExist:
                return Response({'error': f'Doctor con ID {data.get("doctor_id")} no encontrado'}, status=400)
            
            # Crear la cita
            appointment = Appointment.objects.create(
                patient=patient,
                doctor=doctor,
                date=data.get('date'),
                time=data.get('time'),
                reason=data.get('reason', ''),
                priority=data.get('priority', 'medium'),
                status='scheduled'
            )
            
            appointment_data = {
                'id': appointment.id,
                'patient': {
                    'id': patient.id,
                    'name': patient.name
                },
                'doctor': {
                    'id': doctor.id,
                    'name': doctor.name,
                    'specialty': doctor.specialty
                },
                'date': str(appointment.date),
                'time': str(appointment.time),
                'reason': appointment.reason,
                'priority': appointment.priority,
                'status': appointment.status,
                'created_at': appointment.created_at.isoformat()
            }
            
            print(f"✅ Cita creada exitosamente: ID {appointment.id}")
            return Response(appointment_data, status=201)
            
        except Exception as e:
            print(f"❌ Error creando cita: {str(e)}")
            return Response({'error': str(e)}, status=500)

class AppointmentDetailView(APIView):
    permission_classes = [permissions.AllowAny]  # Para testing
    
    def get(self, request, pk):
        try:
            appointment = Appointment.objects.get(id=pk)
            appointment_data = {
                'id': appointment.id,
                'patient': {
                    'id': appointment.patient.id,
                    'name': appointment.patient.name
                },
                'doctor': {
                    'id': appointment.doctor.id,
                    'name': appointment.doctor.name,
                    'specialty': appointment.doctor.specialty
                },
                'date': appointment.date,
                'time': appointment.time,
                'reason': appointment.reason,
                'priority': appointment.priority,
                'status': appointment.status,
                'created_at': appointment.created_at
            }
            return Response(appointment_data, status=200)
        except Appointment.DoesNotExist:
            return Response({'error': 'Cita no encontrada'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

def register_form_view(request):
    return render(request, 'register.html')

def login_form_view(request):
    return render(request, 'login.html')

# En views.py - AGREGAR vista para crear datos de prueba
class CreateTestDataView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            # Crear usuario de prueba para paciente
            user_patient = User.objects.create_user(
                username='test_patient',
                email='patient@test.com',
                password='123456'
            )
            
            # Crear paciente
            patient = Patient.objects.create(
                user=user_patient,
                name='Juan Pérez Test',
                phone='+56912345678',
                birth_date='1990-01-01',
                gender='male'
            )
            
            # Crear usuario de prueba para doctor
            user_doctor = User.objects.create_user(
                username='test_doctor',
                email='doctor@test.com',
                password='123456'
            )
            
            # Crear doctor
            doctor = Doctor.objects.create(
                user=user_doctor,
                name='Dr. María García',
                specialty='Medicina General',
                phone='+56987654321',
                license_number='12345'
            )
            
            return Response({
                'message': 'Datos de prueba creados exitosamente',
                'patient': {'id': patient.id, 'name': patient.name},
                'doctor': {'id': doctor.id, 'name': doctor.name}
            }, status=201)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

# AGREGAR esta vista temporal para debug

class DebugPatientFieldsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            # Obtener el primer paciente para ver sus campos
            patient = Patient.objects.first()
            
            if not patient:
                return Response({'message': 'No hay pacientes en la base de datos'}, status=200)
            
            # Obtener todos los campos del modelo
            fields = []
            for field in Patient._meta.fields:
                field_value = getattr(patient, field.name, 'N/A')
                fields.append({
                    'field_name': field.name,
                    'field_type': str(field.__class__.__name__),
                    'value': str(field_value)
                })
            
            return Response({
                'patient_id': patient.id,
                'patient_name': patient.name,
                'available_fields': fields
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

# AGREGAR esta nueva vista

class AppointmentListView(APIView):
    permission_classes = [permissions.AllowAny]  # Para testing
    
    def get(self, request):
        """Obtener todas las citas"""
        try:
            appointments = Appointment.objects.all().select_related('patient', 'doctor').order_by('-date', '-time')
            appointments_data = []
            
            for appointment in appointments:
                appointment_info = {
                    'id': appointment.id,
                    'patientName': appointment.patient.name,
                    'doctorName': appointment.doctor.name,
                    'doctorSpecialty': getattr(appointment.doctor, 'specialty', 'Sin especialidad'),
                    'date': str(appointment.date),
                    'time': str(appointment.time),
                    'reason': appointment.reason,
                    'priority': appointment.priority,
                    'status': appointment.status,
                    'notes': getattr(appointment, 'notes', ''),
                    'location': getattr(appointment, 'location', 'Consulta Externa')
                }
                appointments_data.append(appointment_info)
            
            print(f"✅ AppointmentListView: Enviando {len(appointments_data)} citas")
            return Response(appointments_data, status=200)
            
        except Exception as e:
            print(f"❌ Error en AppointmentListView: {str(e)}")
            return Response({'error': str(e)}, status=500)