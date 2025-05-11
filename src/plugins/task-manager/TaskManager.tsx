import React, { useState, useEffect, useCallback } from 'react'
import { usePluginEvents } from '../../core/pluginSystem'
import { PluginProps } from '@/core/pluginSystem/types/pluginTypes'

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

interface TaskManagerConfig {
  showCompleted?: boolean
  sortOrder?: 'asc' | 'desc'
  maxTasks?: number
}

const TaskManager: React.FC<PluginProps & TaskManagerConfig> = ({ zoneName, config, instanceId }) => {
  const { showCompleted = true, sortOrder = 'desc', maxTasks = 10 } = config || {}

  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const { publish } = usePluginEvents()

  // Load initial tasks
  useEffect(() => {
    const savedTasks = localStorage.getItem('plugin-tasks')
    if (savedTasks) {
      try {
        // Parse the saved tasks and ensure dates are properly converted
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))
        setTasks(parsedTasks)
      } catch (error) {
        console.error('Failed to parse saved tasks', error)
      }
    }
  }, [])

  // Save tasks whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('plugin-tasks', JSON.stringify(tasks))

      // Publish task updates for other plugins
      publish('tasks:updated', tasks)
    }
  }, [tasks, publish])

  // Add a new task
  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date(),
    }

    setTasks((prevTasks) => [newTask, ...prevTasks])
    setNewTaskTitle('')

    // Publish task added event
    publish('tasks:added', newTask)
  }, [newTaskTitle, publish])

  // Toggle task completion
  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }, [])

  // Delete a task
  const deleteTask = useCallback(
    (taskId: string) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

      // Publish task deleted event
      publish('tasks:deleted', taskId)
    },
    [publish],
  )

  // Filter and sort tasks.
  const filteredTasks = tasks
    .filter((task) => showCompleted || !task.completed)
    .sort((a, b) => {
      const compareValue = sortOrder === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
      return compareValue
    })
    .slice(0, maxTasks)

  return (
    <div className='task-manager p-4 bg-white rounded-md shadow-md space-y-4'>
      <h3 className='text-lg font-semibold text-gray-800'>Task Manager</h3>

      <div className='task-form flex items-center gap-2'>
        <input
          type='text'
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder='Add new task...'
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className='flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button onClick={addTask} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'>
          Add
        </button>
      </div>

      <div className='task-list space-y-2'>
        {filteredTasks.length === 0 ? (
          <div className='text-gray-500 text-sm'>No tasks found</div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-item flex items-center justify-between px-3 py-2 border rounded ${task.completed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className='flex items-center gap-2'>
                <input type='checkbox' checked={task.completed} onChange={() => toggleTaskCompletion(task.id)} className='h-4 w-4 text-green-600' />
                <span className={`task-title text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
              </div>
              <button onClick={() => deleteTask(task.id)} className='delete-btn text-red-500 hover:text-red-700 text-lg leading-none'>
                &times;
              </button>
            </div>
          ))
        )}
      </div>

      <div className='widget-footer text-xs text-gray-400 text-right'>Zone: {zoneName}</div>
    </div>
  )
}

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
    maxTasks: 10,
  },
}

export default TaskManagerPlugin
