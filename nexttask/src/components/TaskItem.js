import React from 'react';

function TaskItem({ task, onToggleStatus, onDeleteTask }) {
  const statusButtonText = task.status === 'pendiente' ? 'Marcar Completada' : 'Marcar Pendiente';
  const taskItemClass = task.status === 'completada'
    ? 'bg-green-50 border-green-400'
    : 'bg-white border-gray-300';

  return (
    <div className={`task-item p-4 mb-3 border rounded-md shadow-sm ${taskItemClass}`} data-id={task.id}>
      <h3 className="text-xl font-semibold mb-1 text-gray-800">{task.titulo}</h3>
      {task.descripcion && <p className="text-gray-600 mb-2">{task.descripcion}</p>}
      <p className="text-sm text-gray-700 mb-1">Estado: <strong className="font-medium capitalize">{task.status}</strong></p>
      <p className="text-xs text-gray-500">Creada: {new Date(task.fechaCreacion).toLocaleString()}</p>
      <p className="text-xs text-gray-500 mb-3">Actualizada: {new Date(task.fechaActualizacion).toLocaleString()}</p>
      <div className="task-actions flex space-x-2">
        <button
          className="toggle-status-btn py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-200 text-sm"
          onClick={() => onToggleStatus(task.id, task.status)}
        >
          {statusButtonText}
        </button>
        <button
          className="delete-btn py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition duration-200 text-sm"
          onClick={() => onDeleteTask(task.id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default TaskItem;