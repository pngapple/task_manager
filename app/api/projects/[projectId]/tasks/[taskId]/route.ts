// app/api/projects/[projectId]/tasks/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Task }   from '@prisma/client';

/* ─────────────────────────  GET  /tasks/:taskId  ───────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  const projectId = Number(params.projectId);
  const taskId    = Number(params.taskId);

  if ([projectId, taskId].some(isNaN)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const task = await prisma.task.findUnique({
    where: {
      task_id_project_id: { task_id: taskId, project_id: projectId },
    },
  });

  return task
    ? NextResponse.json(task)
    : NextResponse.json({ error: 'Task not found' }, { status: 404 });
}

/* ─────────────────────────  PUT  /tasks/:taskId  ───────────────────────── */
export async function PUT(
  req: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  const projectId = Number(params.projectId);
  const taskId    = Number(params.taskId);

  if ([projectId, taskId].some(isNaN)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const body = await req.json();
  if (!body.task_name) {
    return NextResponse.json({ error: 'Task name required' }, { status: 400 });
  }

  try {
    /* call the stored procedure update_task() */
    const rows = await prisma.$queryRaw<Task[]>`
      SELECT * FROM update_task(
        ${taskId}::int,
        ${projectId}::int,
        ${body.task_name}::text,
        ${body.description}::text,
        ${body.status}::text,
        ${body.priority}::text,
        ${body.due_date ? new Date(body.due_date) : null}::date
      )
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

/* ────────────────────────  DELETE  /tasks/:taskId  ─────────────────────── */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  const projectId = Number(params.projectId);
  const taskId    = Number(params.taskId);

  if ([projectId, taskId].some(isNaN)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.task.delete({
      where: { task_id_project_id: { task_id: taskId, project_id: projectId } },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
