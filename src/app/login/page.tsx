'use client';
import React, { useState } from 'react';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || 'erro_desconhecido');
        return;
      }
      // redirect to home
      window.location.href = '/';
    } catch (err) {
      setError('erro_de_conexao');
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <form className='w-[360px] p-6 border rounded' onSubmit={handleSubmit}>
        <h1 className='text-lg font-bold mb-4'>Login - Cantina</h1>
        <label className='block mb-2'>
          Usuário
          <input
            className='w-full border px-2 py-1 mt-1'
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </label>
        <label className='block mb-4'>
          Senha
          <input
            type='password'
            className='w-full border px-2 py-1 mt-1'
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>
        {error && <div className='text-red-600 mb-2'>{error}</div>}
        <button className='w-full bg-blue-600 text-white py-2 rounded' type='submit'>
          Entrar
        </button>
      </form>
    </div>
  );
}
