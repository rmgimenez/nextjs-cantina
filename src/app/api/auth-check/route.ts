import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifySessionToken } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  console.log('Auth check requested');

  // Verifica cookie primeiro
  let token = req.cookies.get(COOKIE_NAME)?.value;
  console.log('Token from cookie:', token ? 'exists' : 'not found');

  // Em desenvolvimento, também verifica se foi passado via header
  if (!token && process.env.NODE_ENV !== 'production') {
    token = req.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token from header:', token ? 'exists' : 'not found');
  }

  if (!token) {
    console.log('No token found anywhere');
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifySessionToken(token);
  console.log('Token verification result:', payload ? 'valid' : 'invalid');

  if (!payload) {
    console.log('Invalid token');
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  console.log('Valid session for user:', payload.usuario);
  return NextResponse.json({
    authenticated: true,
    user: { id: payload.id, nome: payload.nome, tipo: payload.tipo },
  });
}
