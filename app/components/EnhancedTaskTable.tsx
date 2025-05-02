// app/components/EnhancedTaskTable.tsx
'use client';

import React, { useState } from 'react';
import { Task, Tag } from '@prisma/client';

type TaskWithTags = Task & {
  taskTags: {
    tag: Tag;
  }[];
};

interface EnhancedTaskTableProps {
  initialTasks: TaskWithTags[];
  projectId: number;
  availableTags: Tag[];
}

const EnhancedTaskTable: React.FC<EnhancedTaskTableProps> = ({ 
  initialTasks, 
  projectId, 
  availableTags 
}) => {
  const [tasks, setTasks] = useState<TaskWithTags[]>(initialTasks);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New task template
  const emptyTask: Omit<TaskWithTags, 'task_id' | 'project_id' | 'created_at' | 'updated_at'> = {
    task_name: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    due_date: null,
    taskTags: []
  };
  
  // Form state
  const [newTask, setNewTask] = useState(emptyTask);
  const [editTask, setEditTask] = useState<TaskWithTags | null>(null);

  // Handle input changes for new or edited task
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    isNewTask: boolean
  ) => {
    const { name, value } = e.target;
    
    if (isNewTask) {
      setNewTask(prev => ({ ...prev, [name]: value }));
    } else if (editTask) {
      setEditTask({ ...editTask, [name]: value });
    }
  };
  
  // Handle tag selection
  const handleTagToggle = (tagId: number, isNewTask: boolean) => {
    if (isNewTask) {
      setNewTask(prev => {
        const currentTags = [...prev.taskTags];
        const tagIndex = currentTags.findIndex(t => t.tag.tag_id === tagId);
        
        if (tagIndex === -1) {
          // Add tag
          return {
            ...prev,
            taskTags: [...currentTags, { tag: availableTags.find(t => t.tag_id === tagId)! }]
          };
        } else {
          // Remove tag
          currentTags.splice(tagIndex, 1);
          return { ...prev, taskTags: currentTags };
        }
      });
    } else if (editTask) {
      setEditTask(prev => {
        if (!prev) return prev;
        
        const currentTags = [...prev.taskTags];
        const tagIndex = currentTags.findIndex(t => t.tag.tag_id === tagId);
        
        if (tagIndex === -1) {
          // Add tag
          return {
            ...prev,
            taskTags: [...currentTags, { tag: availableTags.find(t => t.tag.tag_id === tagId)! }]
          };
        } else {
          // Remove tag
          currentTags.splice(tagIndex, 1);
          return { ...prev, taskTags: currentTags };
        }
      });
    }
  };
  
  // Add a new task
  const handleAddTask = async () => {
    if (!newTask.task_name.trim()) {
      setError('Task name is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const selectedTagIds = newTask.taskTags.map(t => t.tag.tag_id);
      
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_name: newTask.task_name,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          due_date: newTask.due_date,
          selectedTags: selectedTagIds
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      const createdTask = await response.json();
      
      // Add new task to the list
      setTasks([...tasks, createdTask]);
      
      // Reset form
      setNewTask(emptyTask);
      setIsAddingTask(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      setError(error.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start editing a task
  const handleEditStart = (task: TaskWithTags) => {
    setEditingTaskId(task.task_id);
    setEditTask(task);
  };
  
  // Save edited task
  const handleEditSave = async () => {
    if (!editTask || !editTask.task_name.trim()) {
      setError('Task name is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Updating task ID: ${editTask.task_id}`);
      const selectedTagIds = editTask.taskTags.map(t => t.tag.tag_id);
      console.log('Selected tag IDs:', selectedTagIds);
      
      const response = await fetch(`/api/projects/${projectId}/tasks/${editTask.task_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_name: editTask.task_name,
          description: editTask.description,
          status: editTask.status,
          priority: editTask.priority,
          due_date: editTask.due_date,
          selectedTags: selectedTagIds
        })
      });
      
      const responseData = await response.json();
      console.log('Update response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update task');
      }
      
      // Update task in the list
      console.log('Updating task in UI');
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === responseData.task_id ? responseData : task
        )
      );
      
      // Reset editing state
      setEditingTaskId(null);
      setEditTask(null);
      console.log('Task updated successfully');
    } catch (error: any) {
      console.error('Error updating task:', error);
      setError(error.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel editing
  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditTask(null);
    setError(null);
  };
  
  // Delete a task
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Deleting task with ID: ${taskId}`);
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const responseData = await response.json();
      console.log('Delete response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete task');
      }
      
      // Remove task from the list
      console.log('Removing deleted task from UI');
      setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
      console.log('Task removed from state');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      setError(error.message || 'Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-2">
        <h2 
          className="text-2xl font-bold"
          style={{
            color: '#F1EFEC',
            marginTop: '20px',
            marginLeft: '10px',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)'
          }}
        >
          Tasks
        </h2>
        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          style={{
            backgroundColor: isAddingTask ? '#123458' : '#123458',
            color: '#F1EFEC',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
            marginLeft: '10px'
          }}
          className="hover:shadow-lg hover:translate-y-[-2px]"
          disabled={isLoading}
        >
          {isAddingTask ? 'Cancel' : 'Add Task'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white/80 rounded-lg overflow-hidden shadow-lg" style={{ borderRadius: '16px' }}>
          <thead 
            style={{ backgroundColor: '#F1EFEC',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
              marginLeft: '10px'
            }}>
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-white text-shadow">Task Name</th>
              <th className="px-6 py-4 text-left font-semibold text-white text-shadow">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-white text-shadow">Priority</th>
              <th className="px-6 py-4 text-left font-semibold text-white text-shadow">Due Date</th>
              <th className="px-6 py-4 text-left font-semibold text-white text-shadow">Tags</th>
              <th className="px-6 py-4 text-left font-semibold text-white text-shadow">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* New Task Form Row */}
            {isAddingTask && (
              <tr className="border-t" style={{ backgroundColor: 'rgba(199, 217, 221, 0.1)' }}>
                <td className="px-6 py-5">
                  <input
                    type="text"
                    name="task_name"
                    value={newTask.task_name}
                    onChange={(e) => handleInputChange(e, true)}
                    placeholder="Enter task name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-5">
                  <select
                    name="status"
                    value={newTask.status}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td className="px-6 py-5">
                  <select
                    name="priority"
                    value={newTask.priority}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </td>
                <td className="px-6 py-5">
                  <input
                    type="date"
                    name="due_date"
                    value={newTask.due_date ? new Date(newTask.due_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {availableTags.map(tag => (
                      <div 
                        key={tag.tag_id}
                        onClick={() => handleTagToggle(tag.tag_id, true)}
                        className={`cursor-pointer text-xs px-2 py-1 rounded-full transition-all ${
                          newTask.taskTags.some(t => t.tag.tag_id === tag.tag_id)
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddTask}
                      style={{
                        backgroundColor: '#F1EFEC',
                        color: '#123458',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        /* textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',*/
                      }}
                      className="hover:shadow-md transition-all"
                      disabled={isLoading}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingTask(false);
                        setNewTask(emptyTask);
                      }}
                      style={{
                        backgroundColor: '#123458',
                        color: '#F1EFEC',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        /* textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', */
                      }}
                      className="hover:shadow-md transition-all"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}
            
            {/* Existing Tasks */}
            {tasks.length === 0 && !isAddingTask ? (
              <tr className="border-t" style={{ backgroundColor: 'rgba(199, 217, 221, 0.1)' }}>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-lg">
                  No tasks yet. Click "Add Task" to create your first task.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.task_id} className="border-t hover:bg-gray-50 transition-colors">
                  {/* Editing Mode */}
                  {editingTaskId === task.task_id ? (
                    <>
                      <td className="px-6 py-5">
                        <input
                          type="text"
                          name="task_name"
                          value={editTask?.task_name || ''}
                          onChange={(e) => handleInputChange(e, false)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <select
                          name="status"
                          value={editTask?.status || 'Not Started'}
                          onChange={(e) => handleInputChange(e, false)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          name="priority"
                          value={editTask?.priority || 'Medium'}
                          onChange={(e) => handleInputChange(e, false)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <input
                          type="date"
                          name="due_date"
                          value={editTask?.due_date 
                            ? new Date(editTask.due_date).toISOString().split('T')[0] 
                            : ''}
                          onChange={(e) => handleInputChange(e, false)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {availableTags.map(tag => (
                            <div 
                              key={tag.tag_id}
                              onClick={() => handleTagToggle(tag.tag_id, false)}
                              className={`cursor-pointer text-xs px-2 py-1 rounded-full transition-all ${
                                editTask?.taskTags.some(t => t.tag.tag_id === tag.tag_id)
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {tag.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={handleEditSave}
                            style={{
                              backgroundColor: '#EEF1DA',
                              color: '#ffffff',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                            }}
                            className="hover:shadow-md transition-all"
                            disabled={isLoading}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            style={{
                              backgroundColor: '#C7D9DD',
                              color: '#ffffff',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                            }}
                            className="hover:shadow-md transition-all"
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* View Mode */}
                      <td className="px-4 py-5 font-medium">{task.task_name}</td>
                      <td className="px-4 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'Completed' ? 'bg-green-200 text-green-800' :
                          task.status === 'In Progress' ? 'bg-blue-200 text-blue-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'High' ? 'bg-red-200 text-red-800' :
                          task.priority === 'Medium' ? 'bg-orange-200 text-orange-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-1">
                          {task.taskTags?.map((taskTag) => (
                            <span 
                              key={taskTag.tag.tag_id} 
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {taskTag.tag.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditStart(task)}
                            style={{
                              backgroundColor: '#C7D9DD',
                              color: '#ffffff',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                            }}
                            className="hover:shadow-md transition-all"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.task_id)}
                            style={{
                              backgroundColor: '#FFA07A',
                              color: '#ffffff',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                            }}
                            className="hover:shadow-md transition-all"
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnhancedTaskTable;