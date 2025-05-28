require('dotenv').config({ path: '../.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const taskRoutes = require('./routes/taskRoutes');
const taskController = require('./controllers/taskController');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express(); // Crear una instancia de Express
const server = http.createServer(app); // Crear un servidor HTTP con Express
const io = new Server(server, { // Configurar Socket.IO
    cors: {
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

taskController.setIoInstance(io); // Configurar la instancia de Socket.IO en el controlador

app.use(express.json()); // Middleware para parsear JSON

app.use(cors()); // Middleware para habilitar CORS
app.use('/api', taskRoutes); // Rutas de la API

// Middleware de manejo de errores JSON malformado
app.use((err, req, res, next) => {    
    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Se requiere Content-Type: application/json' });
    }
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ error: 'El cuerpo debe ser un objeto JSON válido' });
    }
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'JSON malformado' });
    }
    next(err);
});

// Middleware final para otros errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

io.on('connection', (socket) => { // Manejar la conexión de un cliente
    console.log('Un cliente se ha conectado:', socket.id);

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado:', socket.id);
    });
});

const PORT = process.env.BACKEND_PORT || 3000;

server.listen(PORT, () => { // Iniciar el servidor
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`WebSocket escuchando en ws://localhost:${PORT}`);
});
