'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiUser } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        if (!cancelled && res.ok) {
          window.location.href = '/dashboard';
        }
      } catch (e) {
        // silent
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro desconhecido');
        return;
      }

      console.log('Login successful, data:', data);

      // Salva as informações do usuário e token para desenvolvimento
      if (data.usuario) {
        localStorage.setItem('cantina_user', JSON.stringify(data.usuario));
      }
      if (data.token) {
        localStorage.setItem('cantina_token', data.token);
      }

      // Aguarda um pouco para garantir que os dados sejam salvos
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verifica se o cookie foi definido (em desenvolvimento está acessível via JS)
      const cookies = document.cookie;
      console.log('Cookies after login:', cookies);

      // Redireciona para dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (checkingSession) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center text-gray-500 text-sm'>Verificando sessão...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Background decorativo (reduzido para menos distração) */}
      <div className='absolute inset-0 opacity-6 pointer-events-none'>
        <div
          className='absolute top-0 left-0 w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23253287' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Elementos decorativos com cores do sistema (subtis) */}
      <div className='absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 blur-3xl opacity-20'></div>
      <div
        className='absolute top-1/2 -right-36 w-96 h-96 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 blur-3xl opacity-12'
        style={{ animationDelay: '0.7s' }}
      ></div>

      <div className='w-full max-w-md relative z-10'>
        {/* Logo e Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-lg mb-6 transform transition-transform hover:scale-105'>
            <span className='text-white font-bold text-3xl' aria-hidden='true'>
              C
            </span>
            <span className='sr-only'>Sistema Cantina</span>
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Sistema Cantina</h1>
          <p className='text-gray-600 text-lg'>ERP Cantina Escolar</p>
        </div>

        {/* Card de Login */}
        <Card shadow='large' className='backdrop-blur-sm bg-white/95 border-0 shadow-2xl'>
          <CardContent className='p-8'>
            <form onSubmit={handleSubmit} className='space-y-6' noValidate>
              <div className='text-center mb-6'>
                <h2 className='text-2xl font-semibold text-gray-900'>Faça seu login</h2>
                <p className='text-gray-600 text-sm mt-2'>
                  Entre com suas credenciais para acessar o sistema
                </p>
              </div>

              {/* Campo Usuário */}
              <Input
                label='Usuário'
                type='text'
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder='Digite seu usuário'
                icon={<FiUser className='w-5 h-5' />}
                iconPosition='left'
                required
                autoComplete='username'
                autoFocus
                aria-describedby={error ? 'login-error' : undefined}
              />

              {/* Campo Senha */}
              <div className='relative'>
                <Input
                  label='Senha'
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder='Digite sua senha'
                  icon={<FiLock className='w-5 h-5' />}
                  iconPosition='left'
                  required
                  autoComplete='current-password'
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1'
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <FiEyeOff className='w-5 h-5' /> : <FiEye className='w-5 h-5' />}
                </button>
              </div>

              {/* Lembrar-me e ajuda */}
              <div className='flex items-center justify-between mt-1'>
                <label className='inline-flex items-center text-sm text-gray-700'>
                  <input
                    type='checkbox'
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className='h-4 w-4 rounded border-gray-300 text-[#253287] focus:ring-[#253287]'
                  />
                  <span className='ml-2'>Lembrar-me</span>
                </label>
                <button
                  type='button'
                  className='text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline'
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {/* Erro */}
              {error && (
                <div id='login-error' role='alert' aria-live='assertive'>
                  <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                    <p className='text-red-700 text-sm text-center font-medium'>
                      {error === 'credenciais_invalidas'
                        ? 'Usuário ou senha incorretos'
                        : error === 'usuario_e_senha_obrigatorios'
                        ? 'Usuário e senha são obrigatórios'
                        : error === 'server_error'
                        ? 'Erro no servidor. Tente novamente.'
                        : error}
                    </p>
                  </div>
                </div>
              )}

              {/* Botão de Login */}
              <Button
                type='submit'
                variant='primary'
                size='large'
                loading={loading}
                icon={<FiLogIn className='w-5 h-5' />}
                iconPosition='left'
                className='w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 bg-[#253287] hover:bg-[#1f276e]'
                disabled={!usuario || !senha || loading}
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>

              {/* Links auxiliares */}
              <div className='text-center pt-4'>
                <button
                  type='button'
                  className='text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline'
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center mt-8 text-gray-500 text-sm'>
          <p>© 2025 Sistema Cantina Escolar</p>
          <p className='mt-1'>Desenvolvido com Next.js e TypeScript</p>
        </div>
      </div>

      {/* Elementos decorativos menores */}
      <div className='absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse'></div>
      <div
        className='absolute bottom-10 right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-pulse'
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className='absolute top-1/2 right-20 w-16 h-16 bg-red-200 rounded-full opacity-20 animate-pulse'
        style={{ animationDelay: '0.5s' }}
      ></div>
    </div>
  );
}
