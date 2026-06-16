import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  const userId = request.headers.get('x-user-id');
  const { column_id, project_id, title, description, priority, assignee_id, due_date } = await request.json();

  if (!column_id || !project_id || !title || !title.trim()) {
    return NextResponse.json({ error: 'Column, project, and title are required' }, { status: 400 });
  }

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(project_id, userId);

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });
  }

  const maxPos = db.prepare(
    'SELECT MAX(position) as maxPos FROM tasks WHERE column_id = ?'
  ).get(column_id);

  const position = (maxPos?.maxPos ?? -1) + 1;

  const result = db.prepare(`
    INSERT INTO tasks (column_id, project_id, title, description, priority, due_date, assignee_id, creator_id, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(column_id, project_id, title.trim(), description || '', priority || 'medium', due_date || null, assignee_id || null, userId, position);

  const task = db.prepare(`
    SELECT t.*, u.name as creator_name, a.name as assignee_name, a.avatar_url as assignee_avatar
    FROM tasks t
    LEFT JOIN users u ON t.creator_id = u.id
    LEFT JOIN users a ON t.assignee_id = a.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);

  return NextResponse.json({ task }, { status: 201 });
}
