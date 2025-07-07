#!/bin/sh
set -e

echo "🚀 Ejecutando migraciones..."
python manage.py migrate --noinput

echo "✅ Migraciones completadas. Iniciando servidor..."

# Ejecutar el comando pasado como argumentos
exec "$@"