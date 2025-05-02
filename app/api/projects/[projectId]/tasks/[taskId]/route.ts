// app/api/projects/[projectId]/tasks/[taskId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/:projectId/tasks/:taskId
// Gets a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const taskId = parseInt(params.taskId, 10);
    
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }
    
    const task = await prisma.task.findUnique({
      where: {
        task_id: taskId,
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/:projectId/tasks/:taskId
// Updates a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    // Await params before using them
    const resolvedParams = await Promise.resolve(params);
    const projectId = parseInt(resolvedParams.projectId, 10);
    const taskId = parseInt(resolvedParams.taskId, 10);
    
    if (isNaN(taskId) || isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid ID values' },
        { status: 400 }
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
    
    // Check if the task exists - using both project_id and task_id
    const existingTask = await prisma.task.findFirst({
      where: {
        task_id: taskId,
        project_id: projectId
      },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // First remove existing tag connections
    await prisma.taskTag.deleteMany({
      where: {
        task_id: taskId,
      },
    });
    
    // Then update the task with new connections
    const updatedTask = await prisma.task.update({
      where: {
        // Use compound key with both task_id and project_id
        task_id_project_id: {
          task_id: taskId,
          project_id: projectId
        }
      },
      data: {
        task_name,
        description,
        status,
        priority,
        due_date: due_date ? new Date(due_date) : null,
      },
    });
    
    // Add tag connections if there are any
    if (selectedTags && selectedTags.length > 0) {
      for (const tagId of selectedTags) {
        await prisma.taskTag.create({
          data: {
            task_id: taskId,
            tag_id: tagId
          }
        });
      }
    }
      
    // Fetch the updated task with tags
    const taskWithTags = await prisma.task.findFirst({
      where: {
        task_id: taskId,
        project_id: projectId
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });
    
    return NextResponse.json(taskWithTags);
  } catch (error) {
    console.error('Error updating task:', error);
    
    return NextResponse.json(
      { error: 'Failed to update task: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/:projectId/tasks/:taskId
// Deletes a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    // Await params before using them
    const resolvedParams = await Promise.resolve(params);
    const projectId = parseInt(resolvedParams.projectId, 10);
    const taskId = parseInt(resolvedParams.taskId, 10);
    
    if (isNaN(taskId) || isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid ID values' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete task ${taskId} from project ${projectId}`);
    
    // First, check if the task exists
    const task = await prisma.task.findFirst({
      where: {
        task_id: taskId,
        project_id: projectId
      },
    });
    
    if (!task) {
      console.log('Task not found for deletion');
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Delete all task-tag relationships first
    console.log('Deleting task tag relationships');
    await prisma.taskTag.deleteMany({
      where: {
        task_id: taskId,
      },
    });
    
    // Then delete the task
    console.log('Deleting the task');
    const deletedTask = await prisma.task.delete({
      where: {
        // Use compound key with both task_id and project_id
        task_id_project_id: {
          task_id: taskId,
          project_id: projectId
        }
      },
    });
    
    console.log('Task successfully deleted');
    return NextResponse.json({ success: true, deletedTask });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete task: ' + error.message },
      { status: 500 }
    );
  }
}