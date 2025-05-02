// app/components/ProjectList.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';

type Project = {
  project_id: number;
  project_name: string;
  description?: string | null;
};

export default function ProjectList({ projects }: { projects: Project[] }) {
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);

  async function handleDelete(projectId: number) {
    const response = await fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId }),
    });

    if (response.ok) {
      setLocalProjects((prev) =>
        prev.filter((project) => project.project_id !== projectId)
      );
    } else {
      const data = await response.json();
      alert(data?.error || 'Failed to delete project');
    }
  }

  return (
    <div className="project-list-container">
      {localProjects.map((project) => (
        <div key={project.project_id} className="project-card">
          <h2 className="project-name">{project.project_name}</h2>
          <p className="project-description">{project.description || 'No description provided'}</p>
          <div className="project-actions">
            <Link href={`/projects/${project.project_id}`} className="view-details-btn">
              View Details
            </Link>
            <button onClick={() => handleDelete(project.project_id)} className="delete-btn">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
