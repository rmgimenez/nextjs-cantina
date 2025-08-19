import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '../../../lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // expire cookie
  res.headers.set('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`);
  return res;
}
