import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const userId = request.headers.get('x-user-id');

  const projects = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
    FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ?
    ORDER BY p.created_at DESC
  `).all(userId);

  return NextResponse.json({ projects });
}

export async function POST(request) {
  const userId = request.headers.get('x-user-id');
  const { name, description, color } = await request.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  const result = db.prepare(
    'INSERT INTO projects (name, description, color, owner_id) VALUES (?, ?, ?, ?)'
  ).run(name.trim(), description || '', color || '#6366f1', userId);

  const projectId = result.lastInsertRowid;

  db.prepare(
    'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)'
  ).run(projectId, userId, 'owner');

  const columns = [
    { title: 'To Do', position: 0 },
    { title: 'In Progress', position: 1 },
    { title: 'Review', position: 2 },
    { title: 'Done', position: 3 },
  ];

  const insertColumn = db.prepare(
    'INSERT INTO columns (project_id, title, position) VALUES (?, ?, ?)'
  );

  for (const col of columns) {
    insertColumn.run(projectId, col.title, col.position);
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

  return NextResponse.json({ project }, { status: 201 });
}
