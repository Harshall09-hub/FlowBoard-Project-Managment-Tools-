import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(id, userId);

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const members = db.prepare(`
    SELECT u.id, u.name, u.email, u.avatar_url, pm.role, pm.joined_at
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
    ORDER BY pm.joined_at ASC
  `).all(id);

  const columns = db.prepare(
    'SELECT * FROM columns WHERE project_id = ? ORDER BY position ASC'
  ).all(id);

  const tasks = db.prepare(`
    SELECT t.*,
      u.name as creator_name,
      a.name as assignee_name,
      a.avatar_url as assignee_avatar
    FROM tasks t
    LEFT JOIN users u ON t.creator_id = u.id
    LEFT JOIN users a ON t.assignee_id = a.id
    WHERE t.project_id = ?
    ORDER BY t.position ASC
  `).all(id);

  const userRole = membership.role;

  return NextResponse.json({ project, members, columns, tasks, userRole });
}

export async function PUT(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(id, userId);

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return NextResponse.json({ error: 'Not authorized to edit this project' }, { status: 403 });
  }

  const { name, description, color } = await request.json();

  db.prepare(
    'UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description), color = COALESCE(?, color) WHERE id = ?'
  ).run(name || null, description ?? null, color || null, id);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  return NextResponse.json({ project });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (project.owner_id !== parseInt(userId)) {
    return NextResponse.json({ error: 'Only the owner can delete this project' }, { status: 403 });
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
