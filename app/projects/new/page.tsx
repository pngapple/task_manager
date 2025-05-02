// app/projects/new/page.tsx

"use client"; // Must be the first line

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_name: projectName,
        description
      })
    });

    if (res.ok) {
      // On success, go back to Projects list
      router.push('/projects');
    } else {
      const data = await res.json();
      alert(data?.error || 'Failed to create project');
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#EEF1DA] mb-6 text-center drop-shadow-md">
        Add New Project
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
        {/* Project Name Input */}
        <div>
          <label htmlFor="project_name" className="block font-medium text-gray-800 mb-2">
            Project Name
          </label>
          <input
            id="project_name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block font-medium text-gray-800 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all ease-in-out duration-300 w-full"
        >
          Add Project
        </button>
      </form>
    </div>
  );
}
