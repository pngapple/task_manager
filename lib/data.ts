// lib/data.ts
import { prisma } from '../lib/prisma';
import { Project, Task} from '@prisma/client';
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getProjects() {
  return prisma.project.findMany({
    include: {
      _count: {
        select: { tasks: true }, // This will return the count of tasks for each project
      }
    }
  });
}

export async function getProjectById(id: number) {
  return prisma.project.findUnique({
    where: { project_id: id },
    include: {
      tasks: {
      }
    }
  });
}

export async function getTasks(projectId: number) {
  return prisma.task.findMany({
    where: {
      project_id: projectId
    },
  });
}

export async function getTaskById(projectId: number, taskId: number) {
  return prisma.task.findUnique({
    where: {
      task_id_project_id: {
        task_id: taskId,
        project_id: projectId
      }
    }
  });
}