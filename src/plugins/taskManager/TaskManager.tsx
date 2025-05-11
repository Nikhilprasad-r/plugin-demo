import React, { useState, useEffect, useCallback } from 'react';
import { PluginProps } from '../../core/pluginSystem';
import { usePluginEvents } from '../../core/pluginSystem';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface TaskManagerConfig {
  showCompleted?: boolean;
  sortOrder?: 'asc' | 'desc';
  maxTasks?: number;
}

const TaskManager: React.FC<PluginProps & TaskManagerConfig> = ({
  zoneName,
  config,
  instanceId
}) => {
  const { 
    showCompleted = true, 
    sortOrder = 'desc',
    maxTasks = 10
  } = config || {};
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { publish } = usePluginEvents();
  
  // Load initial tasks
  useEffect(() => {
    const savedTasks = localStorage.getItem('plugin-tasks');
    if (savedTasks) {
      try {
        // Parse the saved tasks and ensure dates are properly converted
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Failed to parse saved tasks', error);
      }
    }
  }, []);
  
  // Save tasks whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('plugin-tasks', JSON.stringify(tasks));
      
      // Publish task updates for other plugins
      publish('tasks:updated', tasks);
    }
  }, [tasks, publish]);
  
  // Add a new task
  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setNewTaskTitle('');
    
    // Publish task added event
    publish('tasks:added', newTask);
  }, [newTaskTitle, publish]);
  
  // Toggle task completion
  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
  }, []);
  
  // Delete a task
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    // Publish task deleted event
    publish('tasks:deleted', taskId);
  }, [publish]);
  
  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => showCompleted || !task.completed)
    .sort((a, b) => {
      const compareValue = sortOrder === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
      return compareValue;
    })
    .slice(0, maxTasks);

  return (
    <div className="task-manager">
      <h3>Task Manager</h3>
      
      <div className="task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add new task..."
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask}>Add</button>
      </div>
      
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">No tasks found</div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
              />
              <span className="task-title">{task.title}</span>
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                &times;
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="widget-footer">
        <small>Zone: {zoneName}</small>
      </div>
    </div>
  );
};

// Define the plugin metadata
const TaskManagerPlugin = {
  id: 'task-manager',
  name: 'Task Manager',
  version: '1.0.0',
  description: 'Manage and track your tasks',
  allowedZones: ['content', 'sidebar'],
  component: TaskManager,
  defaultConfig: {
    showCompleted: true,
    sortOrder: 'desc',
    maxTasks: 10
  }
};

export default TaskManagerPlugin;