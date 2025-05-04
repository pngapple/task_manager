// app/api/projects/[projectId]/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Task }   from '@prisma/client';

/* ─────────── POST  /api/projects/:projectId/tasks ─────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = Number(params.projectId);
    if (isNaN(projectId))
      return NextResponse.json({ error: 'Bad project ID' }, { status: 400 });

    const body = await req.json();
    if (!body.task_name)
      return NextResponse.json({ error: 'Task name required' }, { status: 400 });

    /* Call the stored procedure with bound parameters */
    const rows = await prisma.$queryRaw<Task[]>`
      SELECT * FROM create_task(
        ${projectId}::int,
        ${body.task_name}::text,
        ${body.description}::text,
        ${body.status}::text,
        ${body.priority}::text,
        ${body.due_date ? new Date(body.due_date) : null}::date
      )
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

/* ─────────── GET  /api/projects/:projectId/tasks ───────────
   ?field=due_date|status&order=asc|desc
────────────────────────────────────────────────────────────── */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = Number(params.projectId);
    if (isNaN(projectId))
      return NextResponse.json({ error: 'Bad project ID' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const field = searchParams.get('field')  ?? 'due_date';           // safe list
    const order = (searchParams.get('order') as 'asc' | 'desc') ?? 'asc';

    const orderBy =
      field === 'status'
        ? { status: order }
        : { due_date: order };

    const tasks = await prisma.task.findMany({
      where:  { project_id: projectId },
      orderBy,
    });

    return NextResponse.json(tasks);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
