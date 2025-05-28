import React from 'react';
import TaskItem from './TaskItem';

function TaskList({ tasks, onToggleStatus, onDeleteTask }) {
  return (
    <div id="task-list" className="mt-5 pt-3 border-t border-gray-200">
      {tasks.length === 0 ? (
        <p className="text-gray-500 italic text-center">No hay tareas. ¡Agrega una nueva!</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleStatus={onToggleStatus}
            onDeleteTask={onDeleteTask}
          />
        ))
      )}
    </div>
  );
}

export default TaskList;