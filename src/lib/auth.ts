import bcrypt from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';
import { query } from './db';

// Config JWT
const JWT_SECRET = process.env.JWT_SECRET || 'cantina-secret-key';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
export const COOKIE_NAME = 'cantina_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h
const SESSION_REFRESH_THRESHOLD_SECONDS = 60 * 30; // 30 min antes de expirar renova

// Perfis / Roles suportados (RF-002)
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_ATENDENTE = 'ATENDENTE';
export const ROLE_ESTOQUISTA = 'ESTOQUISTA';

export function normalizeTipo(tipo: any): string {
  if (!tipo) return ROLE_ATENDENTE;
  const t = String(tipo).toUpperCase();
  if (t.includes('ADMIN')) return ROLE_ADMIN;
  if (t.includes('ESTOQUI') || t.includes('ESTO') || t.includes('STOQUI')) return ROLE_ESTOQUISTA;
  // default fallback
  return ROLE_ATENDENTE;
}

export function hasAnyRole(payloadOrTipo: any, allowedRoles: string[]): boolean {
  const tipoRaw = typeof payloadOrTipo === 'string' ? payloadOrTipo : payloadOrTipo?.tipo;
  const t = normalizeTipo(tipoRaw);
  return allowedRoles.includes(t);
}

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
        // Normaliza o tipo/perfil para os valores esperados pelo sistema
        const tipo = normalizeTipo(u.tipo);
        return { id: u.id, usuario: u.usuario, nome: u.nome, tipo };
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
        return { id: uf.id, usuario, nome: uf.nome, tipo: ROLE_ATENDENTE };
      }
    }
    return null;
  } catch (err: any) {
    console.error('verifyUserCredentials error:', err && err.stack ? err.stack : err);
    // On DB errors, return null so the API route responds with a controlled error
    return null;
  }
}

export async function createSessionToken(payload: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + SESSION_MAX_AGE_SECONDS;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(JWT_SECRET_KEY);
}

export async function verifySessionToken(
  token: string
): Promise<null | (any & { exp?: number; iat?: number })> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as any;
  } catch {
    return null;
  }
}

export async function refreshSessionTokenIfNeeded(
  token: string
): Promise<{ refreshed: boolean; token: string; payload: any } | null> {
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp || 0;
  if (exp - now <= SESSION_REFRESH_THRESHOLD_SECONDS) {
    // Reemite com mesmo payload base
    const { id, usuario, nome, tipo } = payload as any;
    const newToken = await createSessionToken({ id, usuario, nome, tipo });
    return { refreshed: true, token: newToken, payload: { id, usuario, nome, tipo } };
  }
  return { refreshed: false, token, payload };
}

export function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // sempre httpOnly; front guarda infos mínimas em localStorage se quiser
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function issueSessionCookie(res: any, token: string) {
  const opts = cookieOptions();
  res.cookies.set(COOKIE_NAME, token, opts);
}
