# 🏥 SaludPlus - Sistema de Gestión Médica

Solo requiere docker-compose up --build

Sistema completo de gestión médica desarrollado con Django REST Framework y Angular, diseñado para administrar pacientes, doctores y citas médicas de manera eficiente.

## Guardar los archivos docker en una carpeta

luego ejecutar

''docker-compose up --build''


## Registrar medicos

localhost:4200/registro-medico

## Registro Paciente
Mediante la pagina

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

