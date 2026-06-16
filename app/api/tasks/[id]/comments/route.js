import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  const { id: taskId } = params;
  const userId = request.headers.get('x-user-id');

  const task = db.prepare('SELECT project_id FROM tasks WHERE id = ?').get(taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(task.project_id, userId);

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });
  }

  const comments = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.task_id = ?
    ORDER BY c.created_at ASC
  `).all(taskId);

  return NextResponse.json({ comments });
}

export async function POST(request, { params }) {
  const { id: taskId } = params;
  const userId = request.headers.get('x-user-id');
  const { content } = await request.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const task = db.prepare('SELECT project_id FROM tasks WHERE id = ?').get(taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(task.project_id, userId);

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });
  }

  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)'
  ).run(taskId, userId, content.trim());

  const comment = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  return NextResponse.json({ comment }, { status: 201 });
}
