'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi';

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

      if (data.usuario) {
        localStorage.setItem('cantina_user', JSON.stringify(data.usuario));
      }
      if (data.token) {
        localStorage.setItem('cantina_token', data.token);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
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
      <div
        className='d-flex align-items-center justify-content-center'
        style={{ minHeight: '100vh' }}
      >
        <div className='text-muted small'>Verificando sessão...</div>
      </div>
    );
  }

  return (
    <div className='bg-light' style={{ minHeight: '100vh' }}>
      <div className='container d-flex align-items-center justify-content-center py-5'>
        <div className='w-100' style={{ maxWidth: '420px' }}>
          <div className='text-center mb-4'>
            <div
              className='d-inline-flex align-items-center justify-content-center rounded-3 mb-3'
              style={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg,#1e3a8a,#253287)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              }}
            >
              <span className='text-white fw-bold fs-2'>C</span>
            </div>

            <h1 className='h4 mb-0'>Sistema Cantina</h1>
            <div className='text-muted small'>ERP Cantina Escolar</div>
          </div>

          <div className='card shadow-sm mb-3'>
            <div className='card-body'>
              <form onSubmit={handleSubmit} noValidate>
                <div className='mb-3 text-center'>
                  <h2 className='h6 mb-1'>Faça seu login</h2>
                  <div className='text-muted small'>
                    Entre com suas credenciais para acessar o sistema
                  </div>
                </div>

                <div className='mb-3'>
                  <label className='form-label'>Usuário</label>
                  <div className='input-group'>
                    <span className='input-group-text'>
                      <FiUser />
                    </span>
                    <input
                      type='text'
                      className='form-control'
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      placeholder='Digite seu usuário'
                      autoComplete='username'
                      autoFocus
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                  </div>
                </div>

                <div className='mb-3'>
                  <label className='form-label'>Senha</label>
                  <div className='input-group'>
                    <span className='input-group-text'>
                      <FiLock />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className='form-control'
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder='Digite sua senha'
                      autoComplete='current-password'
                    />
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className='d-flex align-items-center justify-content-between mb-3'>
                  <div className='form-check'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      id='rememberMe'
                    />
                    <label className='form-check-label' htmlFor='rememberMe'>
                      Lembrar-me
                    </label>
                  </div>

                  <ButtonLink />
                </div>

                {error && (
                  <div
                    className='alert alert-danger'
                    id='login-error'
                    role='alert'
                    aria-live='assertive'
                  >
                    {error === 'credenciais_invalidas'
                      ? 'Usuário ou senha incorretos'
                      : error === 'usuario_e_senha_obrigatorios'
                      ? 'Usuário e senha são obrigatórios'
                      : error === 'server_error'
                      ? 'Erro no servidor. Tente novamente.'
                      : error}
                  </div>
                )}

                <button
                  type='submit'
                  className={clsx(
                    'btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center',
                    {
                      disabled: !usuario || !senha || loading,
                    }
                  )}
                  disabled={!usuario || !senha || loading}
                >
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </button>

                <div className='text-center pt-3'>
                  <button type='button' className='btn btn-link text-decoration-none small'>
                    Esqueceu sua senha?
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className='text-center text-muted small'>
            <div>© 2025 Sistema Cantina Escolar</div>
            <div className='mt-1'>Desenvolvido com Next.js e TypeScript</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonLink() {
  return (
    <button type='button' className='btn btn-link p-0 small text-decoration-none'>
      Esqueceu sua senha?
    </button>
  );
}
