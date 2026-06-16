import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(id, userId);

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return NextResponse.json({ error: 'Not authorized to add members' }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const existing = db.prepare(
    'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(id, user.id);

  if (existing) {
    return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
  }

  db.prepare(
    'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)'
  ).run(id, user.id, 'member');

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');

  const membership = db.prepare(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(id, userId);

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return NextResponse.json({ error: 'Not authorized to remove members' }, { status: 403 });
  }

  const { userId: targetUserId } = await request.json();

  if (parseInt(targetUserId) === parseInt(userId)) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
  }

  db.prepare(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?'
  ).run(id, targetUserId);

  return NextResponse.json({ success: true });
}
