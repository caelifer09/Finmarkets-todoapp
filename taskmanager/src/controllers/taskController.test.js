const {
    createTask,
    getAllTasks,
    updateTaskStatus,
    deleteTask,
    setIoInstance
} = require('./taskController');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        task: {
            create: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

const mockIoInstance = {
    emit: jest.fn(),
};

const prisma = new PrismaClient();

let consoleErrorSpy;

describe('Test unitarios de Task Controller', () => {
     beforeAll(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        setIoInstance(mockIoInstance);
    });

    describe('createTask', () => {
        it('Debe crear una nueva Task exitosamente', async () => {
            const mockTask = { id: '1', titulo: 'Test Task', descripcion: 'Description', fechaCreacion: new Date(), status: 'pending' };
            prisma.task.create.mockResolvedValue(mockTask);

            const req = { body: { titulo: 'Test Task', descripcion: 'Description' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await createTask(req, res);

            expect(prisma.task.create).toHaveBeenCalledWith({
                data: {
                    titulo: 'Test Task',
                    descripcion: 'Description',
                },
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockTask);
            expect(mockIoInstance.emit).toHaveBeenCalledWith('newTask', mockTask);
        });

        it('Deberia devolver un error 400 si no se envia Titulo', async () => {
            const req = { body: { descripcion: 'Description' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await createTask(req, res);

            expect(prisma.task.create).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'El título es obligatorio.' });
        });

        it('Deberia devolver un error 400 si el titulo excede los 100 caracteres', async () => {
            const longTitle = 'a'.repeat(101);
            const req = { body: { titulo: longTitle, descripcion: 'Description' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await createTask(req, res);

            expect(prisma.task.create).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'El título no puede exceder los 100 caracteres.' });
        });

        it('Deberia devolver un error 400 si la descripcion excede los 500 caracteres', async () => {
            const longDescription = 'b'.repeat(501);
            const req = { body: { titulo: 'Valid Title', descripcion: longDescription } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await createTask(req, res);

            expect(prisma.task.create).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'La descripción no puede exceder los 500 caracteres.' });
        });

        it('Deberia manejar errores durante la creacion de una task', async () => {
            const errorMessage = 'Database error';
            prisma.task.create.mockRejectedValue(new Error(errorMessage));

            const req = { body: { titulo: 'Error Task', descripcion: 'Description' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await createTask(req, res);

            expect(prisma.task.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo crear la tarea.' });
        });
    });

    describe('getAllTasks', () => {
        it('Deberia recuperar todas las tareas con paginación predeterminada', async () => {
            const mockTasks = [
                { id: '1', titulo: 'Task 1', status: 'pending' },
                { id: '2', titulo: 'Task 2', status: 'completed' },
            ];
            prisma.task.count.mockResolvedValue(2);
            prisma.task.findMany.mockResolvedValue(mockTasks);

            const req = { query: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await getAllTasks(req, res);

            expect(prisma.task.count).toHaveBeenCalled();
            expect(prisma.task.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                orderBy: {
                    fechaCreacion: 'desc',
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                tasks: mockTasks,
                currentPage: 1,
                pageSize: 10,
                totalTasks: 2,
                totalPages: 1,
            });
        });

        it('Deberia recuperar tareas con paginación personalizada', async () => {
            const mockTasks = [
                { id: '3', titulo: 'Task 3', status: 'pending' },
            ];
            prisma.task.count.mockResolvedValue(15);
            prisma.task.findMany.mockResolvedValue(mockTasks);

            const req = { query: { page: '2', pageSize: '5' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await getAllTasks(req, res);

            expect(prisma.task.count).toHaveBeenCalled();
            expect(prisma.task.findMany).toHaveBeenCalledWith({
                skip: 5,
                take: 5,
                orderBy: {
                    fechaCreacion: 'desc',
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                tasks: mockTasks,
                currentPage: 2,
                pageSize: 5,
                totalTasks: 15,
                totalPages: 3,
            });
        });

        it('Debe gestionar errores durante la recuperación de tareas', async () => {
            const errorMessage = 'Database connection failed';
            prisma.task.findMany.mockRejectedValue(new Error(errorMessage));
            prisma.task.count.mockRejectedValue(new Error(errorMessage)); // Mock count as well for consistency

            const req = { query: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await getAllTasks(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'No se pudieron obtener las tareas.' });
        });
    });

    describe('updateTaskStatus', () => {
        it('Deberia actualizarse el estado de la tarea correctamente', async () => {
            const updatedTask = { id: '1', titulo: 'Test Task', status: 'completed' };
            prisma.task.update.mockResolvedValue(updatedTask);

            const req = { params: { id: '1' }, body: { status: 'completed' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await updateTaskStatus(req, res);

            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { status: 'completed' },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedTask);
            expect(mockIoInstance.emit).toHaveBeenCalledWith('taskUpdated', { id: updatedTask.id, status: updatedTask.status });
        });

        it('Deberia devolver error 400 si falta el estado', async () => {
            const req = { params: { id: '1' }, body: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await updateTaskStatus(req, res);

            expect(prisma.task.update).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'El estado es obligatorio.' });
        });

        it('Debe gestionar errores durante la actualización del estado de la tarea', async () => {
            const errorMessage = 'Task not found';
            prisma.task.update.mockRejectedValue(new Error(errorMessage));

            const req = { params: { id: 'nonexistent-id' }, body: { status: 'completed' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await updateTaskStatus(req, res);

            expect(prisma.task.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo actualizar el estado de la tarea.' });
        });
    });

    describe('deleteTask', () => {
        it('Deberia eliminar una tarea con exito', async () => {
            prisma.task.delete.mockResolvedValue({});

            const req = { params: { id: '1' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            await deleteTask(req, res);

            expect(prisma.task.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
            expect(mockIoInstance.emit).toHaveBeenCalledWith('taskDeleted', { id: '1' });
        });

        it('Debe gestionar errores durante la eliminacion de tareas', async () => {
            const errorMessage = 'Task not found for deletion';
            prisma.task.delete.mockRejectedValue(new Error(errorMessage));

            const req = { params: { id: 'nonexistent-id' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await deleteTask(req, res);

            expect(prisma.task.delete).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo eliminar la tarea.' });
        });
    });
});
