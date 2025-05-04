-- CreateIndex
CREATE INDEX "task_project_due_idx" ON "Task"("project_id", "due_date");

-- CreateIndex
CREATE INDEX "task_project_status_idx" ON "Task"("project_id", "status");
