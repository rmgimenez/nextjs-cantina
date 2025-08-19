import bcrypt from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';
import jwt from 'jsonwebtoken';
import { query } from './db';

// Use the same default secret as middleware to avoid verification mismatch in dev
const JWT_SECRET = process.env.JWT_SECRET || 'cantina-secret-key';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'cantina_session';

export async function verifyUserCredentials(usuario: string, senha: string) {
  try {
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
      'SELECT codigo as id, nome, senha FROM funcionarios WHERE email = ? OR email_pessoal = ? OR cpf = ? LIMIT 1',
      [usuario, usuario, usuario]
    );
    if (f && f.length > 0) {
      const uf = f[0];
      if (uf.senha && uf.senha === senha) {
        return { id: uf.id, usuario, nome: uf.nome, tipo: 'ATENDENTE' };
      }
    }
    return null;
  } catch (err: any) {
    console.error('verifyUserCredentials error:', err && err.stack ? err.stack : err);
    // On DB errors, return null so the API route responds with a controlled error
    return null;
  }
}

// Prefer jose (compatível com Edge). Mantém fallback para jsonwebtoken se necessário.
export async function createSessionToken(payload: any): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 8; // 8h
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(JWT_SECRET_KEY);
    return token;
  } catch (e) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  }
}

export function verifySessionToken(token: string): Promise<any | null> | any | null {
  return jwtVerify(token, JWT_SECRET_KEY)
    .then((result: any) => result?.payload as any)
    .catch(() => {
      try {
        return jwt.verify(token, JWT_SECRET) as any;
      } catch (e) {
        return null;
      }
    });
}

export function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: false, // Sempre false para desenvolvimento local funcionar
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  };
}

export { COOKIE_NAME };
