# 🏥 SaludPlus - Sistema de Gestión Médica

Sistema completo de gestión médica desarrollado con Django REST Framework y Angular, diseñado para administrar pacientes, doctores y citas médicas de manera eficiente.

## 📋 Características Principales

### 🔐 Autenticación y Autorización
- Sistema de registro para pacientes y doctores
- Autenticación basada en tokens
- Perfiles diferenciados por rol
- Panel de administración completo

### 👥 Gestión de Pacientes
- Registro completo de pacientes
- Historia médica y alergias
- Contactos de emergencia
- Seguimiento de citas y tratamientos

### 👩‍⚕️ Gestión de Doctores
- Perfiles profesionales completos
- Especialidades médicas
- Horarios y disponibilidad
- Sistema de calificaciones

### 📅 Sistema de Citas
- Programación inteligente de citas
- Estados de cita (programada, confirmada, completada, etc.)
- Validaciones de horarios y conflictos
- Diagnósticos y prescripciones

### 📊 Dashboard y Estadísticas
- Estadísticas en tiempo real
- Reportes de actividad
- Métricas de doctores y pacientes
- Análisis de tendencias

## 🛠️ Tecnologías Utilizadas

### Backend
- **Django 5.2.3** - Framework web principal
- **Django REST Framework** - API REST
- **SQLite** - Base de datos (desarrollo)
- **Django CORS Headers** - Manejo de CORS
- **Python 3.11** - Lenguaje de programación

### Frontend
- **Angular 18** - Framework frontend
- **TypeScript** - Lenguaje tipado
- **Bootstrap** - Framework CSS
- **Angular Material** - Componentes UI

### DevOps
- **Docker** - Containerización
- **Git** - Control de versiones
- **GitHub** - Repositorio remoto

## 📁 Estructura del Proyecto

```
SaludPlus-Solo/
├── Backend-saludplus/          # Backend Django
│   ├── api/                    # Aplicación principal
│   │   ├── models.py          # Modelos de datos
│   │   ├── serializers.py     # Serializers DRF
│   │   ├── views.py           # Vistas y lógica
│   │   ├── urls.py            # URLs de la API
│   │   └── admin.py           # Configuración admin
│   ├── saludplus/             # Configuración Django
│   ├── templates/             # Templates HTML
│   ├── requirements.txt       # Dependencias Python
│   └── manage.py              # Comando Django
├── frontend-saludplus/        # Frontend Angular
│   ├── src/                   # Código fuente
│   ├── package.json           # Dependencias Node.js
│   └── angular.json           # Configuración Angular
├── docker-compose.yml         # Orquestación Docker
├── Dockerfile                 # Imagen Docker
└── README.md                  # Documentación
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.11+
- Node.js 18+
- Git
- Docker (opcional)

### 🐍 Configuración del Backend

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/SaludPlus-Solo.git
cd SaludPlus-Solo/Backend-saludplus
```

2. **Crear entorno virtual**
```bash
python -m venv saludplus_env
# Windows
saludplus_env\Scripts\activate
# Linux/Mac
source saludplus_env/bin/activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar base de datos**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Crear superusuario**
```bash
python manage.py createsuperuser
```

6. **Ejecutar servidor de desarrollo**
```bash
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000/`

### 🅰️ Configuración del Frontend

1. **Instalar dependencias**
```bash
cd ../frontend-saludplus
npm install
```

2. **Ejecutar servidor de desarrollo**
```bash
ng serve
```

El frontend estará disponible en: `http://localhost:4200/`

## 🐳 Configuración con Docker

### Dockerfile Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Configurar base de datos
RUN python manage.py migrate

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Construcción y ejecución
```bash
# Construir imagen
docker build -t saludplus-backend .

# Ejecutar contenedor
docker run -p 8000:8000 saludplus-backend
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./Backend-saludplus
    ports:
      - "8000:8000"
    volumes:
      - ./Backend-saludplus:/app
    environment:
      - DEBUG=1
  
  frontend:
    build: ./frontend-saludplus
    ports:
      - "4200:4200"
    volumes:
      - ./frontend-saludplus:/app
    depends_on:
      - backend
```

```bash
# Ejecutar con Docker Compose
docker-compose up --build
```

## 📚 API Endpoints

### 🔐 Autenticación
```
POST /api/auth/register/     # Registro de usuarios
POST /api/auth/login/        # Inicio de sesión
POST /api/auth/logout/       # Cerrar sesión
GET  /api/auth/profile/      # Perfil del usuario
```

### 👥 Pacientes
```
GET    /api/patients/              # Listar pacientes
POST   /api/patients/              # Crear paciente
GET    /api/patients/{id}/         # Detalle de paciente
PUT    /api/patients/{id}/         # Actualizar paciente
DELETE /api/patients/{id}/         # Eliminar paciente
GET    /api/patients/{id}/appointments/  # Citas del paciente
GET    /api/patients/{id}/medical_summary/  # Resumen médico
```

### 👩‍⚕️ Doctores
```
GET    /api/doctors/               # Listar doctores
POST   /api/doctors/               # Crear doctor
GET    /api/doctors/{id}/          # Detalle de doctor
PUT    /api/doctors/{id}/          # Actualizar doctor
DELETE /api/doctors/{id}/          # Eliminar doctor
GET    /api/doctors/{id}/schedule/ # Horario del doctor
GET    /api/doctors/{id}/statistics/  # Estadísticas del doctor
```

### 📅 Citas
```
GET    /api/appointments/          # Listar citas
POST   /api/appointments/          # Crear cita
GET    /api/appointments/{id}/     # Detalle de cita
PUT    /api/appointments/{id}/     # Actualizar cita
DELETE /api/appointments/{id}/     # Eliminar cita
POST   /api/appointments/{id}/confirm/   # Confirmar cita
POST   /api/appointments/{id}/cancel/    # Cancelar cita
POST   /api/appointments/{id}/complete/  # Completar cita
GET    /api/appointments/today/    # Citas de hoy
GET    /api/appointments/upcoming/ # Próximas citas
```

### 📊 Dashboard
```
GET    /api/dashboard/stats/       # Estadísticas generales
```

## 🧪 Testing

### Backend
```bash
# Ejecutar tests
python manage.py test

# Tests con cobertura
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Frontend
```bash
# Tests unitarios
ng test

# Tests end-to-end
ng e2e

# Build de producción
ng build --prod
```

## 📈 Filtros y Búsquedas

### Filtros Disponibles

**Pacientes:**
- Por género: `?gender=M`
- Por nivel de prioridad: `?priority_level=high`
- Por estado activo: `?is_active=true`
- Búsqueda: `?search=nombre`

**Doctores:**
- Por especialidad: `?specialty=cardiology`
- Por disponibilidad: `?is_available=true`
- Búsqueda: `?search=nombre`

**Citas:**
- Por estado: `?status=confirmed`
- Por prioridad: `?priority=urgent`
- Por fecha: `?date=2024-01-15`
- Por rango de fechas: `?date_from=2024-01-01&date_to=2024-01-31`
- Por doctor: `?doctor=1`
- Por paciente: `?patient=1`

## 🔒 Seguridad

### Medidas Implementadas
- Autenticación basada en tokens JWT
- Validaciones de entrada robustas
- Sanitización de datos
- Control de acceso por roles
- Protección CORS configurada
- Validaciones de negocio

### Variables de Entorno
```env
DEBUG=False
SECRET_KEY=tu-secret-key-super-segura
ALLOWED_HOSTS=tu-dominio.com
DATABASE_URL=postgres://user:pass@localhost:5432/saludplus
```

## 🤝 Contribución

### Flujo de Git
```bash
# Crear rama feature
git checkout -b feature/nueva-funcionalidad

# Hacer commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push de la rama
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
```

### Convenciones de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato de código
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

## 📋 Roadmap

### Versión 1.1
- [ ] Notificaciones por email
- [ ] Calendario interactivo
- [ ] Reportes en PDF
- [ ] API de pagos

### Versión 1.2
- [ ] App móvil React Native
- [ ] Chat en tiempo real
- [ ] Videollamadas
- [ ] IA para diagnósticos

## 🐛 Problemas Conocidos

1. **Fechas en Safari**: Usar formato ISO para fechas
2. **CORS en producción**: Configurar dominios específicos
3. **Timezone**: Configurar zona horaria del servidor

## 📞 Soporte

### Contacto
- **Desarrollador**: Tu Nombre
- **Email**: tu.email@ejemplo.com
- **GitHub**: @tu-usuario

### Reportar Bugs
Crear un issue en GitHub con:
- Descripción del problema
- Pasos para reproducir
- Entorno (OS, navegador, versión)
- Screenshots si aplica

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para mejorar la gestión médica**

