-- CreateTable
CREATE TABLE "Project" (
    "project_id" SERIAL NOT NULL,
    "project_name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Task" (
    "task_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "task_name" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "due_date" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "Tag" (
    "tag_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "TaskTag" (
    "task_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "TaskTag_pkey" PRIMARY KEY ("task_id","project_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_task_id_project_id_key" ON "Task"("task_id", "project_id");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_task_id_project_id_fkey" FOREIGN KEY ("task_id", "project_id") REFERENCES "Task"("task_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("tag_id") ON DELETE RESTRICT ON UPDATE CASCADE;
