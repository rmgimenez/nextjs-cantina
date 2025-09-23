'use client';

import { useEffect, useState } from 'react';
import MainLayout from '../../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}
interface AlunoConta {
  ra: number;
  nome: string;
  turma?: string | null;
  serie?: string | number | null;
  curso_nome?: string | null;
  conta_id: number;
  saldo_atual: number;
  limite_credito: number;
  ativo: number;
}
type TipoMov = 'CREDITO' | 'DEBITO' | 'ESTORNO';
interface MovimentacaoAluno {
  id: number;
  tipo_movimentacao: TipoMov;
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  descricao: string;
  id_venda: number | null;
  dt_movimentacao: string; // ISO date
}

export default function ContasAlunosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ra, setRa] = useState('');
  const [aluno, setAluno] = useState<AlunoConta | null>(null);
  const [movs, setMovs] = useState<MovimentacaoAluno[]>([]);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('Recarga manual');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!data.authenticated) {
          window.location.href = '/login';
          return;
        }
        setUser(data.user);
      } catch {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function buscar() {
    if (!ra.trim()) return;
    try {
      const res = await fetch(`/api/alunos/contas/${ra.trim()}`);
      const data = await res.json();
      if (data.success) {
        setAluno(data.data as AlunoConta);
        const resMov = await fetch(`/api/alunos/contas/${ra.trim()}/movimentacoes?limit=50`);
        const dataMov = await resMov.json();
        if (dataMov.success) setMovs(dataMov.data as MovimentacaoAluno[]);
      } else {
        alert(data.error || 'Aluno não encontrado');
        setAluno(null);
        setMovs([]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function recarregar() {
    const v = Number(valor);
    if (isNaN(v) || v <= 0) {
      alert('Informe um valor válido');
      return;
    }
    if (!aluno) {
      alert('Busque um aluno primeiro');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/alunos/contas/${aluno.ra}/recarga`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: v, descricao }),
      });
      const data = await res.json();
      if (data.success) {
        await buscar();
        setValor('');
      } else alert(data.error || 'Erro na recarga');
    } catch (e) {
      console.error(e);
      alert('Erro na recarga');
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <div className='d-flex justify-content-center align-items-center vh-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  if (!user) return null;

  return (
    <MainLayout>
      <div className='container-fluid'>
        <div className='card border-0 shadow-sm mb-4'>
          <div className='card-body'>
            <div className='row g-3 align-items-end'>
              <div className='col-md-3'>
                <label className='form-label'>RA do aluno</label>
                <input
                  className='form-control'
                  value={ra}
                  onChange={(e) => setRa(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') buscar();
                  }}
                />
              </div>
              <div className='col-md-2'>
                <button className='btn btn-primary w-100' onClick={buscar}>
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        {aluno && (
          <div className='row g-3'>
            <div className='col-lg-4'>
              <div className='card border-0 shadow-sm h-100'>
                <div className='card-body'>
                  <div className='d-flex gap-3 align-items-center'>
                    <img
                      src={`https://sistema.santanna.g12.br/carometr/${aluno.ra}.jpg`}
                      alt='Foto do aluno'
                      width={72}
                      height={72}
                      style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />
                    <div>
                      <h5 className='mb-1'>{aluno.nome}</h5>
                      <div className='text-muted small'>
                        RA {aluno.ra} • {aluno.serie ?? '-'} {aluno.turma ?? ''}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className='d-flex justify-content-between mb-1'>
                    <span>Saldo atual</span>
                    <strong>R$ {Number(aluno.saldo_atual ?? 0).toFixed(2)}</strong>
                  </div>
                  <div className='d-flex justify-content-between text-muted'>
                    <span>Limite de crédito</span>
                    <span>R$ {Number(aluno.limite_credito ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='card border-0 shadow-sm h-100'>
                <div className='card-body'>
                  <h5 className='mb-3'>Fazer recarga</h5>
                  <div className='mb-3'>
                    <label className='form-label'>Valor</label>
                    <input
                      type='number'
                      step='0.01'
                      className='form-control'
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Descrição</label>
                    <input
                      className='form-control'
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                  </div>
                  <button className='btn btn-success' disabled={busy} onClick={recarregar}>
                    {busy ? 'Processando...' : 'Confirmar recarga'}
                  </button>
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='card border-0 shadow-sm h-100'>
                <div className='card-body'>
                  <h5 className='mb-3'>Últimas movimentações</h5>
                  <div className='table-responsive' style={{ maxHeight: 360 }}>
                    <table className='table table-sm'>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movs.map((m) => (
                          <tr key={m.id}>
                            <td>{new Date(m.dt_movimentacao).toLocaleString('pt-BR')}</td>
                            <td>{m.tipo_movimentacao}</td>
                            <td>R$ {Number(m.valor).toFixed(2)}</td>
                            <td>R$ {Number(m.saldo_posterior).toFixed(2)}</td>
                          </tr>
                        ))}
                        {movs.length === 0 && (
                          <tr>
                            <td colSpan={4} className='text-muted'>
                              Nenhuma movimentação
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
