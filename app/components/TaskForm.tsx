// app/components/TaskForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TaskFormProps {
  projectId: number;
  task?: {
    task_id: number;
    task_name: string;
    description: string | null;
    status: 'Not Started' | 'In Progress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
    due_date: string | null;
  };
  tags?: {
    tag_id: number;
    name: string;
  }[];
}

const TaskForm: React.FC<TaskFormProps> = ({ projectId, task, tags = [] }) => {
  const router = useRouter();
  const isEditing = !!task;
  
  const [formData, setFormData] = useState({
    task_name: task?.task_name || '',
    description: task?.description || '',
    status: task?.status || 'Not Started',
    priority: task?.priority || 'Medium',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    selectedTags: task?.taskTags?.map(tt => tt.tag.tag_id) || []
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagChange = (tagId: number) => {
    setFormData(prev => {
      const selectedTags = [...prev.selectedTags];
      const index = selectedTags.indexOf(tagId);
      
      if (index === -1) {
        selectedTags.push(tagId);
      } else {
        selectedTags.splice(index, 1);
      }
      
      return {
        ...prev,
        selectedTags
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const url = isEditing 
        ? `/api/projects/${projectId}/tasks/${task.task_id}` 
        : `/api/projects/${projectId}/tasks`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save task');
      }
      
      // Redirect back to project details page after successful submission
      router.push(`/projects/${projectId}`);
      router.refresh();
      
    } catch (error: any) {
      console.error('Error saving task:', error);
      setError(error.message || 'Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
          ← Back to Project
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="task_name">
              Task Name *
            </label>
            <input
              type="text"
              id="task_name"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="priority">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="due_date">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {tags.length > 0 && (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <div key={tag.tag_id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`tag-${tag.tag_id}`}
                      checked={formData.selectedTags.includes(tag.tag_id)}
                      onChange={() => handleTagChange(tag.tag_id)}
                      className="mr-2"
                    />
                    <label htmlFor={`tag-${tag.tag_id}`} className="text-sm">
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Link
              href={`/projects/${projectId}`}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;