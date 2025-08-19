'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiUser } from 'react-icons/fi';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      // Redirect to dashboard
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

      <div className='w-full max-w-md relative z-10'>
        {/* Logo e Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4'>
            <span className='text-white font-bold text-2xl'>C</span>
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Sistema Cantina</h1>
          <p className='text-gray-600'>ERP Cantina Escolar</p>
        </div>

        {/* Card de Login */}
        <Card shadow='large' className='backdrop-blur-sm bg-white/80 border-0'>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='text-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-900'>Faça seu login</h2>
                <p className='text-gray-600 text-sm mt-1'>
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
                icon={<FiUser className='w-4 h-4' />}
                iconPosition='left'
                required
                autoComplete='username'
              />

              {/* Campo Senha */}
              <div className='relative'>
                <Input
                  label='Senha'
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder='Digite sua senha'
                  icon={<FiLock className='w-4 h-4' />}
                  iconPosition='left'
                  required
                  autoComplete='current-password'
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors'
                >
                  {showPassword ? <FiEyeOff className='w-4 h-4' /> : <FiEye className='w-4 h-4' />}
                </button>
              </div>

              {/* Erro */}
              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                  <p className='text-red-600 text-sm text-center'>{error}</p>
                </div>
              )}

              {/* Botão de Login */}
              <Button
                type='submit'
                variant='primary'
                size='large'
                loading={loading}
                icon={<FiLogIn className='w-4 h-4' />}
                iconPosition='left'
                className='w-full'
                disabled={!usuario || !senha}
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>

              {/* Links auxiliares */}
              <div className='text-center'>
                <button
                  type='button'
                  className='text-sm text-blue-600 hover:text-blue-700 transition-colors'
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

      {/* Elementos decorativos */}
      <div className='absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse'></div>
      <div className='absolute bottom-10 right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-pulse delay-1000'></div>
      <div className='absolute top-1/2 right-20 w-16 h-16 bg-red-200 rounded-full opacity-20 animate-pulse delay-500'></div>
    </div>
  );
}
