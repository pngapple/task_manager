// app/projects/page.tsx

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProjectList from '@/app/components/ProjectList';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: {
      project_id: 'asc',
    },
  });

  return (
    <div className="projects-page-container">
      <div className="projects-page-content">
        {/* Header */}
        <div className="header">
          <h1 className="projects-title">Projects Dashboard</h1>
          <Link href="/projects/new" className="add-project-btn">
            Add New Project
          </Link>
        </div>

        {/* Project List or Empty State */}
        {projects.length === 0 ? (
          <div className="no-projects-container">
            <p>No projects found. Start by creating your first project!</p>
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
    </div>
  );
}
