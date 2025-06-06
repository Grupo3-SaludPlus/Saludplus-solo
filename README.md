# SaludPlus - Sistema de Gestión Médica

Sistema web para la gestión de citas médicas, pacientes y doctores desarrollado con Angular.

## 🚀 Ejecución con Docker

### Prerrequisitos
- Docker Desktop instalado
- Conexión a internet (para clonar el repositorio)

### Pasos para ejecutar

1. **Clonar este repositorio o descargar el Dockerfile**
```bash
git clone https://github.com/Grupo3-SaludPlus/Saludplus-solo.git
cd Saludplus-solo/frontend-saludplus
```

2. **Construir la imagen Docker**
```bash
docker build -t saludplus .
```

3. **Ejecutar el contenedor**
```bash
docker run -p 4200:4200 saludplus
```

4. **Acceder a la aplicación**
Abrir el navegador en: `http://localhost:4200`

### Comandos adicionales

```bash
# Ejecutar en segundo plano
docker run -d -p 4200:4200 --name saludplus-app saludplus

# Ver logs de la aplicación
docker logs saludplus-app

# Parar el contenedor
docker stop saludplus-app

# Eliminar el contenedor
docker rm saludplus-app

# Ver contenedores corriendo
docker ps
```
## 📝 Notas

- La primera ejecución puede tardar varios minutos mientras se descargan dependencias
- La aplicación se ejecuta en modo desarrollo con hot reload
- Puerto por defecto: 4200

## 👥 Equipo de Desarrollo

Grupo 3 - SaludPlus (Christian Vivanco :D )