/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskTag" DROP CONSTRAINT "TaskTag_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "TaskTag" DROP CONSTRAINT "TaskTag_task_id_project_id_fkey";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "TaskTag";
