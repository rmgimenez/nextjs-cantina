'use client';

import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface PrecoCargo {
  id: number;
  cargo: string;
  id_produto: number;
  produto_nome: string;
  preco_padrao: number;
  preco_especial: number;
  ativo: number;
  dt_inicio_vigencia: string | null;
  dt_fim_vigencia: string | null;
  dt_criacao: string;
  dt_alteracao: string;
}

interface ProdutoOption {
  id: number;
  nome: string;
  preco_venda: number;
}

interface HistoricoPreco {
  id: number;
  cargo: string;
  preco_anterior: number;
  preco_novo: number;
  dt_alteracao: string;
  usuario_nome: string | null;
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function formatDate(dateIso: string | null | undefined) {
  if (!dateIso) return '-';
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
}

function normalizeDecimalInput(value: string) {
  if (!value) return '';
  return value.replace(/[^\d,\.]/g, '');
}

function toDecimal(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, '').replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
}

function formatPeriodo(inicio: string | null, fim: string | null) {
  const inicioFmt = formatDate(inicio);
  const fimFmt = formatDate(fim);
  if (inicio && fim) return `${inicioFmt} até ${fimFmt}`;
  if (inicio && !fim) return `Desde ${inicioFmt}`;
  if (!inicio && fim) return `Até ${fimFmt}`;
  return 'Sem vigência definida';
}

export default function PrecosPorCargoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [precos, setPrecos] = useState<PrecoCargo[]>([]);
  const [loadingPrecos, setLoadingPrecos] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [produtos, setProdutos] = useState<ProdutoOption[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  const [cargoFilter, setCargoFilter] = useState('');
  const [produtoFilter, setProdutoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('1');
  const [vigentesOnly, setVigentesOnly] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingPreco, setEditingPreco] = useState<PrecoCargo | null>(null);

  const [showHistorico, setShowHistorico] = useState(false);
  const [historicoPreco, setHistoricoPreco] = useState<PrecoCargo | null>(null);
  const [historico, setHistorico] = useState<HistoricoPreco[]>([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          window.location.href = '/login';
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = '/login';
        return;
      } finally {
        setLoadingUser(false);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadProdutos();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadPrecos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cargoFilter, produtoFilter, statusFilter, vigentesOnly]);

  const loadProdutos = async () => {
    try {
      setLoadingProdutos(true);
      const res = await fetch('/api/produtos?ativo=1');
      const data = await res.json();
      if (res.ok && data.success) {
        const options = (
          data.data as Array<{
            id: number;
            nome: string;
            preco_venda: number;
          }>
        ).map((produto) => ({
          id: Number(produto.id),
          nome: produto.nome as string,
          preco_venda: Number(produto.preco_venda ?? 0),
        }));
        setProdutos(options);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const loadPrecos = async () => {
    try {
      setLoadingPrecos(true);
      setErrorMessage(null);
      const params = new URLSearchParams();
      if (cargoFilter.trim()) params.append('cargo', cargoFilter.trim().toUpperCase());
      if (produtoFilter) params.append('id_produto', produtoFilter);
      if (statusFilter) params.append('ativo', statusFilter);
      if (vigentesOnly) params.append('vigentes', '1');

      const res = await fetch(`/api/funcionarios/precos?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const rows = (
          data.data as Array<{
            id: number;
            cargo: string;
            id_produto: number;
            produto_nome: string;
            preco_padrao: number;
            preco_especial: number;
            ativo: number;
            dt_inicio_vigencia: string | null;
            dt_fim_vigencia: string | null;
            dt_criacao: string;
            dt_alteracao: string;
          }>
        ).map((row) => ({
          id: Number(row.id),
          cargo: row.cargo,
          id_produto: Number(row.id_produto),
          produto_nome: row.produto_nome,
          preco_padrao: Number(row.preco_padrao ?? 0),
          preco_especial: Number(row.preco_especial ?? 0),
          ativo: Number(row.ativo ?? 0),
          dt_inicio_vigencia: row.dt_inicio_vigencia ?? null,
          dt_fim_vigencia: row.dt_fim_vigencia ?? null,
          dt_criacao: row.dt_criacao,
          dt_alteracao: row.dt_alteracao,
        }));
        setPrecos(rows);
      } else {
        setErrorMessage(data.error || 'Não foi possível carregar os preços especiais.');
      }
    } catch (error) {
      console.error('Erro ao carregar preços por cargo:', error);
      setErrorMessage('Erro interno ao carregar preços.');
    } finally {
      setLoadingPrecos(false);
    }
  };

  const resumo = useMemo(() => {
    const ativos = precos.filter((preco) => preco.ativo === 1).length;
    const inativos = precos.filter((preco) => preco.ativo !== 1).length;
    const descontoMedio = precos.length
      ? precos.reduce((acc, preco) => {
          const diff = preco.preco_padrao - preco.preco_especial;
          return acc + (diff > 0 ? diff : 0);
        }, 0) / precos.length
      : 0;
    return { ativos, inativos, descontoMedio };
  }, [precos]);

  const handleToggleAtivo = async (preco: PrecoCargo) => {
    const desejaAtivar = preco.ativo !== 1;
    const confirma = window.confirm(
      `Deseja ${desejaAtivar ? 'reativar' : 'desativar'} o preço especial para o cargo ${
        preco.cargo
      }?`
    );
    if (!confirma) return;

    try {
      if (desejaAtivar) {
        const res = await fetch(`/api/funcionarios/precos/${preco.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ativo: 1 }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.error || 'Não foi possível reativar o preço.');
          return;
        }
      } else {
        const res = await fetch(`/api/funcionarios/precos/${preco.id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.error || 'Não foi possível desativar o preço.');
          return;
        }
      }
      await loadPrecos();
    } catch (error) {
      console.error('Erro ao alterar status do preço por cargo:', error);
      alert('Erro interno do servidor.');
    }
  };

  const handleHistorico = async (preco: PrecoCargo) => {
    try {
      setHistoricoPreco(preco);
      setShowHistorico(true);
      setHistoricoLoading(true);
      const res = await fetch(`/api/funcionarios/precos/${preco.id}/historico`);
      const data = await res.json();
      if (res.ok && data.success) {
        const lista = (
          data.data as Array<{
            id: number;
            cargo: string;
            preco_anterior: number;
            preco_novo: number;
            dt_alteracao: string;
            usuario_nome: string | null;
          }>
        ).map((item) => ({
          id: Number(item.id),
          cargo: item.cargo,
          preco_anterior: Number(item.preco_anterior ?? 0),
          preco_novo: Number(item.preco_novo ?? 0),
          dt_alteracao: item.dt_alteracao,
          usuario_nome: item.usuario_nome ?? null,
        }));
        setHistorico(lista);
      } else {
        setHistorico([]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de preços:', error);
      setHistorico([]);
    } finally {
      setHistoricoLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className='d-flex justify-content-center align-items-center vh-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className='container-fluid'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <div>
            <h1 className='h3 mb-0'>Preços por Cargo</h1>
            <p className='text-muted'>
              Defina valores diferenciados para refeições de acordo com o cargo do funcionário.
            </p>
          </div>
          <button
            className='btn btn-primary'
            onClick={() => {
              setEditingPreco(null);
              setShowModal(true);
            }}
            disabled={loadingProdutos}
          >
            Novo preço especial
          </button>
        </div>

        <div className='card border-0 shadow-sm mb-4'>
          <div className='card-body'>
            <div className='row g-3'>
              <div className='col-md-3'>
                <label className='form-label'>Cargo</label>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Ex.: PROFESSOR'
                  value={cargoFilter}
                  onChange={(e) => setCargoFilter(e.target.value.toUpperCase())}
                />
              </div>
              <div className='col-md-3'>
                <label className='form-label'>Produto</label>
                <select
                  className='form-select'
                  value={produtoFilter}
                  onChange={(e) => setProdutoFilter(e.target.value)}
                  disabled={loadingProdutos}
                >
                  <option value=''>Todos</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-md-2'>
                <label className='form-label'>Status</label>
                <select
                  className='form-select'
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value=''>Todos</option>
                  <option value='1'>Ativo</option>
                  <option value='0'>Inativo</option>
                </select>
              </div>
              <div className='col-md-2 d-flex align-items-end'>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id='vigentesOnly'
                    checked={vigentesOnly}
                    onChange={(e) => setVigentesOnly(e.target.checked)}
                  />
                  <label className='form-check-label' htmlFor='vigentesOnly'>
                    Mostrar apenas vigentes
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='row g-3 mb-4'>
          <div className='col-md-4'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Preços ativos</h6>
                <h4 className='text-success mb-0'>{resumo.ativos}</h4>
              </div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Preços inativos</h6>
                <h4 className='text-secondary mb-0'>{resumo.inativos}</h4>
              </div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Desconto médio</h6>
                <h4 className='text-primary mb-0'>{formatCurrency(resumo.descontoMedio)}</h4>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className='alert alert-danger' role='alert'>
            {errorMessage}
          </div>
        )}

        <div className='card border-0 shadow-sm'>
          <div className='card-body'>
            {loadingPrecos ? (
              <div className='d-flex justify-content-center py-5'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Carregando...</span>
                </div>
              </div>
            ) : (
              <div className='table-responsive table-responsive-custom'>
                <table className='table table-hover align-middle'>
                  <thead className='table-light'>
                    <tr>
                      <th>Cargo</th>
                      <th>Produto</th>
                      <th>Preço padrão</th>
                      <th>Preço especial</th>
                      <th>Período</th>
                      <th>Status</th>
                      <th>Atualizado</th>
                      <th style={{ width: '180px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {precos.length === 0 ? (
                      <tr>
                        <td colSpan={8} className='text-center py-4'>
                          <div className='empty-state'>
                            <div className='empty-state-icon'>🏷️</div>
                            <p className='text-muted mb-0'>Nenhum preço especial encontrado.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      precos.map((preco) => (
                        <tr key={preco.id}>
                          <td className='fw-semibold'>{preco.cargo}</td>
                          <td>
                            <div>{preco.produto_nome}</div>
                            <small className='text-muted'>
                              Padrão: {formatCurrency(preco.preco_padrao)}
                            </small>
                          </td>
                          <td>{formatCurrency(preco.preco_padrao)}</td>
                          <td className='fw-semibold text-primary'>
                            {formatCurrency(preco.preco_especial)}
                          </td>
                          <td>{formatPeriodo(preco.dt_inicio_vigencia, preco.dt_fim_vigencia)}</td>
                          <td>
                            <span
                              className={`badge ${preco.ativo ? 'bg-success' : 'bg-secondary'}`}
                            >
                              {preco.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td>{formatDate(preco.dt_alteracao)}</td>
                          <td>
                            <div className='btn-group btn-group-sm'>
                              <button
                                className='btn btn-outline-primary'
                                onClick={() => {
                                  setEditingPreco(preco);
                                  setShowModal(true);
                                }}
                              >
                                Editar
                              </button>
                              <button
                                className='btn btn-outline-secondary'
                                onClick={() => handleHistorico(preco)}
                              >
                                Histórico
                              </button>
                              <button
                                className={`btn btn-outline-${preco.ativo ? 'warning' : 'success'}`}
                                onClick={() => handleToggleAtivo(preco)}
                              >
                                {preco.ativo ? 'Desativar' : 'Reativar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <PrecoModal
          preco={editingPreco}
          produtos={produtos}
          onClose={() => {
            setShowModal(false);
            setEditingPreco(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingPreco(null);
            loadPrecos();
          }}
        />
      )}

      {showHistorico && historicoPreco && (
        <HistoricoModal
          preco={historicoPreco}
          historico={historico}
          loading={historicoLoading}
          onClose={() => {
            setShowHistorico(false);
            setHistoricoPreco(null);
            setHistorico([]);
          }}
        />
      )}
    </MainLayout>
  );
}

interface PrecoModalProps {
  preco: PrecoCargo | null;
  produtos: ProdutoOption[];
  onClose: () => void;
  onSaved: () => void;
}

function PrecoModal({ preco, produtos, onClose, onSaved }: PrecoModalProps) {
  const isEdicao = Boolean(preco);
  const [cargo, setCargo] = useState(preco?.cargo ?? '');
  const [idProduto, setIdProduto] = useState(
    preco ? String(preco.id_produto) : produtos[0] ? String(produtos[0].id) : ''
  );
  const [precoEspecial, setPrecoEspecial] = useState(
    preco ? preco.preco_especial.toFixed(2).replace('.', ',') : ''
  );
  const [dataInicio, setDataInicio] = useState(
    preco?.dt_inicio_vigencia ? preco.dt_inicio_vigencia.slice(0, 10) : ''
  );
  const [dataFim, setDataFim] = useState(
    preco?.dt_fim_vigencia ? preco.dt_fim_vigencia.slice(0, 10) : ''
  );
  const [ativo, setAtivo] = useState(preco ? preco.ativo === 1 : true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdicao && produtos.length > 0 && !idProduto) {
      setIdProduto(String(produtos[0].id));
    }
  }, [isEdicao, produtos, idProduto]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!cargo.trim()) {
      setFeedback('Informe o cargo que receberá o preço especial.');
      return;
    }
    if (!idProduto) {
      setFeedback('Selecione um produto.');
      return;
    }
    if (!precoEspecial.trim()) {
      setFeedback('Informe o valor do preço especial.');
      return;
    }

    const valorEspecial = toDecimal(precoEspecial);
    if (valorEspecial === null) {
      setFeedback('Valor do preço especial inválido.');
      return;
    }

    const payload: Record<string, unknown> = {
      cargo: cargo.trim().toUpperCase(),
      preco_especial: valorEspecial,
      ativo: ativo ? 1 : 0,
    };

    if (dataInicio) payload.dt_inicio_vigencia = dataInicio;
    if (dataFim) payload.dt_fim_vigencia = dataFim;

    if (!isEdicao) {
      payload.id_produto = Number(idProduto);
    }

    try {
      setLoading(true);
      const url = isEdicao ? `/api/funcionarios/precos/${preco?.id}` : '/api/funcionarios/precos';
      const method = isEdicao ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(isEdicao ? 'Preço atualizado com sucesso!' : 'Preço cadastrado com sucesso!');
        onSaved();
      } else {
        setFeedback(data.error || 'Não foi possível salvar o preço especial.');
      }
    } catch (error) {
      console.error('Erro ao salvar preço por cargo:', error);
      setFeedback('Erro interno ao salvar o preço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className='modal-dialog modal-lg'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>
              {isEdicao ? 'Editar preço por cargo' : 'Novo preço por cargo'}
            </h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='modal-body'>
              {feedback && (
                <div className='alert alert-warning' role='alert'>
                  {feedback}
                </div>
              )}
              <div className='row g-3'>
                <div className='col-md-6'>
                  <label className='form-label'>Cargo *</label>
                  <input
                    type='text'
                    className='form-control'
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value.toUpperCase())}
                    placeholder='Ex.: PROFESSOR'
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label'>Produto *</label>
                  <select
                    className='form-select'
                    value={idProduto}
                    onChange={(e) => setIdProduto(e.target.value)}
                    disabled={isEdicao}
                  >
                    <option value=''>Selecione</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} ({formatCurrency(produto.preco_venda)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className='col-md-4'>
                  <label className='form-label'>Preço especial *</label>
                  <input
                    type='text'
                    className='form-control'
                    inputMode='decimal'
                    value={precoEspecial}
                    onChange={(e) => setPrecoEspecial(normalizeDecimalInput(e.target.value))}
                    placeholder='Ex.: 12,50'
                  />
                </div>
                <div className='col-md-4'>
                  <label className='form-label'>Início da vigência</label>
                  <input
                    type='date'
                    className='form-control'
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className='col-md-4'>
                  <label className='form-label'>Fim da vigência</label>
                  <input
                    type='date'
                    className='form-control'
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
                <div className='col-12'>
                  <div className='form-check form-switch'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      id='precoAtivoSwitch'
                      checked={ativo}
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                    <label className='form-check-label' htmlFor='precoAtivoSwitch'>
                      Preço ativo
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-outline-secondary' onClick={onClose}>
                Cancelar
              </button>
              <button type='submit' className='btn btn-primary' disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface HistoricoModalProps {
  preco: PrecoCargo;
  historico: HistoricoPreco[];
  loading: boolean;
  onClose: () => void;
}

function HistoricoModal({ preco, historico, loading, onClose }: HistoricoModalProps) {
  return (
    <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className='modal-dialog modal-lg'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Histórico de preços - {preco.cargo}</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            <p className='text-muted'>
              Produto: <strong>{preco.produto_nome}</strong>
            </p>
            {loading ? (
              <div className='text-center py-4'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Carregando...</span>
                </div>
              </div>
            ) : historico.length === 0 ? (
              <div className='empty-state py-4 text-center'>
                <div className='empty-state-icon'>📄</div>
                <p className='text-muted mb-0'>Nenhuma alteração registrada para este preço.</p>
              </div>
            ) : (
              <div className='table-responsive'>
                <table className='table table-sm table-hover'>
                  <thead className='table-light'>
                    <tr>
                      <th>Data</th>
                      <th>Preço anterior</th>
                      <th>Preço novo</th>
                      <th>Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.dt_alteracao)}</td>
                        <td>{formatCurrency(item.preco_anterior)}</td>
                        <td className='fw-semibold text-primary'>
                          {formatCurrency(item.preco_novo)}
                        </td>
                        <td>{item.usuario_nome || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className='modal-footer'>
            <button type='button' className='btn btn-outline-secondary' onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
