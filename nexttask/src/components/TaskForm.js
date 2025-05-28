import React, { useState } from 'react';

function TaskForm({ onAddTask }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    await onAddTask({ titulo, descripcion });
    setTitulo('');
    setDescripcion('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border border-gray-300 rounded-md bg-gray-50 shadow-sm">
      <input
        type="text"
        id="task-title"
        placeholder="Título de la tarea"
        maxLength="100"
        required
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        id="task-description"
        placeholder="Descripción (opcional)"
        rows="3"
        maxLength="500"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></textarea>
      <button
        type="submit"
        className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
      >
        Agregar Tarea
      </button>
    </form>
  );
}

export default TaskForm;