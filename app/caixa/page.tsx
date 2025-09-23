'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}

export default function CaixaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    aberto: boolean;
    caixa?: { id: number; dt_abertura: string; valor_inicial: number };
    totais?: { suprimentos: number; sangrias: number; vendas_dinheiro: number; esperado: number };
  } | null>(null);
  const [valorInicial, setValorInicial] = useState<string>('0');
  const [valorReal, setValorReal] = useState<string>('0');
  const [tipoMov, setTipoMov] = useState<'SANGRIA' | 'SUPRIMENTO'>('SUPRIMENTO');
  const [valorMov, setValorMov] = useState<string>('0');
  const [descricaoMov, setDescricaoMov] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/me');
      const d = await res.json();
      if (!d.authenticated) {
        router.push('/login');
        return;
      }
      setUser(d.user);
      await carregarStatus();
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  async function carregarStatus() {
    const res = await fetch('/api/caixa/status');
    const d = await res.json();
    setStatus(d.data || { aberto: false });
  }

  async function abrirCaixa() {
    setMsg('');
    const res = await fetch('/api/caixa/abrir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor_inicial: Number(valorInicial || 0) }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg('Caixa aberto');
      await carregarStatus();
    } else setMsg(d?.error || 'Erro ao abrir caixa');
  }

  async function fecharCaixa() {
    setMsg('');
    const res = await fetch('/api/caixa/fechar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor_final_real: Number(valorReal || 0) }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg('Caixa fechado');
      await carregarStatus();
    } else setMsg(d?.error || 'Erro ao fechar caixa');
  }

  async function movimentar() {
    setMsg('');
    const res = await fetch('/api/caixa/movimentacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: tipoMov,
        valor: Number(valorMov || 0),
        descricao: descricaoMov,
      }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg('Movimentação registrada');
      await carregarStatus();
    } else setMsg(d?.error || 'Erro na movimentação');
  }

  if (loading) return <div className='container py-4'>Carregando...</div>;
  if (!user) return null;

  const aberto = Boolean(status?.aberto);
  return (
    <MainLayout>
      <div>
        {msg && <div className='alert alert-info mb-3'>{msg}</div>}

        {!aberto ? (
          <div className='card mb-3'>
            <div className='card-body'>
              <h5>Abrir caixa</h5>
              <div className='input-group' style={{ maxWidth: 300 }}>
                <span className='input-group-text'>Valor inicial</span>
                <input
                  className='form-control'
                  value={valorInicial}
                  onChange={(e) => setValorInicial(e.target.value)}
                />
                <button className='btn btn-success' onClick={abrirCaixa}>
                  Abrir
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className='card mb-3'>
              <div className='card-body'>
                <h5>Status</h5>
                <div>Aberto em: {status?.caixa?.dt_abertura}</div>
                <div>Valor inicial: R$ {Number(status?.caixa?.valor_inicial || 0).toFixed(2)}</div>
                <div>Suprimentos: R$ {Number(status?.totais?.suprimentos || 0).toFixed(2)}</div>
                <div>Sangrias: R$ {Number(status?.totais?.sangrias || 0).toFixed(2)}</div>
                <div>
                  Vendas (dinheiro): R$ {Number(status?.totais?.vendas_dinheiro || 0).toFixed(2)}
                </div>
                <div>
                  <strong>
                    Esperado em caixa: R$ {Number(status?.totais?.esperado || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            <div className='card mb-3'>
              <div className='card-body'>
                <h5>Movimentação</h5>
                <div className='row g-2'>
                  <div className='col-md-3'>
                    <select
                      className='form-select'
                      value={tipoMov}
                      onChange={(e) => setTipoMov(e.target.value as any)}
                    >
                      <option value='SUPRIMENTO'>Suprimento</option>
                      <option value='SANGRIA'>Sangria</option>
                    </select>
                  </div>
                  <div className='col-md-3'>
                    <input
                      className='form-control'
                      placeholder='Valor'
                      value={valorMov}
                      onChange={(e) => setValorMov(e.target.value)}
                    />
                  </div>
                  <div className='col-md-4'>
                    <input
                      className='form-control'
                      placeholder='Descrição'
                      value={descricaoMov}
                      onChange={(e) => setDescricaoMov(e.target.value)}
                    />
                  </div>
                  <div className='col-md-2'>
                    <button className='btn btn-primary w-100' onClick={movimentar}>
                      Lançar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className='card'>
              <div className='card-body'>
                <h5>Fechar caixa</h5>
                <div className='input-group' style={{ maxWidth: 360 }}>
                  <span className='input-group-text'>Valor contado</span>
                  <input
                    className='form-control'
                    value={valorReal}
                    onChange={(e) => setValorReal(e.target.value)}
                  />
                  <button className='btn btn-danger' onClick={fecharCaixa}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
