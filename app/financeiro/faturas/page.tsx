'use client';

import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}

type FaturaStatus = 'GERADA' | 'ENVIADA' | 'PAGA' | 'VENCIDA' | 'PARCIAL';

type FormaPagamento = 'DINHEIRO' | 'CARTAO' | 'TRANSFERENCIA' | 'DESCONTO_FOLHA';

interface Fatura {
  id: number;
  codigo_funcionario: number;
  funcionario_nome: string | null;
  cargo: string | null;
  mes_referencia: string;
  valor_total: number;
  quantidade_itens: number;
  status: FaturaStatus;
  dt_vencimento: string | null;
  dt_pagamento: string | null;
  dt_envio_email: string | null;
  dt_criacao: string;
  observacoes: string | null;
  total_pago: number;
}

interface ItemFatura {
  id: number;
  id_venda: number;
  valor_original: number;
  valor_aplicado: number;
  desconto_aplicado: number;
  mes_referencia: string;
  pago: number;
  dt_lancamento: string;
  dt_venda: string;
  usuario: number | null;
  usuario_nome: string | null;
}

interface PagamentoFatura {
  id: number;
  valor_pago: number;
  forma_pagamento: FormaPagamento;
  dt_pagamento: string;
  observacoes: string | null;
  usuario: number;
  usuario_nome: string | null;
}

interface FaturaDetalhada extends Fatura {
  saldo_aberto: number;
  itens: ItemFatura[];
  pagamentos: PagamentoFatura[];
}

const STATUS_OPTIONS: { value: FaturaStatus; label: string }[] = [
  { value: 'GERADA', label: 'Gerada' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'PARCIAL', label: 'Parcial' },
  { value: 'PAGA', label: 'Paga' },
  { value: 'VENCIDA', label: 'Vencida' },
];

const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO', label: 'Cartão' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
  { value: 'DESCONTO_FOLHA', label: 'Desconto em folha' },
];

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

function defaultMesReferencia() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

type ApiRow = Record<string, unknown>;

function parseFatura(row: ApiRow): Fatura {
  const funcionarioNome =
    typeof row['funcionario_nome'] === 'string' ? (row['funcionario_nome'] as string) : null;
  const cargo = typeof row['cargo'] === 'string' ? (row['cargo'] as string) : null;
  const statusValue = typeof row['status'] === 'string' ? (row['status'] as string) : 'GERADA';
  const dtVencimento =
    typeof row['dt_vencimento'] === 'string' ? (row['dt_vencimento'] as string) : null;
  const dtPagamento =
    typeof row['dt_pagamento'] === 'string' ? (row['dt_pagamento'] as string) : null;
  const dtEnvioEmail =
    typeof row['dt_envio_email'] === 'string' ? (row['dt_envio_email'] as string) : null;
  const observacoes =
    typeof row['observacoes'] === 'string' ? (row['observacoes'] as string) : null;

  return {
    id: Number(row['id']),
    codigo_funcionario: Number(row['codigo_funcionario']),
    funcionario_nome: funcionarioNome,
    cargo,
    mes_referencia: String(row['mes_referencia'] ?? ''),
    valor_total: Number(row['valor_total'] ?? 0),
    quantidade_itens: Number(row['quantidade_itens'] ?? 0),
    status: (STATUS_OPTIONS.find((option) => option.value === statusValue)?.value ||
      'GERADA') as FaturaStatus,
    dt_vencimento: dtVencimento,
    dt_pagamento: dtPagamento,
    dt_envio_email: dtEnvioEmail,
    dt_criacao: String(row['dt_criacao'] ?? ''),
    observacoes,
    total_pago: Number(row['total_pago'] ?? 0),
  };
}

function parseDetalhe(row: ApiRow): FaturaDetalhada {
  const base = parseFatura(row);
  const saldoBruto = row['saldo_aberto'] ?? base.valor_total - base.total_pago;
  return {
    ...base,
    saldo_aberto: Number(saldoBruto ?? 0),
    itens: Array.isArray(row['itens'])
      ? (row['itens'] as ApiRow[]).map((item) => ({
          id: Number(item['id']),
          id_venda: Number(item['id_venda']),
          valor_original: Number(item['valor_original'] ?? 0),
          valor_aplicado: Number(item['valor_aplicado'] ?? 0),
          desconto_aplicado: Number(item['desconto_aplicado'] ?? 0),
          mes_referencia: String(item['mes_referencia'] ?? base.mes_referencia),
          pago: Number(item['pago'] ?? 0),
          dt_lancamento: String(item['dt_lancamento'] ?? ''),
          dt_venda: String(item['dt_venda'] ?? ''),
          usuario:
            item['usuario'] !== null && item['usuario'] !== undefined
              ? Number(item['usuario'])
              : null,
          usuario_nome:
            typeof item['usuario_nome'] === 'string' ? (item['usuario_nome'] as string) : null,
        }))
      : [],
    pagamentos: Array.isArray(row['pagamentos'])
      ? (row['pagamentos'] as ApiRow[]).map((pg) => ({
          id: Number(pg['id']),
          valor_pago: Number(pg['valor_pago'] ?? 0),
          forma_pagamento: (pg['forma_pagamento'] as FormaPagamento) ?? 'DINHEIRO',
          dt_pagamento: String(pg['dt_pagamento'] ?? ''),
          observacoes: typeof pg['observacoes'] === 'string' ? (pg['observacoes'] as string) : null,
          usuario: Number(pg['usuario'] ?? 0),
          usuario_nome:
            typeof pg['usuario_nome'] === 'string' ? (pg['usuario_nome'] as string) : null,
        }))
      : [],
  };
}

function normalizeNumeric(value: string) {
  if (!value) return '';
  return value.replace(/[^\d]/g, '');
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

export default function FaturasFuncionariosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loadingFaturas, setLoadingFaturas] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mesFilter, setMesFilter] = useState(defaultMesReferencia());
  const [statusFilter, setStatusFilter] = useState<FaturaStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [codigoFilter, setCodigoFilter] = useState('');

  const [showGerar, setShowGerar] = useState(false);

  const [detalhe, setDetalhe] = useState<FaturaDetalhada | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

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
    loadFaturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mesFilter, statusFilter, searchTerm, codigoFilter]);

  const loadFaturas = async () => {
    try {
      setLoadingFaturas(true);
      setErrorMessage(null);

      const params = new URLSearchParams();
      if (mesFilter) params.append('mes', mesFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (codigoFilter.trim()) params.append('codigo_funcionario', codigoFilter.trim());

      const res = await fetch(`/api/funcionarios/faturas?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const lista = Array.isArray(data.data)
          ? (data.data as ApiRow[]).map((item) => parseFatura(item))
          : [];
        setFaturas(lista);
      } else {
        setErrorMessage(data.error || 'Não foi possível carregar as faturas.');
      }
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      setErrorMessage('Erro interno ao carregar faturas.');
    } finally {
      setLoadingFaturas(false);
    }
  };

  const resumo = useMemo(() => {
    const totalFaturado = faturas.reduce((acc, fatura) => acc + fatura.valor_total, 0);
    const totalPago = faturas.reduce((acc, fatura) => acc + fatura.total_pago, 0);
    const totalAberto = faturas.reduce(
      (acc, fatura) => acc + Math.max(fatura.valor_total - fatura.total_pago, 0),
      0
    );
    const faturasPendentes = faturas.filter((fatura) => fatura.status !== 'PAGA').length;
    return { totalFaturado, totalPago, totalAberto, faturasPendentes };
  }, [faturas]);

  const openDetalhe = async (id: number) => {
    try {
      setLoadingDetalhe(true);
      const res = await fetch(`/api/funcionarios/faturas/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const detalhe = parseDetalhe((data.data ?? {}) as ApiRow);
        setDetalhe(detalhe);
        setShowDetalhe(true);
      } else {
        alert(data.error || 'Não foi possível carregar a fatura selecionada.');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da fatura:', error);
      alert('Erro interno ao consultar fatura.');
    } finally {
      setLoadingDetalhe(false);
    }
  };

  const atualizarFatura = async (
    id: number,
    payload: { status?: FaturaStatus; dt_vencimento?: string | null; observacoes?: string | null }
  ) => {
    try {
      const res = await fetch(`/api/funcionarios/faturas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const detalheAtualizado = parseDetalhe((data.data ?? {}) as ApiRow);
        setDetalhe(detalheAtualizado);
        await loadFaturas();
        return { success: true };
      }
      return { success: false, message: data.error || 'Não foi possível atualizar a fatura.' };
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error);
      return { success: false, message: 'Erro interno ao atualizar a fatura.' };
    }
  };

  const registrarPagamento = async (
    id: number,
    payload: { valor_pago: number; forma_pagamento: FormaPagamento; observacoes?: string }
  ) => {
    try {
      const res = await fetch(`/api/funcionarios/faturas/${id}/pagamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Recarrega detalhes completos após o pagamento
        await openDetalhe(id);
        await loadFaturas();
        return { success: true };
      }
      return { success: false, message: data.error || 'Não foi possível registrar o pagamento.' };
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      return { success: false, message: 'Erro interno ao registrar pagamento.' };
    }
  };

  const gerarFaturas = async (payload: {
    mes_referencia: string;
    codigo_funcionario?: number | null;
    dt_vencimento?: string | null;
  }) => {
    try {
      const res = await fetch(`/api/funcionarios/faturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadFaturas();
        return {
          success: true,
          message: typeof data.message === 'string' ? data.message : 'Faturas geradas com sucesso!',
        };
      }
      return { success: false, message: data.error || 'Não foi possível gerar as faturas.' };
    } catch (error) {
      console.error('Erro ao gerar faturas:', error);
      return { success: false, message: 'Erro interno ao gerar faturas.' };
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

  if (!user) return null;

  return (
    <MainLayout>
      <div className='container-fluid'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <div>
            <h1 className='h3 mb-0'>Faturas de Funcionários</h1>
            <p className='text-muted'>
              Consolide o consumo mensal dos funcionários, registre pagamentos e acompanhe saldos em
              aberto.
            </p>
          </div>
          <button className='btn btn-primary' onClick={() => setShowGerar(true)}>
            Gerar faturas
          </button>
        </div>

        <div className='card border-0 shadow-sm mb-4'>
          <div className='card-body'>
            <div className='row g-3'>
              <div className='col-md-3'>
                <label className='form-label'>Mês de referência</label>
                <input
                  type='month'
                  className='form-control'
                  value={mesFilter}
                  onChange={(e) => setMesFilter(e.target.value)}
                />
              </div>
              <div className='col-md-2'>
                <label className='form-label'>Status</label>
                <select
                  className='form-select'
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FaturaStatus | '')}
                >
                  <option value=''>Todos</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-md-3'>
                <label className='form-label'>Buscar por nome ou cargo</label>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Ex.: João'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className='col-md-2'>
                <label className='form-label'>Código do funcionário</label>
                <input
                  type='text'
                  className='form-control'
                  value={codigoFilter}
                  onChange={(e) => setCodigoFilter(normalizeNumeric(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='row g-3 mb-4'>
          <div className='col-md-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Total faturado</h6>
                <h4 className='mb-0 text-primary'>{formatCurrency(resumo.totalFaturado)}</h4>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Total recebido</h6>
                <h4 className='mb-0 text-success'>{formatCurrency(resumo.totalPago)}</h4>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Saldo em aberto</h6>
                <h4 className='mb-0 text-danger'>{formatCurrency(resumo.totalAberto)}</h4>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h6 className='text-muted'>Faturas pendentes</h6>
                <h4 className='mb-0 text-warning'>{resumo.faturasPendentes}</h4>
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
            {loadingFaturas ? (
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
                      <th>Mês</th>
                      <th>Valor</th>
                      <th>Pago</th>
                      <th>Saldo</th>
                      <th>Status</th>
                      <th>Vencimento</th>
                      <th style={{ width: '150px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faturas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className='text-center py-4'>
                          <div className='empty-state'>
                            <div className='empty-state-icon'>📄</div>
                            <p className='text-muted mb-0'>Nenhuma fatura encontrada.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      faturas.map((fatura) => {
                        const saldo = Math.max(
                          Number(fatura.valor_total) - Number(fatura.total_pago),
                          0
                        );
                        return (
                          <tr key={fatura.id}>
                            <td>
                              <div className='fw-semibold'>
                                {fatura.funcionario_nome || 'Funcionário não identificado'}
                              </div>
                              <small className='text-muted'>
                                Código: {fatura.codigo_funcionario}
                              </small>
                            </td>
                            <td>{fatura.cargo || '-'}</td>
                            <td>{fatura.mes_referencia}</td>
                            <td>{formatCurrency(fatura.valor_total)}</td>
                            <td>{formatCurrency(fatura.total_pago)}</td>
                            <td className={saldo > 0 ? 'text-danger fw-semibold' : ''}>
                              {formatCurrency(saldo)}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  fatura.status === 'PAGA'
                                    ? 'bg-success'
                                    : fatura.status === 'VENCIDA'
                                    ? 'bg-danger'
                                    : fatura.status === 'PARCIAL'
                                    ? 'bg-warning text-dark'
                                    : 'bg-secondary'
                                }`}
                              >
                                {STATUS_OPTIONS.find((s) => s.value === fatura.status)?.label ??
                                  fatura.status}
                              </span>
                            </td>
                            <td>{formatDate(fatura.dt_vencimento)}</td>
                            <td>
                              <div className='btn-group btn-group-sm'>
                                <button
                                  className='btn btn-outline-primary'
                                  onClick={() => openDetalhe(fatura.id)}
                                  disabled={loadingDetalhe}
                                >
                                  Detalhes
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

      {showGerar && (
        <GerarFaturasModal
          mesPadrao={mesFilter || defaultMesReferencia()}
          onClose={() => setShowGerar(false)}
          onGenerated={gerarFaturas}
        />
      )}

      {showDetalhe && detalhe && (
        <DetalheFaturaModal
          fatura={detalhe}
          loading={loadingDetalhe}
          onClose={() => {
            setShowDetalhe(false);
            setDetalhe(null);
          }}
          onAtualizar={atualizarFatura}
          onRegistrarPagamento={registrarPagamento}
        />
      )}
    </MainLayout>
  );
}

interface GerarFaturasModalProps {
  mesPadrao: string;
  onClose: () => void;
  onGenerated: (payload: {
    mes_referencia: string;
    codigo_funcionario?: number | null;
    dt_vencimento?: string | null;
  }) => Promise<{ success: boolean; message?: string }>;
}

function GerarFaturasModal({ mesPadrao, onClose, onGenerated }: GerarFaturasModalProps) {
  const [mesReferencia, setMesReferencia] = useState(mesPadrao);
  const [codigo, setCodigo] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!mesReferencia) {
      setFeedback('Informe o mês de referência no formato AAAA-MM.');
      return;
    }

    const codigoNumero = codigo.trim() ? Number(codigo.trim()) : null;
    if (codigoNumero !== null && !Number.isFinite(codigoNumero)) {
      setFeedback('Código do funcionário inválido.');
      return;
    }

    try {
      setLoading(true);
      const result = await onGenerated({
        mes_referencia: mesReferencia,
        codigo_funcionario: codigoNumero,
        dt_vencimento: vencimento || undefined,
      });
      if (result.success) {
        setFeedback(result.message || 'Faturas geradas com sucesso!');
        setTimeout(() => onClose(), 800);
      } else {
        setFeedback(result.message || 'Não foi possível gerar as faturas.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Gerar faturas de funcionários</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='modal-body'>
              {feedback && (
                <div className='alert alert-warning' role='alert'>
                  {feedback}
                </div>
              )}
              <div className='mb-3'>
                <label className='form-label'>Mês de referência *</label>
                <input
                  type='month'
                  className='form-control'
                  value={mesReferencia}
                  onChange={(e) => setMesReferencia(e.target.value)}
                />
              </div>
              <div className='mb-3'>
                <label className='form-label'>Código do funcionário (opcional)</label>
                <input
                  type='text'
                  className='form-control'
                  value={codigo}
                  onChange={(e) => setCodigo(normalizeNumeric(e.target.value))}
                  placeholder='Gerar fatura apenas para um funcionário'
                />
              </div>
              <div className='mb-3'>
                <label className='form-label'>Data de vencimento (opcional)</label>
                <input
                  type='date'
                  className='form-control'
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                />
              </div>
              <p className='text-muted mb-0'>
                As faturas serão criadas apenas para vendas pendentes do mês selecionado.
              </p>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-outline-secondary' onClick={onClose}>
                Cancelar
              </button>
              <button type='submit' className='btn btn-primary' disabled={loading}>
                {loading ? 'Gerando...' : 'Gerar faturas'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface DetalheFaturaModalProps {
  fatura: FaturaDetalhada;
  loading: boolean;
  onClose: () => void;
  onAtualizar: (
    id: number,
    payload: { status?: FaturaStatus; dt_vencimento?: string | null; observacoes?: string | null }
  ) => Promise<{ success: boolean; message?: string }>;
  onRegistrarPagamento: (
    id: number,
    payload: { valor_pago: number; forma_pagamento: FormaPagamento; observacoes?: string }
  ) => Promise<{ success: boolean; message?: string }>;
}

function DetalheFaturaModal({
  fatura,
  loading,
  onClose,
  onAtualizar,
  onRegistrarPagamento,
}: DetalheFaturaModalProps) {
  const [status, setStatus] = useState<FaturaStatus>(fatura.status);
  const [dtVencimento, setDtVencimento] = useState(
    fatura.dt_vencimento ? fatura.dt_vencimento.slice(0, 10) : ''
  );
  const [observacoes, setObservacoes] = useState(fatura.observacoes || '');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [valorPagamento, setValorPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('DINHEIRO');
  const [obsPagamento, setObsPagamento] = useState('');
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    setStatus(fatura.status);
    setDtVencimento(fatura.dt_vencimento ? fatura.dt_vencimento.slice(0, 10) : '');
    setObservacoes(fatura.observacoes || '');
  }, [fatura]);

  const saldoAberto = useMemo(() => {
    const base =
      fatura.saldo_aberto !== undefined && fatura.saldo_aberto !== null
        ? Number(fatura.saldo_aberto)
        : Number(fatura.valor_total ?? 0) - Number(fatura.total_pago ?? 0);
    if (!Number.isFinite(base)) return 0;
    return Number(Math.max(base, 0).toFixed(2));
  }, [fatura]);

  const podeQuitarRapido = saldoAberto > 0.009;

  const handleAtualizar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    try {
      setUpdating(true);
      const result = await onAtualizar(fatura.id, {
        status,
        dt_vencimento: dtVencimento || null,
        observacoes: observacoes.trim() || null,
      });
      if (!result.success) {
        setFeedback(result.message || 'Não foi possível atualizar a fatura.');
      } else {
        setFeedback('Fatura atualizada com sucesso.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRegistrarPagamento = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPaymentFeedback(null);

    const valor = toDecimal(normalizeDecimalInput(valorPagamento));
    if (valor === null || valor <= 0) {
      setPaymentFeedback('Informe um valor de pagamento válido.');
      return;
    }

    try {
      setRegistrando(true);
      const result = await onRegistrarPagamento(fatura.id, {
        valor_pago: valor,
        forma_pagamento: formaPagamento,
        observacoes: obsPagamento.trim() || undefined,
      });
      if (result.success) {
        setValorPagamento('');
        setObsPagamento('');
        setPaymentFeedback('Pagamento registrado com sucesso.');
      } else {
        setPaymentFeedback(result.message || 'Não foi possível registrar o pagamento.');
      }
    } finally {
      setRegistrando(false);
    }
  };

  const handleRegistrarPagamentoRapido = async () => {
    setPaymentFeedback(null);

    if (!podeQuitarRapido) {
      setPaymentFeedback('Não há saldo em aberto para quitar.');
      return;
    }

    const confirmado = window.confirm(
      `Confirmar desconto em folha no valor de ${formatCurrency(saldoAberto)}?`
    );
    if (!confirmado) return;

    try {
      setRegistrando(true);
      const result = await onRegistrarPagamento(fatura.id, {
        valor_pago: saldoAberto,
        forma_pagamento: 'DESCONTO_FOLHA',
        observacoes: 'Quitação total via desconto em folha',
      });
      if (result.success) {
        setValorPagamento('');
        setObsPagamento('');
        setPaymentFeedback('Pagamento registrado com sucesso (desconto em folha).');
      } else {
        setPaymentFeedback(result.message || 'Não foi possível registrar o pagamento.');
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento rápido da fatura:', error);
      setPaymentFeedback('Erro interno ao registrar o pagamento.');
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className='modal-dialog modal-xl'>
        <div className='modal-content'>
          <div className='modal-header'>
            <div>
              <h5 className='modal-title'>
                Fatura #{fatura.id} - {fatura.funcionario_nome}
              </h5>
              <small className='text-muted'>Mês de referência: {fatura.mes_referencia}</small>
            </div>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            {loading ? (
              <div className='text-center py-4'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Carregando...</span>
                </div>
              </div>
            ) : (
              <div className='row g-4'>
                <div className='col-lg-4'>
                  <div className='card border-0 shadow-sm h-100'>
                    <div className='card-body'>
                      <h6 className='text-muted'>Resumo financeiro</h6>
                      <ul className='list-unstyled mb-0'>
                        <li className='d-flex justify-content-between'>
                          <span>Valor total:</span>
                          <strong>{formatCurrency(fatura.valor_total)}</strong>
                        </li>
                        <li className='d-flex justify-content-between'>
                          <span>Total pago:</span>
                          <strong className='text-success'>
                            {formatCurrency(fatura.total_pago)}
                          </strong>
                        </li>
                        <li className='d-flex justify-content-between'>
                          <span>Saldo em aberto:</span>
                          <strong className='text-danger'>{formatCurrency(saldoAberto)}</strong>
                        </li>
                        <li className='d-flex justify-content-between'>
                          <span>Quantidade de itens:</span>
                          <strong>{fatura.quantidade_itens}</strong>
                        </li>
                      </ul>
                      <div className='mt-3'>
                        <button
                          type='button'
                          className='btn btn-outline-primary w-100'
                          onClick={handleRegistrarPagamentoRapido}
                          disabled={!podeQuitarRapido || registrando}
                        >
                          {registrando ? 'Processando...' : 'Quitar com desconto em folha'}
                        </button>
                        <small className='d-block text-muted mt-2'>
                          Registra automaticamente o saldo pendente como desconto em folha.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-lg-8'>
                  <form className='card border-0 shadow-sm mb-4' onSubmit={handleAtualizar}>
                    <div className='card-body'>
                      <h6 className='text-muted mb-3'>Atualizar fatura</h6>
                      {feedback && (
                        <div className='alert alert-info' role='alert'>
                          {feedback}
                        </div>
                      )}
                      <div className='row g-3'>
                        <div className='col-md-4'>
                          <label className='form-label'>Status</label>
                          <select
                            className='form-select'
                            value={status}
                            onChange={(e) => setStatus(e.target.value as FaturaStatus)}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='col-md-4'>
                          <label className='form-label'>Data de vencimento</label>
                          <input
                            type='date'
                            className='form-control'
                            value={dtVencimento}
                            onChange={(e) => setDtVencimento(e.target.value)}
                          />
                        </div>
                        <div className='col-12'>
                          <label className='form-label'>Observações</label>
                          <textarea
                            className='form-control'
                            rows={2}
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            placeholder='Informações adicionais sobre esta fatura'
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className='card-footer bg-white text-end'>
                      <button className='btn btn-primary' type='submit' disabled={updating}>
                        {updating ? 'Salvando...' : 'Salvar alterações'}
                      </button>
                    </div>
                  </form>

                  <form className='card border-0 shadow-sm' onSubmit={handleRegistrarPagamento}>
                    <div className='card-body'>
                      <h6 className='text-muted mb-3'>Registrar pagamento</h6>
                      {paymentFeedback && (
                        <div className='alert alert-info' role='alert'>
                          {paymentFeedback}
                        </div>
                      )}
                      <div className='row g-3'>
                        <div className='col-md-4'>
                          <label className='form-label'>Valor pago *</label>
                          <input
                            type='text'
                            className='form-control'
                            inputMode='decimal'
                            value={valorPagamento}
                            onChange={(e) =>
                              setValorPagamento(normalizeDecimalInput(e.target.value))
                            }
                            placeholder='Ex.: 125,00'
                          />
                        </div>
                        <div className='col-md-4'>
                          <label className='form-label'>Forma de pagamento *</label>
                          <select
                            className='form-select'
                            value={formaPagamento}
                            onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                          >
                            {FORMAS_PAGAMENTO.map((forma) => (
                              <option key={forma.value} value={forma.value}>
                                {forma.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='col-12'>
                          <label className='form-label'>Observações</label>
                          <textarea
                            className='form-control'
                            rows={2}
                            value={obsPagamento}
                            onChange={(e) => setObsPagamento(e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className='card-footer bg-white text-end'>
                      <button className='btn btn-success' type='submit' disabled={registrando}>
                        {registrando ? 'Registrando...' : 'Registrar pagamento'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className='row g-4 mt-1'>
              <div className='col-lg-7'>
                <div className='card border-0 shadow-sm'>
                  <div className='card-body'>
                    <h6 className='text-muted mb-3'>Itens da fatura</h6>
                    {fatura.itens.length === 0 ? (
                      <p className='text-muted mb-0'>Não há itens vinculados a esta fatura.</p>
                    ) : (
                      <div className='table-responsive'>
                        <table className='table table-sm table-hover'>
                          <thead className='table-light'>
                            <tr>
                              <th>Venda</th>
                              <th>Data</th>
                              <th>Valor original</th>
                              <th>Valor aplicado</th>
                              <th>Desconto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fatura.itens.map((item) => (
                              <tr key={item.id}>
                                <td>#{item.id_venda}</td>
                                <td>{formatDate(item.dt_venda)}</td>
                                <td>{formatCurrency(item.valor_original)}</td>
                                <td>{formatCurrency(item.valor_aplicado)}</td>
                                <td>{formatCurrency(item.desconto_aplicado)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className='col-lg-5'>
                <div className='card border-0 shadow-sm'>
                  <div className='card-body'>
                    <h6 className='text-muted mb-3'>Pagamentos registrados</h6>
                    {fatura.pagamentos.length === 0 ? (
                      <p className='text-muted mb-0'>Nenhum pagamento registrado.</p>
                    ) : (
                      <ul className='list-group list-group-flush'>
                        {fatura.pagamentos.map((pg) => (
                          <li key={pg.id} className='list-group-item px-0'>
                            <div className='d-flex justify-content-between'>
                              <strong>{formatCurrency(pg.valor_pago)}</strong>
                              <span>{formatDate(pg.dt_pagamento)}</span>
                            </div>
                            <div className='d-flex justify-content-between'>
                              <small className='text-muted'>{pg.forma_pagamento}</small>
                              <small className='text-muted'>{pg.usuario_nome || '-'}</small>
                            </div>
                            {pg.observacoes && (
                              <div>
                                <small className='text-muted'>Obs.: {pg.observacoes}</small>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
