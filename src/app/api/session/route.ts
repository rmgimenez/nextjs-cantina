import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifySessionToken } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  console.log('Session check requested');
  console.log('All cookies:', req.cookies.getAll());

  const token = req.cookies.get(COOKIE_NAME)?.value;
  console.log('Token from cookie:', token ? `found (${token.substring(0, 20)}...)` : 'not found');

  if (!token) {
    console.log('No token found, returning 401');
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  console.log('Token verification result:', payload ? 'valid' : 'invalid');

  if (!payload) {
    console.log('Invalid token, returning 401');
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  console.log('Valid session for user:', (payload as any).usuario);
  return NextResponse.json({
    authenticated: true,
    user: { id: (payload as any).id, nome: (payload as any).nome, tipo: (payload as any).tipo },
  });
}
