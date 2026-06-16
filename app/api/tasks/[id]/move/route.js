import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');
  const { column_id, position } = await request.json();

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

  const updateTasks = db.transaction(() => {
    if (column_id && column_id !== task.column_id) {
      db.prepare('UPDATE tasks SET position = position - 1 WHERE column_id = ? AND position > ?').run(
        task.column_id, task.position
      );

      db.prepare('UPDATE tasks SET position = position + 1 WHERE column_id = ? AND position >= ?').run(
        column_id, position
      );

      db.prepare(
        'UPDATE tasks SET column_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(column_id, position, id);
    } else {
      const oldPos = task.position;
      if (position > oldPos) {
        db.prepare(
          'UPDATE tasks SET position = position - 1 WHERE column_id = ? AND position > ? AND position <= ?'
        ).run(task.column_id, oldPos, position);
      } else if (position < oldPos) {
        db.prepare(
          'UPDATE tasks SET position = position + 1 WHERE column_id = ? AND position >= ? AND position < ?'
        ).run(task.column_id, position, oldPos);
      }
      db.prepare(
        'UPDATE tasks SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(position, id);
    }
  });

  try {
    updateTasks();
    const updated = db.prepare(`
      SELECT t.*, u.name as creator_name, a.name as assignee_name, a.avatar_url as assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.creator_id = u.id
      LEFT JOIN users a ON t.assignee_id = a.id
      WHERE t.id = ?
    `).get(id);

    return NextResponse.json({ task: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to move task' }, { status: 500 });
  }
}
