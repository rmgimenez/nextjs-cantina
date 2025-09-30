import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_cantina_change';
const COOKIE_NAME = 'cantina_token';
const EXPIRES_IN = '8h'; // tempo de sessão por inatividade será controlado pelo cookie

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): { id: number; nome: string; perfil: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: number;
      nome: string;
      perfil: number;
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
