'use client';

import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface Aluno {
  ra: number;
  nome: string;
  turma?: string | null;
  serie?: string | number | null;
  curso_nome?: string | null;
  saldo_atual: number;
  limite_credito: number;
  conta_ativa: number;
}

interface ItemVenda {
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
}

interface Venda {
  id: number;
  dt_venda: string;
  valor_total: number;
  itens: ItemVenda[];
}

interface ConsumoPeriodo {
  periodo: string;
  data_inicio: string;
  data_fim: string;
  total_vendas: number;
  quantidade_itens: number;
  vendas: Venda[];
}

interface MovimentacaoFinanceira {
  id: number;
  tipo_movimentacao: 'CREDITO' | 'DEBITO' | 'ESTORNO';
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  descricao: string;
  dt_movimentacao: string;
  id_venda?: number;
}

interface HistoricoAluno {
  aluno: Aluno;
  consumo_por_periodo: ConsumoPeriodo[];
  movimentacoes_financeiras: MovimentacaoFinanceira[];
}

interface AlunoBusca {
  ra: number;
  nome: string;
  turma?: string | null;
  serie?: string | number | null;
  curso_nome?: string | null;
}

export default function HistoricoAlunoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ra, setRa] = useState('');
  const [termo, setTermo] = useState('');
  const [historico, setHistorico] = useState<HistoricoAluno | null>(null);
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('mes');
  const [busy, setBusy] = useState(false);
  const [sugestoes, setSugestoes] = useState<AlunoBusca[]>([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'consumo' | 'movimentacoes'>('consumo');
  const debounceRef = useRef<number | null>(null);

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

  async function buscarHistorico(raParam: string | number) {
    const raStr = String(raParam).trim();
    if (!raStr) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/alunos/historico/${raStr}?periodo=${periodo}&limit=12`);
      const data = await res.json();
      if (data.success) {
        setHistorico(data.data as HistoricoAluno);
      } else {
        alert(data.error || 'Erro ao buscar histórico');
        setHistorico(null);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao buscar histórico');
      setHistorico(null);
    } finally {
      setBusy(false);
    }
  }

  function handleSelectAluno(a: AlunoBusca) {
    setRa(String(a.ra));
    setTermo('');
    setSugestoes([]);
    setShowSugestoes(false);
    buscarHistorico(a.ra);
  }

  function handleSearchClick() {
    const t = termo.trim();
    if (!t) return;
    if (/^\d+$/.test(t)) {
      setRa(t);
      buscarHistorico(t);
      setShowSugestoes(false);
      setSugestoes([]);
      return;
    }
    if (sugestoes.length === 1) {
      handleSelectAluno(sugestoes[0]);
      return;
    }
    alert('Selecione um aluno na lista de resultados.');
  }

  // Debounce da busca de sugestões por nome/RA
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const t = termo.trim();
    if (!t) {
      setSugestoes([]);
      setShowSugestoes(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/alunos/busca?q=${encodeURIComponent(t)}&limit=15`);
        const data = await res.json();
        if (data.success) {
          setSugestoes(data.data as AlunoBusca[]);
          setShowSugestoes(true);
        } else {
          setSugestoes([]);
          setShowSugestoes(false);
        }
      } catch (e) {
        console.error(e);
        setSugestoes([]);
        setShowSugestoes(false);
      }
    }, 300);
  }, [termo]);

  function formatarPeriodo(periodoStr: string, tipo: 'dia' | 'semana' | 'mes') {
    switch (tipo) {
      case 'dia':
        return new Date(periodoStr).toLocaleDateString('pt-BR');
      case 'semana':
        const [ano, semana] = periodoStr.split('-W');
        return `Semana ${semana} de ${ano}`;
      case 'mes':
        const [anoMes, mes] = periodoStr.split('-');
        const data = new Date(Number(anoMes), Number(mes) - 1);
        return data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
      default:
        return periodoStr;
    }
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  function getTipoMovimentacaoStyle(tipo: string) {
    switch (tipo) {
      case 'CREDITO':
        return 'text-success';
      case 'DEBITO':
        return 'text-danger';
      case 'ESTORNO':
        return 'text-warning';
      default:
        return 'text-dark';
    }
  }

  function getTipoMovimentacaoIcon(tipo: string) {
    switch (tipo) {
      case 'CREDITO':
        return '+';
      case 'DEBITO':
        return '-';
      case 'ESTORNO':
        return '~';
      default:
        return '';
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div
          className='d-flex justify-content-center align-items-center'
          style={{ minHeight: '50vh' }}
        >
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className='container-fluid py-4'>
        <div className='row mb-4'>
          <div className='col-12'>
            <h2 className='mb-4'>
              <i className='bi bi-clock-history me-2'></i>
              Histórico do Aluno
            </h2>
          </div>
        </div>

        {/* Busca de Aluno */}
        <div className='row mb-4'>
          <div className='col-md-8'>
            <div className='card'>
              <div className='card-body'>
                <h5 className='card-title'>Buscar Aluno</h5>
                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label'>RA ou Nome do Aluno</label>
                    <input
                      type='text'
                      className='form-control'
                      value={termo}
                      onChange={(e) => setTermo(e.target.value)}
                      placeholder='Digite RA ou nome...'
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
                    />
                    {showSugestoes && sugestoes.length > 0 && (
                      <div
                        className='list-group position-absolute w-100 mt-1'
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {sugestoes.map((aluno) => (
                          <button
                            key={aluno.ra}
                            type='button'
                            className='list-group-item list-group-item-action'
                            onClick={() => handleSelectAluno(aluno)}
                          >
                            <div className='d-flex justify-content-between'>
                              <span>{aluno.nome}</span>
                              <small className='text-muted'>RA: {aluno.ra}</small>
                            </div>
                            {aluno.turma && (
                              <small className='text-muted d-block'>
                                {aluno.curso_nome} - {aluno.turma}
                              </small>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label'>Agrupar por</label>
                    <select
                      className='form-select'
                      value={periodo}
                      onChange={(e) => setPeriodo(e.target.value as 'dia' | 'semana' | 'mes')}
                    >
                      <option value='dia'>Dia</option>
                      <option value='semana'>Semana</option>
                      <option value='mes'>Mês</option>
                    </select>
                  </div>
                  <div className='col-md-3 d-flex align-items-end'>
                    <button
                      className='btn btn-primary w-100'
                      onClick={handleSearchClick}
                      disabled={busy || !termo.trim()}
                    >
                      {busy ? (
                        <>
                          <span
                            className='spinner-border spinner-border-sm me-2'
                            role='status'
                          ></span>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <i className='bi bi-search me-2'></i>
                          Buscar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Aluno */}
          {historico && (
            <div className='col-md-4'>
              <div className='card'>
                <div className='card-body'>
                  <h5 className='card-title'>Informações do Aluno</h5>
                  <div className='mb-3'>
                    <strong>RA:</strong> {historico.aluno.ra}
                  </div>
                  <div className='mb-3'>
                    <strong>Nome:</strong> {historico.aluno.nome}
                  </div>
                  {historico.aluno.turma && (
                    <div className='mb-3'>
                      <strong>Turma:</strong> {historico.aluno.curso_nome} - {historico.aluno.turma}
                    </div>
                  )}
                  <div className='mb-3'>
                    <strong>Saldo Atual:</strong>
                    <span
                      className={`ms-2 fw-bold ${
                        historico.aluno.saldo_atual >= 0 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {formatarMoeda(historico.aluno.saldo_atual)}
                    </span>
                  </div>
                  <div className='mb-3'>
                    <strong>Limite de Crédito:</strong>
                    <span className='ms-2 text-info'>
                      {formatarMoeda(historico.aluno.limite_credito)}
                    </span>
                  </div>
                  <div>
                    <strong>Status da Conta:</strong>
                    <span
                      className={`ms-2 badge ${
                        historico.aluno.conta_ativa ? 'bg-success' : 'bg-danger'
                      }`}
                    >
                      {historico.aluno.conta_ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo Principal */}
        {historico && (
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-header'>
                  <ul className='nav nav-tabs card-header-tabs'>
                    <li className='nav-item'>
                      <button
                        className={`nav-link ${abaAtiva === 'consumo' ? 'active' : ''}`}
                        onClick={() => setAbaAtiva('consumo')}
                      >
                        <i className='bi bi-cart me-2'></i>
                        Consumo por Período
                      </button>
                    </li>
                    <li className='nav-item'>
                      <button
                        className={`nav-link ${abaAtiva === 'movimentacoes' ? 'active' : ''}`}
                        onClick={() => setAbaAtiva('movimentacoes')}
                      >
                        <i className='bi bi-cash-stack me-2'></i>
                        Movimentações Financeiras
                      </button>
                    </li>
                  </ul>
                </div>
                <div className='card-body'>
                  {abaAtiva === 'consumo' && (
                    <div>
                      <h5 className='mb-3'>
                        Consumo por{' '}
                        {periodo === 'dia' ? 'Dia' : periodo === 'semana' ? 'Semana' : 'Mês'}
                      </h5>
                      {historico.consumo_por_periodo.length === 0 ? (
                        <div className='alert alert-info'>
                          <i className='bi bi-info-circle me-2'></i>
                          Nenhum consumo encontrado para este período.
                        </div>
                      ) : (
                        <div className='accordion' id='consumoAccordion'>
                          {historico.consumo_por_periodo.map((periodoConsumo, index) => (
                            <div key={periodoConsumo.periodo} className='accordion-item'>
                              <h2 className='accordion-header'>
                                <button
                                  className='accordion-button collapsed'
                                  type='button'
                                  data-bs-toggle='collapse'
                                  data-bs-target={`#collapse${index}`}
                                >
                                  <div className='d-flex justify-content-between align-items-center w-100 me-3'>
                                    <span>
                                      <strong>
                                        {formatarPeriodo(periodoConsumo.periodo, periodo)}
                                      </strong>
                                    </span>
                                    <span className='badge bg-primary me-3'>
                                      {periodoConsumo.total_vendas} venda
                                      {periodoConsumo.total_vendas !== 1 ? 's' : ''}
                                    </span>
                                    <span className='text-success fw-bold'>
                                      {formatarMoeda(
                                        periodoConsumo.vendas.reduce(
                                          (sum, v) => sum + v.valor_total,
                                          0
                                        )
                                      )}
                                    </span>
                                  </div>
                                </button>
                              </h2>
                              <div id={`collapse${index}`} className='accordion-collapse collapse'>
                                <div className='accordion-body'>
                                  <div className='table-responsive'>
                                    <table className='table table-sm'>
                                      <thead>
                                        <tr>
                                          <th>Data/Hora</th>
                                          <th>Produtos</th>
                                          <th className='text-end'>Valor</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {periodoConsumo.vendas.map((venda) => (
                                          <tr key={venda.id}>
                                            <td>
                                              {new Date(venda.dt_venda).toLocaleString('pt-BR')}
                                            </td>
                                            <td>
                                              <ul className='list-unstyled mb-0'>
                                                {venda.itens.map((item, idx) => (
                                                  <li key={idx} className='small'>
                                                    {item.quantidade}x {item.produto_nome} (
                                                    {formatarMoeda(item.preco_unitario)})
                                                  </li>
                                                ))}
                                              </ul>
                                            </td>
                                            <td className='text-end fw-bold'>
                                              {formatarMoeda(venda.valor_total)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {abaAtiva === 'movimentacoes' && (
                    <div>
                      <h5 className='mb-3'>Movimentações Financeiras</h5>
                      {historico.movimentacoes_financeiras.length === 0 ? (
                        <div className='alert alert-info'>
                          <i className='bi bi-info-circle me-2'></i>
                          Nenhuma movimentação encontrada.
                        </div>
                      ) : (
                        <div className='table-responsive'>
                          <table className='table table-hover'>
                            <thead>
                              <tr>
                                <th>Data/Hora</th>
                                <th>Tipo</th>
                                <th>Descrição</th>
                                <th className='text-end'>Valor</th>
                                <th className='text-end'>Saldo Anterior</th>
                                <th className='text-end'>Saldo Posterior</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historico.movimentacoes_financeiras.map((mov) => (
                                <tr key={mov.id}>
                                  <td>{new Date(mov.dt_movimentacao).toLocaleString('pt-BR')}</td>
                                  <td>
                                    <span
                                      className={`badge ${getTipoMovimentacaoStyle(
                                        mov.tipo_movimentacao
                                      )}`}
                                    >
                                      {getTipoMovimentacaoIcon(mov.tipo_movimentacao)}{' '}
                                      {mov.tipo_movimentacao}
                                    </span>
                                  </td>
                                  <td>{mov.descricao}</td>
                                  <td
                                    className={`text-end fw-bold ${
                                      mov.tipo_movimentacao === 'DEBITO'
                                        ? 'text-danger'
                                        : mov.tipo_movimentacao === 'CREDITO'
                                        ? 'text-success'
                                        : 'text-warning'
                                    }`}
                                  >
                                    {mov.tipo_movimentacao === 'DEBITO'
                                      ? '-'
                                      : mov.tipo_movimentacao === 'CREDITO'
                                      ? '+'
                                      : '~'}
                                    {formatarMoeda(mov.valor)}
                                  </td>
                                  <td className='text-end'>{formatarMoeda(mov.saldo_anterior)}</td>
                                  <td className='text-end fw-bold'>
                                    {formatarMoeda(mov.saldo_posterior)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
