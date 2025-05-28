/*
- normalmente este archivo seria el services de Task, 
pero como el proyecto es pequeño, lo dejaremos como controller, 
ya que no usaremos tantas validaciones.
- por motivos de acelerar el desarrollo se uso prisma, pero estaré describiendo los
querys necesarios para cada método. */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let ioInstance;

const setIoInstance = (io) => {
    ioInstance = io;
};
/* metodo para crear una Task 
SQLquery: INSERT INTO task (titulo, descripcion, fechaCreacion, fechaActualizacion)
VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),[titulo, descripcion]
*/
const createTask = async (req, res) => {
    const { titulo, descripcion } = req.body;
    if (!titulo) {
        return res.status(400).json({ error: 'El titulo es obligatorio.' });
    }
    if (titulo.length > 100) {
        return res.status(400).json({ error: 'El titulo no puede exceder los 100 caracteres.' });
    }
    if (descripcion?.length > 500) {
        return res.status(400).json({ error: 'La descripción no puede exceder los 500 caracteres.' });
    }
    try {
        const newTask = await prisma.task.create({
            data: {
                titulo,
                descripcion,
            },
        });
        if (ioInstance) {
            ioInstance.emit('newTask', newTask);
        }
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        res.status(500).json({ error: 'No se pudo crear la tarea.' });
    }
};
/* metodo para obtener todas las Task, puede ir con paginación  
SQLquery:  SELECT * FROM task ORDER BY fechaCreacion DESC LIMIT ? OFFSET ? , [limit, skip]
*/
const getAllTasks = async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limit = parseInt(pageSize) || 10;
        const skip = (pageNumber - 1) * limit;
        const totalTasks = await prisma.task.count();
        const tasks = await prisma.task.findMany({
            skip: skip,
            take: limit,
            orderBy: {
                fechaCreacion: 'desc',
            },
        });
        res.status(200).json({
            tasks,
            currentPage: pageNumber,
            pageSize: limit,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
        });
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        res.status(500).json({ error: 'No se pudieron obtener las tareas.' });
    }
};
/* metodo para actualizar el estado de una Task 
SQLquery: UPDATE task SET estado = ?, fechaActualizacion = CURRENT_TIMESTAMP WHERE id = ?, [status, id]
*/
const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || id.trim() === '') {
        return res.status(400).json({ error: 'El ID no puede estar vacío.' });
    }
    if (!status) {
        return res.status(400).json({ error: 'El estado(status) es obligatorio.' });
    }
    try {
        const updatedTask = await prisma.task.update({
            where: { id },
            data: { status },
        });
        if (ioInstance) {
            ioInstance.emit('taskUpdated', updatedTask);
        }
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error al actualizar el estado de la tarea:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Tarea no encontrada.' });
        }
        res.status(500).json({ error: 'No se pudo actualizar el estado de la tarea.' });
    }
};
/* metodo para eliminar una Task 
SQLquery: DELETE FROM task WHERE id = ?, [id];
*/
const deleteTask = async (req, res) => {
    const { id } = req.params;
    if (!id || id.trim() === '') {
        return res.status(400).json({ error: 'El ID no puede estar vacío.' });
    }
    try {
        await prisma.task.delete({
            where: { id },
        });

        if (ioInstance) {
            ioInstance.emit('taskDeleted', { id });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Tarea no encontrada.' });
        }
        res.status(500).json({ error: 'No se pudo eliminar la tarea.' });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    updateTaskStatus,
    deleteTask,
    setIoInstance,
};