import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');

  const task = db.prepare(`
    SELECT t.*, u.name as creator_name, a.name as assignee_name, a.avatar_url as assignee_avatar
    FROM tasks t
    LEFT JOIN users u ON t.creator_id = u.id
    LEFT JOIN users a ON t.assignee_id = a.id
    WHERE t.id = ?
  `).get(id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(task.project_id, userId);

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });
  }

  return NextResponse.json({ task });
}

export async function PUT(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');
  const body = await request.json();

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(task.project_id, userId);

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });
  }

  const { title, description, priority, due_date, assignee_id, column_id, position } = body;

  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      priority = COALESCE(?, priority),
      due_date = COALESCE(?, due_date),
      assignee_id = COALESCE(?, assignee_id),
      column_id = COALESCE(?, column_id),
      position = COALESCE(?, position),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || null,
    description ?? null,
    priority || null,
    due_date ?? null,
    assignee_id ?? null,
    column_id || null,
    position ?? null,
    id
  );

  const updated = db.prepare(`
    SELECT t.*, u.name as creator_name, a.name as assignee_name, a.avatar_url as assignee_avatar
    FROM tasks t
    LEFT JOIN users u ON t.creator_id = u.id
    LEFT JOIN users a ON t.assignee_id = a.id
    WHERE t.id = ?
  `).get(id);

  return NextResponse.json({ task: updated });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(task.project_id, userId);

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
