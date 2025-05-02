// app/components/ProjectForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProjectFormProps {
  project?: {
    project_id: number;
    project_name: string;
    description: string | null;
  };
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project }) => {
  const router = useRouter();
  const isEditing = !!project;
  
  const [formData, setFormData] = useState({
    project_name: project?.project_name || '',
    description: project?.description || ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const url = isEditing 
        ? `/api/projects/${project.project_id}` 
        : '/api/projects';
      
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
        throw new Error(errorData.error || 'Failed to save project');
      }
      
      // Redirect back to projects page after successful submission
      router.push('/projects');
      router.refresh();
      
    } catch (error: any) {
      console.error('Error saving project:', error);
      setError(error.message || 'Failed to save project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <Link href="/projects" className="text-blue-600 hover:underline">
          ← Back to Projects
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="project_name">
              Project Name *
            </label>
            <input
              type="text"
              id="project_name"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
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
          
          <div className="flex justify-end space-x-2">
            <Link
              href="/projects"
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;