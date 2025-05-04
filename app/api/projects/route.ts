// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects
// Returns all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects
// Creates a new project
export async function POST(request: NextRequest) {
  try {
    const { project_name, description } = await request.json();

    if (!project_name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        project_name,
        description,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);

    // Check for unique constraint errors, etc.
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A project with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects
// Deletes a project using { id: number } in the JSON body
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // If project_id is an Int, ensure we parse it
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if project exists first
    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Then delete all tasks in the project
    await prisma.task.deleteMany({
      where: {
        project_id: projectId
      }
    });

    // Now delete the project
    const deletedProject = await prisma.project.delete({
      where: { project_id: projectId },
    });

    return NextResponse.json(deletedProject);
  } catch (error: any) {
    console.error('Error deleting project:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete project: ' + error.message },
      { status: 500 }
    );
  }
}