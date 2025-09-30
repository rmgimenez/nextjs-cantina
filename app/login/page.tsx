'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!usuario || !senha) {
      setError('Informe usuário e senha.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro');
        return;
      }
      // redireciona para home
      router.push('/');
    } catch {
      setError('Erro de rede');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='login-bg min-vh-100 d-flex align-items-center justify-content-center py-5'>
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4'>
            <div className='card shadow-lg border-0 login-card'>
              <div className='card-body p-4 p-md-5'>
                <div className='text-center mb-4'>
                  <div className='brand-mark mb-2'>🍽️</div>
                  <h3 className='mb-1 fw-bold text-primary'>Cantina Escolar</h3>
                  <p className='text-muted small mb-0'>Acesse o painel para continuar</p>
                </div>
                {error && (
                  <div className='alert alert-danger py-2' role='alert'>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} noValidate>
                  <div className='mb-3'>
                    <label htmlFor='usuario' className='form-label fw-semibold'>
                      Usuário
                    </label>
                    <input
                      id='usuario'
                      name='usuario'
                      className='form-control form-control-lg'
                      placeholder='seu.usuario'
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      autoComplete='username'
                      required
                    />
                  </div>
                  <div className='mb-2'>
                    <label htmlFor='senha' className='form-label fw-semibold'>
                      Senha
                    </label>
                    <div className='input-group input-group-lg'>
                      <input
                        id='senha'
                        name='senha'
                        type={showPassword ? 'text' : 'password'}
                        className='form-control'
                        placeholder='••••••••'
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        autoComplete='current-password'
                        required
                        aria-describedby='toggleSenha'
                      />
                      <button
                        className='btn btn-outline-primary'
                        type='button'
                        id='toggleSenha'
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </div>
                  <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='form-check'>
                      <input className='form-check-input' type='checkbox' id='lembrar' />
                      <label className='form-check-label' htmlFor='lembrar'>
                        Lembrar-me
                      </label>
                    </div>
                    <a className='small text-decoration-none' href='#' aria-disabled>
                      Esqueci minha senha
                    </a>
                  </div>
                  <button className='btn btn-primary btn-lg w-100' type='submit' disabled={loading}>
                    {loading ? (
                      <span className='d-inline-flex align-items-center gap-2'>
                        <span
                          className='spinner-border spinner-border-sm'
                          role='status'
                          aria-hidden='true'
                        ></span>
                        Entrando...
                      </span>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </form>
              </div>
            </div>
            <p className='text-center text-muted mt-3 small'>
              © {new Date().getFullYear()} Cantina Escolar. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
