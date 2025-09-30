import bcrypt from 'bcryptjs';
import { query } from './db';
import { COOKIE_NAME, signToken, verifyToken } from './jwt';

interface User {
  id: number;
  nome: string;
  usuario: string;
  senha: string;
  id_perfil: number;
  ativo: number;
}

export async function findUserByUsername(usuario: string): Promise<User | null> {
  const rows = await query('SELECT * FROM cant_usuarios_cantina WHERE usuario = ? LIMIT 1', [
    usuario,
  ]);
  return rows && rows[0] ? (rows[0] as User) : null;
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function createSessionCookie(
  res: { setHeader: (name: string, value: string) => void },
  user: User
) {
  const token = signToken({
    id: user.id,
    nome: user.nome,
    perfil: user.id_perfil,
  });
  const isProd = process.env.NODE_ENV === 'production';
  // cookie HttpOnly
  const cookie = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${8 * 3600}${
    isProd ? '; Secure' : ''
  }`;
  res.setHeader('Set-Cookie', cookie);
}

export function clearSessionCookie(res: { setHeader: (name: string, value: string) => void }) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    isProd ? '; Secure' : ''
  }`;
  res.setHeader('Set-Cookie', cookie);
}

export type SessionUser = {
  id: number;
  nome: string;
  perfil: number;
};

export function getUserFromRequest(req: Request): SessionUser | null {
  const cookieHeader = req.headers.get('cookie') || '';
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (!cookie) continue;
    if (cookie.startsWith(`${COOKIE_NAME}=`)) {
      const token = cookie.substring(COOKIE_NAME.length + 1);
      if (!token) return null;
      const user = verifyToken(token);
      if (!user) return null;
      return user;
    }
  }
  return null;
}
