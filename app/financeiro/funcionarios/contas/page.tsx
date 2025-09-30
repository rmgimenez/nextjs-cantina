'use client';

import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface ContaFuncionario {
  id: number;
  codigo_funcionario: number;
  funcionario_nome: string | null;
  cargo_oficial: string | null;
  limite_credito: number | null;
  alerta_credito: number | null;
  total_em_aberto: number;
  limite_disponivel: number | null;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
  observacoes?: string | null;
}

interface FuncionarioBusca {
  codigo: number;
  nome: string;
  cargo: string | null;
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '-';
  }
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
  return date.toLocaleString('pt-BR');
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

export default function ContasFuncionariosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [contas, setContas] = useState<ContaFuncionario[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cargoFilter, setCargoFilter] = useState('');
  const [limiteMinFilter, setLimiteMinFilter] = useState('');
  const [limiteMaxFilter, setLimiteMaxFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaFuncionario | null>(null);

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
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadContas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchTerm, statusFilter, cargoFilter, limiteMinFilter, limiteMaxFilter]);

  const loadContas = async () => {
    try {
      setListLoading(true);
      setErrorMessage(null);

      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (statusFilter) params.append('ativo', statusFilter);
      if (cargoFilter.trim()) params.append('cargo', cargoFilter.trim());
      if (limiteMinFilter.trim()) {
        const min = toDecimal(normalizeDecimalInput(limiteMinFilter));
        if (min !== null) {
          params.append('limite_min', String(min));
        }
      }
      if (limiteMaxFilter.trim()) {
        const max = toDecimal(normalizeDecimalInput(limiteMaxFilter));
        if (max !== null) {
          params.append('limite_max', String(max));
        }
      }

      const res = await fetch(`/api/funcionarios/contas?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const parsed = (
          data.data as Array<{
            id: number;
            codigo_funcionario: number;
            funcionario_nome: string | null;
            cargo_oficial: string | null;
            limite_credito: number | null;
            alerta_credito: number | null;
            total_em_aberto: number;
            limite_disponivel: number | null;
            ativo: number;
            dt_criacao: string;
            dt_alteracao: string;
            observacoes: string | null;
          }>
        ).map((row) => ({
          id: Number(row.id),
          codigo_funcionario: Number(row.codigo_funcionario),
          funcionario_nome: row.funcionario_nome ?? null,
          cargo_oficial: row.cargo_oficial ?? null,
          limite_credito:
            row.limite_credito !== null && row.limite_credito !== undefined
              ? Number(row.limite_credito)
              : null,
          alerta_credito:
            row.alerta_credito !== null && row.alerta_credito !== undefined
              ? Number(row.alerta_credito)
              : null,
          total_em_aberto: Number(row.total_em_aberto ?? 0),
          limite_disponivel:
            row.limite_disponivel !== null && row.limite_disponivel !== undefined
              ? Number(row.limite_disponivel)
              : null,
          ativo: Number(row.ativo ?? 0),
          dt_criacao: row.dt_criacao,
          dt_alteracao: row.dt_alteracao,
          observacoes: row.observacoes ?? null,
        }));
        setContas(parsed);
      } else {
        setErrorMessage(data.error || 'Não foi possível carregar as contas.');
      }
    } catch (error) {
      console.error('Erro ao carregar contas de funcionários:', error);
      setErrorMessage('Erro interno ao carregar contas.');
    } finally {
      setListLoading(false);
    }
  };

  const resumo = useMemo(() => {
    const totalAberto = contas.reduce((sum, conta) => sum + Number(conta.total_em_aberto || 0), 0);
    const totalLimite = contas.reduce((sum, conta) => {
      if (conta.limite_credito == null) return sum;
      return sum + conta.limite_credito;
    }, 0);
    const totalDisponivel = contas.reduce((sum, conta) => {
      if (conta.limite_disponivel == null) return sum;
      return sum + conta.limite_disponivel;
    }, 0);
    const contasCriticas = contas.filter(
      (conta) => conta.limite_disponivel != null && conta.limite_disponivel <= 0.01
    ).length;
    const contasAtivas = contas.filter((conta) => conta.ativo === 1).length;
    return {
      totalAberto,
      totalLimite,
      totalDisponivel,
      contasCriticas,
      contasAtivas,
    };
  }, [contas]);

  const handleToggleStatus = async (conta: ContaFuncionario) => {
    const novoStatus = conta.ativo ? 0 : 1;
    const confirma = window.confirm(
      `Deseja ${novoStatus ? 'ativar' : 'desativar'} a conta do funcionário ${
        conta.funcionario_nome || conta.codigo_funcionario
      }?`
    );
    if (!confirma) return;

    try {
      const res = await fetch(`/api/funcionarios/contas/${conta.codigo_funcionario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: novoStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadContas();
      } else {
        alert(data.error || 'Não foi possível alterar o status.');
      }
    } catch (error) {
      console.error('Erro ao alterar status da conta:', error);
      alert('Erro interno do servidor.');
    }
  };

  if (loading) {
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
            <h1 className='h3 mb-0'>Contas de Funcionários</h1>
            <p className='text-muted'>
              Configure limites de crédito e acompanhe o consumo dos funcionários da escola.
            </p>
          </div>
          <button
            className='btn btn-primary'
            onClick={() => {
              setEditingConta(null);
              setShowModal(true);
            }}
          >
            Nova conta
          </button>
        </div>

        {/* Filtros */}
        <div className='card border-0 shadow-sm mb-4'>
          <div className='card-body'>
            <div className='row g-3'>
              <div className='col-md-3'>
                <label className='form-label'>Buscar por nome ou código</label>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Ex.: 123 ou João'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
              <div className='col-md-2'>
                <label className='form-label'>Limite mín.</label>
                <input
                  type='text'
                  className='form-control'
                  inputMode='decimal'
                  value={limiteMinFilter}
                  onChange={(e) => setLimiteMinFilter(normalizeDecimalInput(e.target.value))}
                />
              </div>
              <div className='col-md-2'>
                <label className='form-label'>Limite máx.</label>
                <input
                  type='text'
                  className='form-control'
                  inputMode='decimal'
                  value={limiteMaxFilter}
                  onChange={(e) => setLimiteMaxFilter(normalizeDecimalInput(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className='row g-3 mb-4'>
          <div className='col-md-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Contas ativas</h6>
                <h4 className='mb-0 text-primary'>{resumo.contasAtivas}</h4>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Total em aberto</h6>
                <h4 className='mb-0 text-danger'>{formatCurrency(resumo.totalAberto)}</h4>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Limite total configurado</h6>
                <h4 className='mb-0 text-secondary'>{formatCurrency(resumo.totalLimite)}</h4>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Contas no limite</h6>
                <h4 className='mb-0 text-warning'>{resumo.contasCriticas}</h4>
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
            {listLoading ? (
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
                      <th>Funcionário</th>
                      <th>Cargo</th>
                      <th>Limite Crédito</th>
                      <th>Total em Aberto</th>
                      <th>Disponível</th>
                      <th>Alerta</th>
                      <th>Status</th>
                      <th>Atualizado</th>
                      <th style={{ width: '140px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className='text-center py-4'>
                          <div className='empty-state'>
                            <div className='empty-state-icon'>👥</div>
                            <p className='text-muted mb-0'>
                              Nenhuma conta encontrada com os filtros selecionados.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      contas.map((conta) => {
                        const saldoCritico =
                          conta.limite_disponivel != null &&
                          conta.limite_disponivel <= (conta.alerta_credito ?? 0);
                        return (
                          <tr key={conta.id}>
                            <td>
                              <div className='fw-semibold'>
                                {conta.funcionario_nome || 'Funcionário não localizado'}
                              </div>
                              <small className='text-muted'>
                                Código: {conta.codigo_funcionario}
                              </small>
                              {conta.observacoes && (
                                <div>
                                  <small className='text-muted'>Obs.: {conta.observacoes}</small>
                                </div>
                              )}
                            </td>
                            <td>{conta.cargo_oficial || '-'}</td>
                            <td>{formatCurrency(conta.limite_credito)}</td>
                            <td className='text-danger fw-semibold'>
                              {formatCurrency(conta.total_em_aberto)}
                            </td>
                            <td
                              className={saldoCritico ? 'fw-semibold text-warning' : 'fw-semibold'}
                            >
                              {formatCurrency(conta.limite_disponivel)}
                            </td>
                            <td>{formatCurrency(conta.alerta_credito)}</td>
                            <td>
                              <span
                                className={`badge ${conta.ativo ? 'bg-success' : 'bg-secondary'}`}
                              >
                                {conta.ativo ? 'Ativa' : 'Inativa'}
                              </span>
                            </td>
                            <td>{formatDate(conta.dt_alteracao)}</td>
                            <td>
                              <div className='btn-group btn-group-sm'>
                                <button
                                  className='btn btn-outline-primary'
                                  onClick={() => {
                                    setEditingConta(conta);
                                    setShowModal(true);
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  className={`btn btn-outline-${
                                    conta.ativo ? 'warning' : 'success'
                                  }`}
                                  onClick={() => handleToggleStatus(conta)}
                                >
                                  {conta.ativo ? 'Desativar' : 'Ativar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ContaModal
          conta={editingConta}
          onClose={() => {
            setShowModal(false);
            setEditingConta(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingConta(null);
            loadContas();
          }}
        />
      )}
    </MainLayout>
  );
}

interface ContaModalProps {
  conta: ContaFuncionario | null;
  onClose: () => void;
  onSaved: () => void;
}

function ContaModal({ conta, onClose, onSaved }: ContaModalProps) {
  const [codigo, setCodigo] = useState(conta ? String(conta.codigo_funcionario) : '');
  const [funcionario, setFuncionario] = useState<FuncionarioBusca | null>(
    conta
      ? {
          codigo: conta.codigo_funcionario,
          nome: conta.funcionario_nome || '',
          cargo: conta.cargo_oficial || null,
        }
      : null
  );
  const [limite, setLimite] = useState(
    conta?.limite_credito != null ? conta.limite_credito.toFixed(2).replace('.', ',') : ''
  );
  const [alerta, setAlerta] = useState(
    conta?.alerta_credito != null ? conta.alerta_credito.toFixed(2).replace('.', ',') : ''
  );
  const [observacoes, setObservacoes] = useState(conta?.observacoes || '');
  const [ativo, setAtivo] = useState(conta ? conta.ativo === 1 : true);
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isEdicao = Boolean(conta);

  const handleBuscarFuncionario = async () => {
    if (!codigo.trim()) {
      setFeedback('Informe o código do funcionário para buscar.');
      return;
    }

    try {
      setFeedback(null);
      setBuscando(true);
      const res = await fetch(
        `/api/funcionarios/busca?q=${encodeURIComponent(codigo.trim())}&limit=1`
      );
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
        const found = data.data[0] as FuncionarioBusca;
        setFuncionario(found);
      } else {
        setFuncionario(null);
        setFeedback('Funcionário não encontrado para o código informado.');
      }
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      setFeedback('Erro ao buscar funcionário. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!isEdicao && !funcionario) {
      setFeedback('Selecione um funcionário antes de salvar a conta.');
      return;
    }

    const limiteDecimal = toDecimal(limite);
    const alertaDecimal = toDecimal(alerta);

    try {
      setLoading(true);
      const payload: Record<string, unknown> = {
        limite_credito: limiteDecimal,
        alerta_credito: alertaDecimal,
        observacoes: observacoes.trim() ? observacoes.trim() : null,
        ativo: ativo ? 1 : 0,
      };

      if (!isEdicao && funcionario) {
        payload.codigo_funcionario = Number(funcionario.codigo);
      }

      const url = isEdicao
        ? `/api/funcionarios/contas/${conta?.codigo_funcionario}`
        : '/api/funcionarios/contas';
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
        alert(isEdicao ? 'Conta atualizada com sucesso!' : 'Conta criada com sucesso!');
        onSaved();
      } else {
        setFeedback(data.error || 'Não foi possível salvar a conta.');
      }
    } catch (error) {
      console.error('Erro ao salvar conta de funcionário:', error);
      setFeedback('Erro interno ao salvar a conta.');
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
              {isEdicao ? 'Editar conta de funcionário' : 'Nova conta de funcionário'}
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
                <div className='col-md-4'>
                  <label className='form-label'>Código do funcionário *</label>
                  <div className='input-group'>
                    <input
                      type='text'
                      className='form-control'
                      value={codigo}
                      onChange={(e) => {
                        setCodigo(e.target.value.replace(/[^\d]/g, ''));
                        if (!isEdicao) {
                          setFuncionario(null);
                        }
                      }}
                      disabled={isEdicao}
                      placeholder='Ex.: 123'
                    />
                    {!isEdicao && (
                      <button
                        className='btn btn-outline-secondary'
                        type='button'
                        onClick={handleBuscarFuncionario}
                        disabled={buscando}
                      >
                        {buscando ? 'Buscando...' : 'Buscar'}
                      </button>
                    )}
                  </div>
                </div>
                <div className='col-md-8'>
                  <label className='form-label'>Funcionário selecionado</label>
                  <input
                    type='text'
                    className='form-control'
                    value={
                      funcionario
                        ? `${funcionario.nome}${funcionario.cargo ? ` - ${funcionario.cargo}` : ''}`
                        : 'Nenhum funcionário selecionado'
                    }
                    disabled
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label'>Limite de crédito</label>
                  <input
                    type='text'
                    inputMode='decimal'
                    className='form-control'
                    placeholder='Ex.: 500,00'
                    value={limite}
                    onChange={(e) => setLimite(normalizeDecimalInput(e.target.value))}
                  />
                  <div className='form-text'>Deixe em branco para não aplicar limite fixo.</div>
                </div>
                <div className='col-md-6'>
                  <label className='form-label'>Alerta de crédito</label>
                  <input
                    type='text'
                    inputMode='decimal'
                    className='form-control'
                    placeholder='Ex.: 100,00'
                    value={alerta}
                    onChange={(e) => setAlerta(normalizeDecimalInput(e.target.value))}
                  />
                  <div className='form-text'>
                    Envie um alerta quando o saldo disponível atingir este valor.
                  </div>
                </div>
                <div className='col-12'>
                  <label className='form-label'>Observações</label>
                  <textarea
                    className='form-control'
                    rows={3}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder='Registre instruções específicas sobre este funcionário.'
                  ></textarea>
                </div>
                <div className='col-12'>
                  <div className='form-check form-switch'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      id='contaAtivaSwitch'
                      checked={ativo}
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                    <label className='form-check-label' htmlFor='contaAtivaSwitch'>
                      Conta ativa
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
