// app/components/EnhancedTaskTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@prisma/client';

interface Props {
  initialTasks: Task[];
  projectId: number;
}

/* -------------------- helpers -------------------- */
function iso(date: Date) {
  return date.toISOString().split('T')[0]; // YYYY‑MM‑DD
}
/* ------------------------------------------------- */

const EnhancedTaskTable: React.FC<Props> = ({ initialTasks, projectId }) => {
  /* ---------- state ---------- */
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const [sortField, setSortField] = useState<'due_date' | 'status'>('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isAdding, setIsAdding]   = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  type LocalTask = {
    task_name: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;       // <‑‑ string in local state
  };

  const empty: LocalTask = {
    task_name: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    due_date: '',
  };

  const [newTask, setNewTask]   = useState<LocalTask>(empty);
  const [editTask, setEditTask] = useState<LocalTask | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  /* ---------- refetch on sort change ---------- */
  useEffect(() => {
    async function fetchSorted() {
      const res = await fetch(
        `/api/projects/${projectId}/tasks?field=${sortField}&order=${sortOrder}`
      );
      if (res.ok) setTasks(await res.json());
    }
    fetchSorted();
  }, [projectId, sortField, sortOrder]);

  /* ---------- input handler ---------- */
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    isNew: boolean
  ) => {
    const { name, value } = e.target;
    if (isNew) setNewTask((p) => ({ ...p, [name]: value }));
    else setEditTask((p) => (p ? { ...p, [name]: value } : p));
  };

  /* ---------- ADD ---------- */
  const handleAdd = async () => {
    if (!newTask.task_name.trim()) { setError('Task name required'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          due_date: newTask.due_date ? new Date(newTask.due_date) : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setTasks((t) => [...t, created]);
      setIsAdding(false); setNewTask(empty);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  /* ---------- SAVE ---------- */
  const handleSave = async (taskId: number) => {
    if (!editTask || !editTask.task_name.trim()) { setError('Task name required'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editTask,
          due_date: editTask.due_date ? new Date(editTask.due_date) : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setTasks((ts) => ts.map((t) => (t.task_id === taskId ? updated : t)));
      setEditingId(null); setEditTask(null);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: number) => {
    if (!confirm('Delete task?')) return;
    setLoading(true);
    await fetch(`/api/projects/${projectId}/tasks/${id}`, { method: 'DELETE' });
    setTasks((ts) => ts.filter((t) => t.task_id !== id));
    setLoading(false);
  };

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">

      {/* error */}
      {error && (
        <div className="bg-red-100 text-red-700 border px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* sort bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm">Sort by:</span>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as any)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="due_date">Due Date</option>
          <option value="status">Status</option>
        </select>
        <button
          onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
          className="border rounded px-2 py-1 text-sm"
        >
          {sortOrder === 'asc' ? '▲' : '▼'}
        </button>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
        >
          {isAdding ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-800 text-white text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Task</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="bg-gray-50">
                <td className="px-4 py-3"><input
                  name="task_name"
                  value={newTask.task_name}
                  onChange={(e) => handleInput(e, true)}
                  className="w-full border rounded px-2 py-1"
                /></td>
                <td className="px-4 py-3"><select
                  name="status"
                  value={newTask.status}
                  onChange={(e) => handleInput(e, true)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option>Not Started</option><option>In Progress</option><option>Completed</option>
                </select></td>
                <td className="px-4 py-3"><select
                  name="priority"
                  value={newTask.priority}
                  onChange={(e) => handleInput(e, true)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option>Low</option><option>Medium</option><option>High</option>
                </select></td>
                <td className="px-4 py-3"><input
                  type="date"
                  name="due_date"
                  value={newTask.due_date}
                  onChange={(e) => handleInput(e, true)}
                  className="w-full border rounded px-2 py-1"
                /></td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={handleAdd} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                    Save
                  </button>
                </td>
              </tr>
            )}

            {tasks.map((t) => (
              <tr key={t.task_id} className="border-t">
                {editingId === t.task_id ? (
                  <>
                    <td className="px-4 py-3"><input
                      name="task_name"
                      value={editTask?.task_name || ''}
                      onChange={(e) => handleInput(e, false)}
                      className="w-full border rounded px-2 py-1"
                    /></td>
                    <td className="px-4 py-3"><select
                      name="status"
                      value={editTask?.status || 'Not Started'}
                      onChange={(e) => handleInput(e, false)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option>Not Started</option><option>In Progress</option><option>Completed</option>
                    </select></td>
                    <td className="px-4 py-3"><select
                      name="priority"
                      value={editTask?.priority || 'Medium'}
                      onChange={(e) => handleInput(e, false)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select></td>
                    <td className="px-4 py-3"><input
                      type="date"
                      name="due_date"
                      value={editTask?.due_date || ''}
                      onChange={(e) => handleInput(e, false)}
                      className="w-full border rounded px-2 py-1"
                    /></td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleSave(t.task_id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditTask(null); }}
                        className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">{t.task_name}</td>
                    <td className="px-4 py-3">{t.status}</td>
                    <td className="px-4 py-3">{t.priority}</td>
                    <td className="px-4 py-3">{t.due_date ? iso(new Date(t.due_date)) : '—'}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => { setEditingId(t.task_id); setEditTask({
                          task_name: t.task_name,
                          description: t.description ?? '',
                          status: t.status,
                          priority: t.priority,
                          due_date: t.due_date ? iso(new Date(t.due_date)) : '',
                        }); }}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.task_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnhancedTaskTable;
