import { NextResponse } from 'next/server';
import { findUserByUsername, verifyPassword } from '../../../../lib/auth';
import { COOKIE_NAME, signToken } from '../../../../lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { usuario, senha } = body;
    if (!usuario || !senha)
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 });

    const user = await findUserByUsername(usuario);
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });

    const ok = await verifyPassword(senha, user.senha);
    if (!ok) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });

    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, nome: user.nome, usuario: user.usuario },
    });

    // Criar cookie de sessão
    const token = signToken({
      id: user.id,
      nome: user.nome,
      perfil: user.id_perfil,
    });
    const isProd = process.env.NODE_ENV === 'production';
    const cookie = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${8 * 3600}${
      isProd ? '; Secure' : ''
    }`;

    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
