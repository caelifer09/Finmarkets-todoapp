# TO-DO app for Finmarkets

Desarrollé una aplicación utilizando [ExpressJS](https://expressjs.com/es/) para el Backend, y [Next.js](https://nextjs.org/) para el Frontend, como parte de una prueba técnica para Finmarkers.

El patrón utilizado para el diseño es MVC, que se encarga de organizar la distribución de las responsabilidades entre las distintas capas de la aplicación. En cuanto al frontend, elegí React debido a que me resulta cómodo y atractivo por su flexibilidad que ofrece en la creación de interfaces interactivas.

Rutas de la api:

- /api/tasks
    - GET Metodo
        - "/" Obtiene todas las Task (Paginación(Opcional): Especifica query params "page" and "pagesize" en la URL)
    - POST Metodo
        - "/" Crea una Task, Espera (titulo, descripción(opcional) como string)
    - PUT Metodo
        - "/:id" Actualiza una Task, Espera (id en el params, status como string)
    - DELETE Metodo
        - "/:id" Elimina una Task por su id en el params

Comenzamos copiando el repositorio:

-git clone 

-cd FinmarketsTest

## Deployment

Para el despliegue, se contemplan dos opciones: una utilizando Docker y otra sin Docker.

- Docker:
Es necesario crear un archivo de variables de entorno (.env) en la raíz del proyecto con los siguientes datos:
```node_env
DATABASE_URL="file:/app/prisma/dev.db?schema=public"
PORT=3001 // puedes elegir uno
BACKEND_PORT=3000 // puedes elegir uno
DOCKER_HOST_IP=<IP DEL HOST> // puede ser ip de la maquina que corre docker o localhost si solo se accede desde la misma maquina.
NEXT_PUBLIC_BACKEND_URL=http://${DOCKER_HOST_IP}:${BACKEND_PORT} 
```
**Linux:**

Ejecutamos el comando para darle permiso al script de deploy (recuerda usar **sudo**  si tu sistema lo requiere):
```bash
chmod +x deploy.sh
```
y lo ejecutamos con (también con **sudo** si es requerido): 
```bash
./deploy.sh
```
**Windows:**

Tener docker instalado y abierto, luego ejecutamos como administrador el archivo deploy.bat

--------------------------------------------

## Installation

- Sin Docker:
Es necesario crear un archivo de variables de entorno (.env) en la raíz del proyecto con los siguientes datos:

```node_env
DATABASE_URL="file:/taskmanager/prisma/dev.db?schema=public"
PORT=3001 // puedes elegir uno
BACKEND_PORT=3000 // puedes elegir uno
DOCKER_HOST_IP=<IP DEL HOST> // puede ser ip de la maquina que ejecuta el script o localhost solo si se accedera desde la misma maquina.
NEXT_PUBLIC_BACKEND_URL=http://${DOCKER_HOST_IP}:${BACKEND_PORT}
```
Luego ejecutamos estos comando en la raiz (/FinmarketsTest)
```bash
npm run install-all
npx prisma generate --schema=taskmanager/prisma/schema.prisma
npx prisma migrate dev --schema=taskmanager/prisma/schema.prisma
npm run dev
```
Para realizar test unitarios:
```bash
npm test --prefix taskmanager
```

### Funcionamiento 

Si configuraste una IP fija para el servidor, accede mediante:
http://<IP_DEL_HOST>:3001

Si estás ejecutando la aplicación con localhost (solo accesible desde la máquina anfitriona):
http://localhost:3001

Si modificaste el puerto en el archivo .env, asegúrate de acceder usando el nuevo puerto configurado. Por ejemplo, si definiste PORT=4000, la URL sería http://localhost:4000.




