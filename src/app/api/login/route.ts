import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, createSessionToken, verifyUserCredentials } from '../../../lib/auth';

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
      token: token, // Enviamos o token na resposta também
      usuario: { id: user.id, nome: user.nome, tipo: user.tipo },
    });

    // Configuração do cookie - usar httpOnly: false em desenvolvimento
    const isProd = process.env.NODE_ENV === 'production';
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: false, // false para permitir acesso via JavaScript em dev
      secure: false, // false para desenvolvimento local
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    });

    console.log('Cookie set via res.cookies.set with httpOnly: false');

    console.log('Cookie set with token');

    return res;
  } catch (err: any) {
    // Log the error server-side for debugging and return a JSON error to the client
    // so the client doesn't remain in a permanent loading state.
    console.error('Error in /api/login POST:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
