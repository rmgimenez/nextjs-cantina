import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  hasAnyRole,
  normalizeTipo,
  refreshSessionTokenIfNeeded,
  ROLE_ADMIN,
  ROLE_ATENDENTE,
  ROLE_ESTOQUISTA,
} from './lib/auth';

// Middleware agora só delega a lógica de validar / refresh para lib/auth

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const publicPaths = ['/login', '/api/login', '/api/session', '/api/auth-check'];
  const isPublicPath = publicPaths.includes(pathname);
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Log enxuto para depuração
  console.log('[MW]', pathname, token ? 'token:yes' : 'token:no');

  // Página de login: se já autenticado redireciona
  if (pathname === '/login') {
    if (token) {
      const result = await refreshSessionTokenIfNeeded(token);
      if (result) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      const resp = NextResponse.next();
      resp.cookies.delete(COOKIE_NAME);
      return resp;
    }
    return NextResponse.next();
  }

  // Rotas públicas (APIs auxiliares) liberadas
  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const result = await refreshSessionTokenIfNeeded(token);
  if (!result) {
    const resp = NextResponse.redirect(new URL('/login', request.url));
    resp.cookies.delete(COOKIE_NAME);
    return resp;
  }
  const { payload, token: newToken, refreshed } = result;
  const resp = NextResponse.next();
  // Normaliza e expõe tipo do usuário para o restante do app
  const normalizedTipo = normalizeTipo((payload as any).tipo);
  resp.headers.set('x-user-id', (payload as any).id?.toString() || '');
  resp.headers.set('x-user-tipo', normalizedTipo || '');
  if (refreshed) {
    // Regrava cookie atualizado
    resp.cookies.set(COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
  }

  // --- RF-002: Proteção por perfis (exemplo simples) ---
  // Mapa de prefixos de rota para roles permitidos. Ajustar conforme necessidade.
  const roleProtectedMap: Array<{ prefix: string; roles: string[] }> = [
    { prefix: '/dashboard', roles: [ROLE_ADMIN, ROLE_ATENDENTE, ROLE_ESTOQUISTA] },
    { prefix: '/dashboard/pdv', roles: [ROLE_ATENDENTE, ROLE_ADMIN] },
    { prefix: '/dashboard/produtos', roles: [ROLE_ADMIN, ROLE_ESTOQUISTA] },
    { prefix: '/api/dashboard/alerts', roles: [ROLE_ADMIN, ROLE_ESTOQUISTA] },
  ];

  for (const rule of roleProtectedMap) {
    if (pathname.startsWith(rule.prefix)) {
      const allowed = hasAnyRole(payload, rule.roles);
      if (!allowed) {
        // Negar acesso: redireciona para dashboard principal se autenticado, ou login caso contrário
        console.log('[MW] Acesso negado para', pathname, 'role:', normalizedTipo);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      break;
    }
  }
  return resp;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
