import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, issueSessionCookie, refreshSessionTokenIfNeeded } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  console.log('Session check requested');
  console.log('All cookies:', req.cookies.getAll());

  const token = req.cookies.get(COOKIE_NAME)?.value;
  console.log('Token from cookie:', token ? `found (${token.substring(0, 20)}...)` : 'not found');

  if (!token) {
    console.log('No token found, returning 401');
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const refreshed = await refreshSessionTokenIfNeeded(token);
  if (!refreshed) {
    console.log('Invalid token, returning 401');
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { payload, token: newToken, refreshed: didRefresh } = refreshed;
  if (didRefresh) {
    console.log('Session token refreshed');
  } else {
    console.log('Session token still valid (no refresh)');
  }
  const res = NextResponse.json({
    authenticated: true,
    refreshed: didRefresh,
    user: { id: (payload as any).id, nome: (payload as any).nome, tipo: (payload as any).tipo },
  });
  if (didRefresh) {
    issueSessionCookie(res, newToken);
  }
  return res;
}
