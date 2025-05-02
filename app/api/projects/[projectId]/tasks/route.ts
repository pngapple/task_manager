// app/api/projects/[projectId]/tasks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/projects/:projectId/tasks
// Creates a new task for a project
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Await params before using them
    const resolvedParams = await Promise.resolve(params);
    const projectId = parseInt(resolvedParams.projectId, 10);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }
    
    // Check if the project exists
    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    const { 
      task_name, 
      description, 
      status, 
      priority, 
      due_date, 
      selectedTags 
    } = await request.json();
    
    if (!task_name) {
      return NextResponse.json(
        { error: 'Task name is required' },
        { status: 400 }
      );
    }
    
    // Create the task with connections to selected tags
    const task = await prisma.task.create({
      data: {
        task_name,
        description,
        status,
        priority,
        due_date: due_date ? new Date(due_date) : null,
        project: {
          connect: { project_id: projectId }
        },
        // Add the tag connections if there are any
        taskTags: selectedTags && selectedTags.length > 0 ? {
          create: selectedTags.map((tagId: number) => ({
            tag: {
              connect: { tag_id: tagId }
            }
          }))
        } : undefined
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// GET /api/projects/:projectId/tasks
// Gets all tasks for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Await params before using them
    const resolvedParams = await Promise.resolve(params);
    const projectId = parseInt(resolvedParams.projectId, 10);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }
    
    const tasks = await prisma.task.findMany({
      where: {
        project_id: projectId,
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        task_id: 'asc',
      },
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}