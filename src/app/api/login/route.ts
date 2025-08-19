import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, createSessionToken, verifyUserCredentials } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usuario, senha } = body || {};
    if (!usuario || !senha) {
      return NextResponse.json({ error: 'usuario_e_senha_obrigatorios' }, { status: 400 });
    }

    const user = await verifyUserCredentials(usuario, senha);
    if (!user) {
      return NextResponse.json({ error: 'credenciais_invalidas' }, { status: 401 });
    }

    const token = createSessionToken({
      id: user.id,
      usuario: user.usuario,
      nome: user.nome,
      tipo: user.tipo,
    });

    const res = NextResponse.json({
      ok: true,
      usuario: { id: user.id, nome: user.nome, tipo: user.tipo },
    });
    // Ensure cookie is exposed as a Set-Cookie header so browsers receive it.
    res.headers.set('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=28800`);
    return res;
  } catch (err: any) {
    // Log the error server-side for debugging and return a JSON error to the client
    // so the client doesn't remain in a permanent loading state.
    console.error('Error in /api/login POST:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
