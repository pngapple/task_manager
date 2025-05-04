/* ---------- create_task ---------- */
CREATE OR REPLACE FUNCTION create_task(
  p_project_id  INT,
  p_task_name   TEXT,
  p_description TEXT,
  p_status      TEXT,
  p_priority    TEXT,
  p_due_date    DATE DEFAULT NULL
)
RETURNS SETOF "Task"
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO "Task" (project_id, task_name, description, status, priority, due_date)
  VALUES (p_project_id, p_task_name, p_description, p_status, p_priority, p_due_date)
  RETURNING *;
END;
$$;

/* ---------- update_task ---------- */
CREATE OR REPLACE FUNCTION update_task(
  p_task_id     INT,
  p_project_id  INT,
  p_task_name   TEXT,
  p_description TEXT,
  p_status      TEXT,
  p_priority    TEXT,
  p_due_date    DATE DEFAULT NULL
)
RETURNS SETOF "Task"
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE "Task"
  SET task_name  = p_task_name,
      description= p_description,
      status     = p_status,
      priority   = p_priority,
      due_date   = p_due_date
  WHERE task_id = p_task_id
    AND project_id = p_project_id
  RETURNING *;
END;
$$;
