// lib/data.ts
import { prisma } from '../lib/prisma';
import { Project, Task, Tag, TaskTag } from '@prisma/client';

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
        include: {
          taskTags: {
            include: {
              tag: true
            }
          }
        }
      }
    }
  });
}

export async function getTasks(projectId: number) {
  return prisma.task.findMany({
    where: {
      project_id: projectId
    },
    include: {
      taskTags: {
        include: {
          tag: true
        }
      }
    }
  });
}

export async function getTaskById(projectId: number, taskId: number) {
  return prisma.task.findUnique({
    where: {
      task_id_project_id: {
        task_id: taskId,
        project_id: projectId
      }
    },
    include: {
      taskTags: {
        include: {
          tag: true
        }
      }
    }
  });
}

export async function getTags() {
  return prisma.tag.findMany();
}