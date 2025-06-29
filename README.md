# SaludPlus - Sistema de Gestión Médica

Sistema web para la gestión de citas médicas, pacientes y doctores desarrollado con Angular.

## 🚀 Ejecución del Frontend con Docker

### Prerrequisitos
- Docker Desktop instalado
- Conexión a internet (para clonar el repositorio)

### Pasos para ejecutar

1. **Clonar este repositorio**
```bash
git clone https://github.com/Grupo3-SaludPlus/Saludplus-solo.git
cd Saludplus-solo/frontend-saludplus
```

2. **Asegúrate de que el Dockerfile esté en esta carpeta (`frontend-saludplus`)**

3. **Construir la imagen Docker**
```bash
docker build -t saludplus .
```

4. **Ejecutar el contenedor**
```bash
docker run -p 4200:4200 saludplus
```

5. **Acceder a la aplicación**
Abre tu navegador en: [http://localhost:4200](http://localhost:4200)

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

- La primera ejecución puede tardar varios minutos mientras se descargan dependencias.
- La aplicación se ejecuta en modo desarrollo con hot reload.
- Puerto por defecto: 4200.
- **Este contenedor solo levanta el frontend Angular. Si necesitas el backend, debes levantarlo por separado.**

## 👥 Equipo de Desarrollo

Grupo 3 - SaludPlus (Christian Vivanco :D )