#!/bin/bash
set -e

# Verificar si Docker esta instalado
if ! command -v docker &> /dev/null; then
    echo "🚫 Docker no esta instalado. Instalalo con:"
    echo "   sudo apt install docker.io"
    exit 1
fi

# Verificar si docker-compose esta instalado
if ! command -v docker-compose &> /dev/null; then
    echo "🚫 docker-compose no esta instalado. Instalalo con:"
    echo "   sudo apt install docker-compose"
    exit 1
fi

# Verificar si la red 'fullstack_network' existe
if ! docker network ls --format '{{.Name}}' | grep -q '^fullstack_network$'; then
    echo "🌐 Creando red Docker 'fullstack_network'..."
    sudo docker network create fullstack_network
else
    echo "🌐 La red 'fullstack_network' ya existe."
fi

# Construir la imagen sin caché
echo "🔨 Construyendo imagenes sin cache..."
docker-compose build --no-cache || { echo "❌ Fallo al construir la imagen."; exit 1; }

# Levantar los contenedores
echo "🚀 Levantando contenedores..."
docker-compose up -d || { echo "❌ Fallo al levantar contenedores."; exit 1; }

# Ejecutar migraciones
echo "📦 Ejecutando migraciones Prisma..."
if docker ps --format '{{.Names}}' | grep -q "taskmanager-backend"; then
    docker exec taskmanager-backend npx prisma migrate deploy || { echo "❌ Error ejecutando Prisma."; exit 1; }
else
    echo "⚠️ El contenedor 'taskmanager-backend' no esta activo."
    exit 1
fi

# Apagar y volver a levantar
echo "🧹 Apagando contenedores..."
docker-compose down

echo "♻️ Levantando contenedores nuevamente..."
docker-compose up -d

