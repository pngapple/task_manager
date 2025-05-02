// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create some initial tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { tag_id: 1 },
      update: {},
      create: { name: 'Frontend' },
    }),
    prisma.tag.upsert({
      where: { tag_id: 2 },
      update: {},
      create: { name: 'Backend' },
    }),
    prisma.tag.upsert({
      where: { tag_id: 3 },
      update: {},
      create: { name: 'Bug' },
    }),
    prisma.tag.upsert({
      where: { tag_id: 4 },
      update: {},
      create: { name: 'Feature' },
    }),
    prisma.tag.upsert({
      where: { tag_id: 5 },
      update: {},
      create: { name: 'Documentation' },
    }),
  ]);

  console.log(`Created ${tags.length} tags`);
  
  // You can comment out or remove the example projects below
  // if you don't want to seed any initial projects
  
  /*
  // Create a sample project
  const project = await prisma.project.create({
    data: {
      project_name: 'Sample Project',
      description: 'This is a sample project to get you started.',
      tasks: {
        create: [
          {
            task_name: 'Set up database',
            description: 'Configure the PostgreSQL database',
            priority: 'High',
            status: 'Completed',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            taskTags: {
              create: [
                { tag: { connect: { tag_id: 2 } } },
                { tag: { connect: { tag_id: 4 } } },
              ]
            }
          },
          {
            task_name: 'Create UI components',
            description: 'Design and implement key UI components',
            priority: 'Medium',
            status: 'In Progress',
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            taskTags: {
              create: [
                { tag: { connect: { tag_id: 1 } } },
                { tag: { connect: { tag_id: 4 } } },
              ]
            }
          }
        ]
      }
    },
  });

  console.log(`Created sample project with ID: ${project.project_id}`);
  */
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });