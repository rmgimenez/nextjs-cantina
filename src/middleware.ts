import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'cantina-secret-key';
const COOKIE_NAME = 'cantina_session';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rotas que não precisam de autenticação
  const publicPaths = ['/login', '/api/login', '/api/session', '/api/auth-check'];
  const isPublicPath = publicPaths.includes(pathname);

  // Pega o token do cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Se está tentando acessar a página de login
  if (pathname === '/login') {
    if (token) {
      try {
        // Verifica se o token é válido
        jwt.verify(token, JWT_SECRET);
        // Se válido, redireciona para dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        // Token inválido, remove cookie e continua para login
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
    }
    // Não tem token ou token inválido, pode acessar login
    return NextResponse.next();
  }

  // Se é rota pública (exceto login), permite acesso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Para todas as outras rotas (incluindo dashboard e APIs protegidas)
  if (!token) {
    // Em desenvolvimento, permite acesso ao dashboard sem token por enquanto
    // para facilitar teste e desenvolvimento
    if (process.env.NODE_ENV !== 'production' && pathname.startsWith('/dashboard')) {
      return NextResponse.next();
    }
    // Não tem token, redireciona para login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verifica se o token é válido
    const decoded = jwt.verify(token, JWT_SECRET);

    // Adiciona informações do usuário ao headers para uso nas rotas
    const response = NextResponse.next();
    response.headers.set('x-user-id', (decoded as any).id?.toString() || '');
    response.headers.set('x-user-tipo', (decoded as any).tipo || '');

    return response;
  } catch (error) {
    // Token inválido, remove cookie e redireciona para login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
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
