# Usar una imagen base de Node.js
FROM node:20

# Instalar git
RUN apt-get update && apt-get install -y git

# Establecer el directorio de trabajo
WORKDIR /app

# Clonar el repositorio público
ARG REPO_URL=https://github.com/Grupo3-SaludPlus/Saludplus-solo.git
RUN git clone ${REPO_URL} .

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli

# Cambiar al directorio correcto e instalar dependencias
WORKDIR /app/frontend-saludplus
RUN npm install

# Exponer el puerto 4200 (predeterminado para ng serve)
EXPOSE 4200

# Comando para iniciar el servidor de desarrollo
CMD ["ng", "serve", "--host", "0.0.0.0"]