import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = db.prepare(
    'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?'
  ).get(userId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
