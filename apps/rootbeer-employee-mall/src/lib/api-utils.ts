import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import { ADMIN_EMAIL } from '@/types';

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }) };
  }
  if (user.role === 'pending') {
    return { user: null, error: NextResponse.json({ error: '승인 대기 중입니다' }, { status: 403 }) };
  }
  return { user, error: null };
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }) };
  }
  if (user.email !== ADMIN_EMAIL) {
    return { user: null, error: NextResponse.json({ error: '권한이 없습니다' }, { status: 403 }) };
  }
  return { user, error: null };
}
