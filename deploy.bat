@echo off
CD /D %~dp0

REM Verificar si Docker esta instalado
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker no esta instalado o no esta en el PATH.
    pause
    exit /b 1
)

REM Verificar si la red 'fullstack_network' existe
docker network ls --format "{{.Name}}" | findstr /r "^fullstack_network$" >nul
if %errorlevel% neq 0 (
    echo Creando red Docker 'fullstack_network'...
    docker network create fullstack_network
) else (
    echo La red 'fullstack_network' ya existe.
)

echo Construyendo sin cache...
docker-compose build --no-cache || goto :error

echo Levantando contenedores...
docker-compose up -d || goto :error

echo Ejecutando migraciones Prisma...
docker exec taskmanager-backend npx prisma migrate deploy || goto :error

echo Apagando contenedores...
docker-compose down

echo Levantando contenedores nuevamente...
docker-compose up
pause
exit /b 0

:error
echo Ocurrió un error en la ejecución del script.
pause
exit /b 1

