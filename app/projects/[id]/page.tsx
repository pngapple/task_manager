// app/projects/[id]/page.tsx

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EnhancedTaskTable from '@/app/components/EnhancedTaskTable';

type ProjectDetailProps = {
  params: { id: string };
};

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  // Use await for params to fix the error with dynamic routes
  const resolvedParams = await Promise.resolve(params);
  const projectId = parseInt(resolvedParams.id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  // Fetch the project, including tasks/tags
  const project = await prisma.project.findUnique({
    where: { project_id: projectId },
    include: {
      tasks: {
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          due_date: 'asc',
        }
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Fetch all available tags for the task form
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // Common padding for consistent alignment
  const commonPadding = "px-6";

  return (
    <div className="container mx-auto px-6" style={{ paddingTop: "10px", paddingBottom: "24px" }}>
      <div className="mb-10" style={{ paddingTop: "10px" }}>
        <Link 
          href="/projects" 
          className="text-blue-600 hover:underline inline-flex items-center"
          style={{
            textDecoration: 'none',
            color: '#F1EFEC',
            backgroundColor: '#123458',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
            marginBottom: '200px',
            /*marginLeft: '-20px',*/
          }}
        >
          ← Back to Projects
        </Link>
      </div>
      
      <div 
        className="mb-8 py-8"
        style={{
          backgroundColor: '#D4C9BE',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          marginTop: '20px',
          /*marginLeft: '-20px'*/
        }}
      >
        <div className={commonPadding}>
          <h1 
            className="text-3xl font-bold mb-5"
            style={{
              color: '#F1EFEC',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              marginLeft: '20px'
            }}
          >
            {project.project_name}
          </h1>
          <p 
            className="text-lg pl-4 border-l-4 border-white/50 mb-3"
            style={{
              color: '#F1EFEC',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              paddingBottom: '8px',
              marginLeft: '20px'
            }}
          >
            {project.description || 'No description available.'}
          </p>
        </div>
      </div>

      <div 
        className="py-6 bg-white/90 backdrop-blur-sm"
        style={{
          backgroundColor: '#D4C9BE',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          borderRadius: '20px',
          marginTop: '10px',
        }}
      >
        <div className={commonPadding}>
          <EnhancedTaskTable 
            initialTasks={project.tasks} 
            projectId={project.project_id}
            availableTags={tags}
          />
        </div>
      </div>
    </div>
  );
}