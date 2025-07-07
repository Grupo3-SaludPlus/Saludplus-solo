FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instala todas las dependencias necesarias
RUN pip install --no-cache-dir \
    django>=5.2.3 \
    djangorestframework \
    django-cors-headers \
    django-filter

# Copiar código y exponer puerto
COPY . .
EXPOSE 8000

# Entrypoint + CMD
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]