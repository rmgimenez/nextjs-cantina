'use client';

import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface TipoProduto {
  id: number;
  nome: string;
}
interface Produto {
  id: number;
  nome: string;
  id_tipo: number;
  tipo_nome?: string;
  preco_venda: number;
  codigo_barras?: string | null;
  por_quilo: 0 | 1;
  ativo: 0 | 1;
}

export default function ProdutosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipos, setTipos] = useState<TipoProduto[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);

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
      } catch (err) {
        console.error(err);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadTipos();
      loadProdutos();
    }
  }, [user, searchTerm, tipoFilter, statusFilter]);

  async function loadTipos() {
    try {
      const res = await fetch('/api/tipos-produtos?ativo=1');
      const data = await res.json();
      if (data.success) setTipos(data.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadProdutos() {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (tipoFilter) params.append('id_tipo', tipoFilter);
      if (statusFilter) params.append('ativo', statusFilter);
      const res = await fetch(`/api/produtos?${params}`);
      const data = await res.json();
      if (data.success) setProdutos(data.data);
    } catch (e) {
      console.error(e);
    }
  }

  const tipoById = useMemo(() => Object.fromEntries(tipos.map((t) => [t.id, t.nome])), [tipos]);

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center vh-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <MainLayout>
      <div className='container-fluid'>
        <div className='card border-0 shadow-sm mb-4'>
          <div className='card-body'>
            <div className='row g-3'>
              <div className='col-md-4'>
                <input
                  className='form-control'
                  placeholder='Buscar por nome ou código de barras'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className='col-md-3'>
                <select
                  className='form-select'
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                >
                  <option value=''>Todos os tipos</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-md-3'>
                <select
                  className='form-select'
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value=''>Todos os status</option>
                  <option value='1'>Ativo</option>
                  <option value='0'>Inativo</option>
                </select>
              </div>
              <div className='col-md-2'>
                <button className='btn btn-primary w-100' onClick={() => setShowModal(true)}>
                  Novo Produto
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='card border-0 shadow-sm'>
          <div className='card-body'>
            <div className='table-responsive'>
              <table className='table table-hover'>
                <thead className='table-light'>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Preço</th>
                    <th>Código Barras</th>
                    <th>Por quilo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='text-center py-4'>
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  ) : (
                    produtos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nome}</td>
                        <td>{p.tipo_nome || tipoById[p.id_tipo] || '-'}</td>
                        <td>R$ {Number(p.preco_venda).toFixed(2)}</td>
                        <td>{p.codigo_barras || '-'}</td>
                        <td>
                          <span className={`badge ${p.por_quilo ? 'bg-info' : 'bg-secondary'}`}>
                            {p.por_quilo ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${p.ativo ? 'bg-success' : 'bg-secondary'}`}>
                            {p.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div className='btn-group btn-group-sm'>
                            <button
                              className='btn btn-outline-primary'
                              onClick={() => {
                                setEditing(p);
                                setShowModal(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className='btn btn-outline-warning'
                              onClick={async () => {
                                const res = await fetch(`/api/produtos/${p.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...p, ativo: p.ativo ? 0 : 1 }),
                                });
                                const d = await res.json();
                                if (d.success) loadProdutos();
                                else alert(d.error || 'Erro');
                              }}
                            >
                              {p.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ProdutoModal
          tipos={tipos}
          produto={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditing(null);
            loadProdutos();
          }}
        />
      )}
    </MainLayout>
  );
}

function ProdutoModal({
  tipos,
  produto,
  onClose,
  onSaved,
}: {
  tipos: TipoProduto[];
  produto: Produto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nome: produto?.nome || '',
    id_tipo: String(produto?.id_tipo || ''),
    preco_venda: produto ? String(produto.preco_venda) : '',
    codigo_barras: produto?.codigo_barras || '',
    por_quilo: produto?.por_quilo ? true : false,
    ativo: produto?.ativo ? true : true,
    quantidade_inicial: produto ? '' : '0',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!form.id_tipo) e.id_tipo = 'Tipo é obrigatório';
    if (form.preco_venda === '' || isNaN(Number(form.preco_venda)))
      e.preco_venda = 'Preço inválido';
    if (!produto) {
      const qtd = Number(form.quantidade_inicial);
      if (form.quantidade_inicial === '') e.quantidade_inicial = 'Informe a quantidade inicial';
      else if (isNaN(qtd) || qtd < 0) e.quantidade_inicial = 'Quantidade inválida';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: {
        nome: string;
        id_tipo: number;
        preco_venda: number;
        codigo_barras: string | null;
        por_quilo: boolean;
        ativo: boolean;
        quantidade_inicial?: number;
      } = {
        nome: form.nome.trim(),
        id_tipo: Number(form.id_tipo),
        preco_venda: Number(form.preco_venda),
        codigo_barras: form.codigo_barras?.trim() || null,
        por_quilo: form.por_quilo,
        ativo: form.ativo,
      };
      if (!produto) {
        payload.quantidade_inicial = Number(form.quantidade_inicial || 0);
      }
      const res = await fetch(produto ? `/api/produtos/${produto.id}` : '/api/produtos', {
        method: produto ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) onSaved();
      else alert(data.error || 'Erro');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='modal d-block' tabIndex={-1}>
      <div className='modal-dialog modal-lg'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>{produto ? 'Editar Produto' : 'Novo Produto'}</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            <div className='row g-3'>
              <div className='col-md-6'>
                <label className='form-label'>Nome</label>
                <input
                  className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
                {errors.nome && <div className='invalid-feedback'>{errors.nome}</div>}
              </div>
              <div className='col-md-3'>
                <label className='form-label'>Tipo</label>
                <select
                  className={`form-select ${errors.id_tipo ? 'is-invalid' : ''}`}
                  value={form.id_tipo}
                  onChange={(e) => setForm((f) => ({ ...f, id_tipo: e.target.value }))}
                >
                  <option value=''>Selecione</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
                {errors.id_tipo && <div className='invalid-feedback'>{errors.id_tipo}</div>}
              </div>
              <div className='col-md-3'>
                <label className='form-label'>Preço de venda</label>
                <input
                  type='number'
                  step='0.01'
                  className={`form-control ${errors.preco_venda ? 'is-invalid' : ''}`}
                  value={form.preco_venda}
                  onChange={(e) => setForm((f) => ({ ...f, preco_venda: e.target.value }))}
                />
                {errors.preco_venda && <div className='invalid-feedback'>{errors.preco_venda}</div>}
              </div>
              {!produto && (
                <div className='col-md-3'>
                  <label className='form-label'>Quantidade inicial em estoque</label>
                  <input
                    type='number'
                    step='0.001'
                    min='0'
                    className={`form-control ${errors.quantidade_inicial ? 'is-invalid' : ''}`}
                    value={form.quantidade_inicial}
                    onChange={(e) => setForm((f) => ({ ...f, quantidade_inicial: e.target.value }))}
                  />
                  {errors.quantidade_inicial && (
                    <div className='invalid-feedback'>{errors.quantidade_inicial}</div>
                  )}
                </div>
              )}
              <div className='col-md-4'>
                <label className='form-label'>Código de barras</label>
                <input
                  className='form-control'
                  value={form.codigo_barras || ''}
                  onChange={(e) => setForm((f) => ({ ...f, codigo_barras: e.target.value }))}
                />
              </div>
              <div className='col-md-4 d-flex align-items-end gap-3'>
                <div className='form-check'>
                  <input
                    id='por_quilo'
                    className='form-check-input'
                    type='checkbox'
                    checked={form.por_quilo}
                    onChange={(e) => setForm((f) => ({ ...f, por_quilo: e.target.checked }))}
                  />
                  <label className='form-check-label' htmlFor='por_quilo'>
                    Produto por quilo
                  </label>
                </div>
                <div className='form-check'>
                  <input
                    id='ativo'
                    className='form-check-input'
                    type='checkbox'
                    checked={form.ativo}
                    onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                  />
                  <label className='form-check-label' htmlFor='ativo'>
                    Ativo
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className='modal-footer'>
            <button className='btn btn-secondary' onClick={onClose}>
              Cancelar
            </button>
            <button className='btn btn-primary' disabled={saving} onClick={submit}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
