"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import io from 'socket.io-client';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

let socket;

function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  
  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tasks?page=${currentPage}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data.tasks);
      setCurrentPage(data.currentPage);
      setPageSize(data.pageSize);
      setTotalTasks(data.totalTasks);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, [BACKEND_URL, currentPage, pageSize]);

  useEffect(() => {
    socket = io(BACKEND_URL);

    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });

    socket.on('newTask', (task) => {
      console.log('Nueva tarea recibida via WebSocket:', task);
      loadTasks();
    });

    socket.on('taskUpdated', (payload) => {
      console.log('Tarea actualizada via WebSocket:', payload);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === payload.id ? { ...task, ...payload } : task
        )
      );
    });

    socket.on('taskDeleted', (payload) => {
      console.log('Tarea eliminada via WebSocket:', payload);
      loadTasks();
    });

    return () => {
      socket.disconnect();
    };
  }, [BACKEND_URL, loadTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (newTask) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al agregar tarea (respuesta del servidor):', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pendiente' ? 'completada' : 'pendiente';
    try {
      const response = await fetch(`${BACKEND_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/tasks/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>Lista de Tareas Pendientes (Realtime) - Next.js</title>
        <meta name="description" content="Una aplicación de lista de tareas en tiempo real con Next.js y Socket.io" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto max-w-2xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Mi Lista de Tareas Pendientes (Realtime)</h1>
        <TaskForm onAddTask={handleAddTask} />
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tareas:</h2>
        <TaskList
          tasks={tasks}
          onToggleStatus={handleToggleStatus}
          onDeleteTask={handleDeleteTask}
        />

        {totalTasks > 0 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                    Anterior
                </button>
                <span className="text-lg font-medium text-gray-700">
                    Página {currentPage} de {totalPages} ({totalTasks} tareas)
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                    Siguiente
                </button>
            </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;