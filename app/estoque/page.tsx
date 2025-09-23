'use client';

import { useCallback, useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}
interface ItemEstoque {
  id: number;
  id_produto: number;
  produto_nome: string;
  id_tipo: number;
  tipo_nome: string;
  quantidade_atual: number;
  quantidade_minima: number;
}
interface AlertaEstoque {
  id: number;
  produto_nome: string;
  tipo_produto: string;
  quantidade_atual: number;
  quantidade_minima: number;
  status_estoque: 'CRITICO' | 'BAIXO' | 'OK';
}

export default function EstoquePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    id_produto: '',
    tipo_movimentacao: 'ENTRADA',
    quantidade: '',
    motivo: '',
    documento: '',
  });
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

  const loadEstoque = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const res = await fetch(`/api/estoque?${params}`);
    const data = await res.json();
    if (data.success) setItens(data.data as ItemEstoque[]);
  }, [search]);

  const loadAlertas = useCallback(async () => {
    const res = await fetch(`/api/estoque/alertas`);
    const data = await res.json();
    if (data.success) setAlertas(data.data as AlertaEstoque[]);
  }, []);

  useEffect(() => {
    if (user) {
      loadEstoque();
      loadAlertas();
    }
  }, [user, loadEstoque, loadAlertas]);

  async function movimentar() {
    const qtd = Number(form.quantidade);
    if (!form.id_produto) {
      alert('Selecione um produto');
      return;
    }
    if (isNaN(qtd) || qtd <= 0) {
      alert('Informe uma quantidade válida');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/estoque/movimentacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id_produto: Number(form.id_produto), quantidade: qtd }),
      });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, quantidade: '', motivo: '', documento: '' }));
        await Promise.all([loadEstoque(), loadAlertas()]);
      } else alert(data.error || 'Erro na movimentação');
    } catch (e) {
      console.error(e);
      alert('Erro na movimentação');
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
        <div className='row g-3'>
          <div className='col-lg-8'>
            <div className='card border-0 shadow-sm mb-3'>
              <div className='card-body'>
                <div className='d-flex gap-3'>
                  <input
                    className='form-control'
                    placeholder='Buscar por produto ou tipo'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className='card border-0 shadow-sm'>
              <div className='card-body'>
                <div className='table-responsive'>
                  <table className='table table-hover'>
                    <thead className='table-light'>
                      <tr>
                        <th>Produto</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Mínima</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((e) => (
                        <tr key={e.id}>
                          <td>{e.produto_nome}</td>
                          <td>{e.tipo_nome}</td>
                          <td>{Number(e.quantidade_atual).toFixed(3)}</td>
                          <td>{Number(e.quantidade_minima).toFixed(3)}</td>
                          <td>
                            {Number(e.quantidade_atual) <= Number(e.quantidade_minima) ? (
                              <span className='badge bg-danger'>Crítico</span>
                            ) : Number(e.quantidade_atual) <= Number(e.quantidade_minima) * 1.5 ? (
                              <span className='badge bg-warning text-dark'>Baixo</span>
                            ) : (
                              <span className='badge bg-success'>OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {itens.length === 0 && (
                        <tr>
                          <td colSpan={5} className='text-muted'>
                            Nenhum item
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4'>
            <div className='card border-0 shadow-sm mb-3'>
              <div className='card-body'>
                <h5 className='mb-3'>Movimentar estoque</h5>
                <div className='mb-2'>
                  <label className='form-label'>Produto</label>
                  <select
                    className='form-select'
                    value={form.id_produto}
                    onChange={(e) => setForm((f) => ({ ...f, id_produto: e.target.value }))}
                  >
                    <option value=''>Selecione</option>
                    {itens.map((e) => (
                      <option key={e.id} value={e.id_produto}>
                        {e.produto_nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='mb-2'>
                  <label className='form-label'>Tipo</label>
                  <select
                    className='form-select'
                    value={form.tipo_movimentacao}
                    onChange={(e) => setForm((f) => ({ ...f, tipo_movimentacao: e.target.value }))}
                  >
                    <option value='ENTRADA'>Entrada</option>
                    <option value='SAIDA'>Saída</option>
                    <option value='AJUSTE'>Ajuste</option>
                  </select>
                </div>
                <div className='mb-2'>
                  <label className='form-label'>Quantidade</label>
                  <input
                    type='number'
                    step='0.001'
                    className='form-control'
                    value={form.quantidade}
                    onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
                  />
                </div>
                <div className='mb-2'>
                  <label className='form-label'>Motivo</label>
                  <input
                    className='form-control'
                    value={form.motivo}
                    onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                  />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Documento</label>
                  <input
                    className='form-control'
                    value={form.documento}
                    onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
                  />
                </div>
                <button className='btn btn-primary' disabled={busy} onClick={movimentar}>
                  {busy ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
            <div className='card border-0 shadow-sm'>
              <div className='card-body'>
                <h5 className='mb-3'>Alertas</h5>
                {alertas.map((a) => (
                  <div
                    className='d-flex justify-content-between border rounded p-2 mb-2'
                    key={a.id}
                  >
                    <div>
                      <div className='fw-medium'>{a.produto_nome}</div>
                      <div className='text-muted small'>{a.tipo_produto}</div>
                    </div>
                    <span
                      className={`badge ${
                        a.status_estoque === 'CRITICO' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}
                    >
                      {a.status_estoque}
                    </span>
                  </div>
                ))}
                {alertas.length === 0 && <div className='text-muted'>Sem alertas</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
