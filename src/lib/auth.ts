import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const COOKIE_NAME = 'cantina_session';

export async function verifyUserCredentials(usuario: string, senha: string) {
  // First try to find in cant_usuarios
  const rows = await query<any[]>(
    'SELECT id, usuario, senha_hash, ativo, nome, tipo FROM cant_usuarios WHERE usuario = ?',
    [usuario]
  );
  if (rows && rows.length > 0) {
    const u = rows[0];
    if (!u.ativo) return null;
    const match = await bcrypt.compare(senha, u.senha_hash);
    if (match) {
      return { id: u.id, usuario: u.usuario, nome: u.nome, tipo: u.tipo };
    }
  }

  // Fallback: try funcionarios table with plain senha field (legacy)
  const f = await query<any[]>(
    'SELECT codigo as id, nome, senha FROM funcionarios WHERE usuario = ? OR email = ? LIMIT 1',
    [usuario, usuario]
  );
  if (f && f.length > 0) {
    const uf = f[0];
    if (uf.senha && uf.senha === senha) {
      return { id: uf.id, usuario, nome: uf.nome, tipo: 'ATENDENTE' };
    }
  }
  return null;
}

export function createSessionToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifySessionToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}

export function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 8,
  };
}

export { COOKIE_NAME };
