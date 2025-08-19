import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, createSessionToken, verifyUserCredentials } from '../../../lib/auth';

export async function POST(req: NextRequest) {
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
  res.headers.set('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=28800`);
  return res;
}
