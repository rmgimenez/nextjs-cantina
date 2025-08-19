import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, issueSessionCookie, verifyUserCredentials } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usuario, senha } = body || {};
    console.log('Login attempt for user:', usuario);

    if (!usuario || !senha) {
      return NextResponse.json({ error: 'usuario_e_senha_obrigatorios' }, { status: 400 });
    }

    const user = await verifyUserCredentials(usuario, senha);
    if (!user) {
      console.log('Invalid credentials for user:', usuario);
      return NextResponse.json({ error: 'credenciais_invalidas' }, { status: 401 });
    }

    console.log('User authenticated successfully:', user);

    const token = await createSessionToken({
      id: user.id,
      usuario: user.usuario,
      nome: user.nome,
      tipo: user.tipo,
    });

    console.log('Token created successfully');

    const res = NextResponse.json({
      ok: true,
      usuario: { id: user.id, nome: user.nome, tipo: user.tipo },
    });
    issueSessionCookie(res, token);
    console.log('Session cookie issued');
    return res;
  } catch (err: any) {
    // Log the error server-side for debugging and return a JSON error to the client
    // so the client doesn't remain in a permanent loading state.
    console.error('Error in /api/login POST:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
