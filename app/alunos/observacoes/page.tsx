'use client';

import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../../components/MainLayout';

type TipoObs = 'MEDICA' | 'ALIMENTAR' | 'COMPORTAMENTAL' | 'GERAL';
type PrioridadeObs = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface AlunoBusca {
  ra: number;
  nome: string;
  turma?: string | null;
  serie?: string | number | null;
  curso_nome?: string | null;
}

interface Observacao {
  id: number;
  ra_aluno: number;
  tipo_observacao: TipoObs;
  observacao: string;
  prioridade: PrioridadeObs;
  dt_validade: string | null;
  dt_validade_formatada: string | null;
  expirada: boolean;
  dias_restantes: number | null;
  destaque: boolean;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
  criado_por: number | null;
  criado_por_nome: string | null;
}

interface NovaObservacaoPayload {
  tipo_observacao: TipoObs;
  prioridade: PrioridadeObs;
  dt_validade: string | null;
  observacao: string;
}

interface AtualizarObservacaoPayload {
  tipo_observacao: TipoObs;
  prioridade: PrioridadeObs;
  observacao: string;
  ativo: number;
  dt_validade: string | null;
}

const TIPOS_OPTIONS: { value: TipoObs; label: string }[] = [
  { value: 'MEDICA', label: 'Médica' },
  { value: 'ALIMENTAR', label: 'Alimentar' },
  { value: 'COMPORTAMENTAL', label: 'Comportamental' },
  { value: 'GERAL', label: 'Geral' },
];

const PRIORIDADES_OPTIONS: { value: PrioridadeObs; label: string }[] = [
  { value: 'CRITICA', label: 'Crítica' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'BAIXA', label: 'Baixa' },
];

export default function ObservacoesAlunosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [termo, setTermo] = useState('');
  const [sugestoes, setSugestoes] = useState<AlunoBusca[]>([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [aluno, setAluno] = useState<AlunoBusca | null>(null);
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<'ativos' | 'inativos' | 'todos'>('ativos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<PrioridadeObs | 'todas'>('todas');
  const [tipoNova, setTipoNova] = useState<TipoObs>('MEDICA');
  const [prioridadeNova, setPrioridadeNova] = useState<PrioridadeObs>('MEDIA');
  const [validadeNova, setValidadeNova] = useState('');
  const [textoNovo, setTextoNovo] = useState('');
  const [busyCriar, setBusyCriar] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    tipo_observacao: TipoObs;
    prioridade: PrioridadeObs;
    dt_validade: string;
    observacao: string;
    ativo: number;
  } | null>(null);
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
      } catch (e) {
        console.error(e);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

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
        const res = await fetch(`/api/alunos/busca?q=${encodeURIComponent(t)}&limit=12`);
        const data = await res.json();
        if (data.success) {
          setSugestoes(data.data);
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
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [termo]);

  async function carregarObservacoes(ra: number) {
    const params = new URLSearchParams();
    if (filtroAtivo === 'ativos') params.set('ativo', '1');
    if (filtroAtivo === 'inativos') params.set('ativo', '0');
    if (filtroPrioridade !== 'todas') params.set('prioridade', filtroPrioridade);
    const res = await fetch(`/api/alunos/observacoes/${ra}?${params.toString()}`);
    const data = await res.json();
    if (data.success) setObservacoes(data.data);
  }

  function handleSelectAluno(a: AlunoBusca) {
    setAluno(a);
    setTermo(`${a.nome} (RA ${a.ra})`);
    setShowSugestoes(false);
    setSugestoes([]);
    carregarObservacoes(a.ra);
  }

  async function criarObservacao() {
    if (!aluno) return;
    if (!textoNovo.trim()) {
      alert('Informe a observação.');
      return;
    }
    setBusyCriar(true);
    try {
      const payload: NovaObservacaoPayload = {
        tipo_observacao: tipoNova,
        prioridade: prioridadeNova,
        dt_validade: validadeNova || null,
        observacao: textoNovo.trim(),
      };
      const res = await fetch(`/api/alunos/observacoes/${aluno.ra}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setTextoNovo('');
        setValidadeNova('');
        setPrioridadeNova('MEDIA');
        await carregarObservacoes(aluno.ra);
      } else {
        alert(data.error || 'Erro ao registrar observação');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao registrar observação');
    } finally {
      setBusyCriar(false);
    }
  }

  function abrirEdicao(obs: Observacao) {
    setEditandoId(obs.id);
    setEditForm({
      tipo_observacao: obs.tipo_observacao,
      prioridade: obs.prioridade,
      dt_validade: obs.dt_validade_formatada || '',
      observacao: obs.observacao,
      ativo: obs.ativo,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditForm(null);
  }

  async function salvarEdicao() {
    if (!aluno || editandoId === null || !editForm) return;
    if (!editForm.observacao.trim()) {
      alert('Observação não pode ficar vazia.');
      return;
    }
    try {
      const payload: AtualizarObservacaoPayload = {
        tipo_observacao: editForm.tipo_observacao,
        prioridade: editForm.prioridade,
        observacao: editForm.observacao.trim(),
        ativo: editForm.ativo ? 1 : 0,
        dt_validade: editForm.dt_validade === '' ? null : editForm.dt_validade,
      };

      const res = await fetch(`/api/alunos/observacoes/${aluno.ra}/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await carregarObservacoes(aluno.ra);
        cancelarEdicao();
      } else {
        alert(data.error || 'Erro ao atualizar observação');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar observação');
    }
  }

  async function toggleAtivo(obs: Observacao) {
    if (!aluno) return;
    try {
      const res = await fetch(`/api/alunos/observacoes/${aluno.ra}/${obs.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: obs.ativo ? 0 : 1 }),
      });
      const data = await res.json();
      if (data.success) await carregarObservacoes(aluno.ra);
      else alert(data.error || 'Erro ao atualizar status');
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar status');
    }
  }

  useEffect(() => {
    if (aluno) carregarObservacoes(aluno.ra);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroAtivo, filtroPrioridade]);

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
            <div className='row g-3 align-items-end'>
              <div className='col-md-6'>
                <label className='form-label'>RA ou nome do aluno</label>
                <div className='position-relative'>
                  <input
                    className='form-control'
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    onFocus={() => sugestoes.length > 0 && setShowSugestoes(true)}
                    onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
                    placeholder='Digite o RA ou parte do nome'
                  />
                  {showSugestoes && sugestoes.length > 0 && (
                    <div
                      className='list-group position-absolute w-100 shadow-sm'
                      style={{ zIndex: 1000, maxHeight: 260, overflowY: 'auto' }}
                    >
                      {sugestoes.map((s) => (
                        <button
                          key={s.ra}
                          type='button'
                          className='list-group-item list-group-item-action'
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectAluno(s)}
                        >
                          <div className='d-flex justify-content-between'>
                            <span>{s.nome}</span>
                            <small className='text-muted'>RA {s.ra}</small>
                          </div>
                          <small className='text-muted'>
                            {s.serie ?? '-'} {s.turma ?? ''}{' '}
                            {s.curso_nome ? `• ${s.curso_nome}` : ''}
                          </small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className='col-md-6 d-flex gap-2 align-items-end flex-wrap'>
                <div>
                  <label className='form-label'>Status</label>
                  <select
                    className='form-select'
                    value={filtroAtivo}
                    onChange={(e) =>
                      setFiltroAtivo(e.target.value as 'ativos' | 'inativos' | 'todos')
                    }
                  >
                    <option value='ativos'>Apenas ativas</option>
                    <option value='inativos'>Apenas inativas</option>
                    <option value='todos'>Todas</option>
                  </select>
                </div>
                <div>
                  <label className='form-label'>Prioridade</label>
                  <select
                    className='form-select'
                    value={filtroPrioridade}
                    onChange={(e) => setFiltroPrioridade(e.target.value as PrioridadeObs | 'todas')}
                  >
                    <option value='todas'>Todas</option>
                    {PRIORIDADES_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  <h6 className='mb-3'>Registrar nova observação</h6>
                  <div className='mb-2'>
                    <label className='form-label'>Tipo</label>
                    <select
                      className='form-select'
                      value={tipoNova}
                      onChange={(e) => setTipoNova(e.target.value as TipoObs)}
                    >
                      {TIPOS_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='mb-2'>
                    <label className='form-label'>Prioridade</label>
                    <select
                      className='form-select'
                      value={prioridadeNova}
                      onChange={(e) => setPrioridadeNova(e.target.value as PrioridadeObs)}
                    >
                      {PRIORIDADES_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='mb-2'>
                    <label className='form-label'>Validade (opcional)</label>
                    <input
                      type='date'
                      className='form-control'
                      value={validadeNova}
                      onChange={(e) => setValidadeNova(e.target.value)}
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Observação</label>
                    <textarea
                      className='form-control'
                      rows={4}
                      value={textoNovo}
                      onChange={(e) => setTextoNovo(e.target.value)}
                    />
                  </div>
                  <button
                    className='btn btn-primary w-100'
                    disabled={busyCriar || !textoNovo.trim()}
                    onClick={criarObservacao}
                  >
                    {busyCriar ? 'Salvando...' : 'Adicionar observação'}
                  </button>
                </div>
              </div>
            </div>
            <div className='col-lg-8'>
              <div className='card border-0 shadow-sm h-100'>
                <div className='card-body d-flex flex-column'>
                  <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h5 className='mb-0'>Observações cadastradas</h5>
                    <small className='text-muted'>Total: {observacoes.length}</small>
                  </div>
                  <div className='table-responsive' style={{ maxHeight: 520 }}>
                    <table className='table table-sm align-middle'>
                      <thead className='table-light position-sticky top-0'>
                        <tr>
                          <th>ID</th>
                          <th>Tipo</th>
                          <th>Prioridade</th>
                          <th>Validade</th>
                          <th>Observação</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {observacoes.length === 0 && (
                          <tr>
                            <td colSpan={7} className='text-center text-muted py-4'>
                              Nenhuma observação encontrada.
                            </td>
                          </tr>
                        )}
                        {observacoes.map((obs) => {
                          const emEdicao = editandoId === obs.id;
                          const prioridadeBadge =
                            obs.prioridade === 'CRITICA'
                              ? 'bg-danger'
                              : obs.prioridade === 'ALTA'
                              ? 'bg-warning text-dark'
                              : obs.prioridade === 'MEDIA'
                              ? 'bg-primary'
                              : 'bg-secondary';
                          const linhaClasse = obs.destaque
                            ? obs.expirada
                              ? 'table-danger'
                              : 'table-warning'
                            : '';
                          return (
                            <tr key={obs.id} className={linhaClasse}>
                              <td>{obs.id}</td>
                              <td>
                                {TIPOS_OPTIONS.find((t) => t.value === obs.tipo_observacao)
                                  ?.label ?? obs.tipo_observacao}
                              </td>
                              <td>
                                <span className={`badge ${prioridadeBadge}`}>{obs.prioridade}</span>
                              </td>
                              <td>
                                {obs.dt_validade_formatada ? (
                                  <>
                                    {obs.dt_validade_formatada}
                                    {obs.expirada && (
                                      <span className='badge bg-danger ms-1'>Vencida</span>
                                    )}
                                    {!obs.expirada && obs.dias_restantes !== null && (
                                      <span className='badge bg-info text-dark ms-1'>
                                        {obs.dias_restantes === 0
                                          ? 'Expira hoje'
                                          : `${obs.dias_restantes} dia(s)`}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className='text-muted'>Sem validade</span>
                                )}
                              </td>
                              <td style={{ maxWidth: 260 }}>
                                {emEdicao ? (
                                  <textarea
                                    className='form-control'
                                    rows={3}
                                    value={editForm?.observacao ?? ''}
                                    onChange={(e) =>
                                      setEditForm((prev) =>
                                        prev ? { ...prev, observacao: e.target.value } : prev
                                      )
                                    }
                                  />
                                ) : (
                                  <span>{obs.observacao}</span>
                                )}
                                <div className='small text-muted mt-1'>
                                  Criado em {new Date(obs.dt_criacao).toLocaleString('pt-BR')}
                                  {obs.criado_por_nome ? ` por ${obs.criado_por_nome}` : ''}
                                </div>
                              </td>
                              <td>
                                <span
                                  className={obs.ativo ? 'badge bg-success' : 'badge bg-secondary'}
                                >
                                  {obs.ativo ? 'Ativa' : 'Inativa'}
                                </span>
                              </td>
                              <td style={{ width: 160 }}>
                                {emEdicao ? (
                                  <div className='d-flex flex-column gap-1'>
                                    <div className='d-flex gap-2'>
                                      <select
                                        className='form-select form-select-sm'
                                        value={editForm?.tipo_observacao}
                                        onChange={(e) =>
                                          setEditForm((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  tipo_observacao: e.target.value as TipoObs,
                                                }
                                              : prev
                                          )
                                        }
                                      >
                                        {TIPOS_OPTIONS.map((t) => (
                                          <option key={t.value} value={t.value}>
                                            {t.label}
                                          </option>
                                        ))}
                                      </select>
                                      <select
                                        className='form-select form-select-sm'
                                        value={editForm?.prioridade}
                                        onChange={(e) =>
                                          setEditForm((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  prioridade: e.target.value as PrioridadeObs,
                                                }
                                              : prev
                                          )
                                        }
                                      >
                                        {PRIORIDADES_OPTIONS.map((p) => (
                                          <option key={p.value} value={p.value}>
                                            {p.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <input
                                      type='date'
                                      className='form-control form-control-sm'
                                      value={editForm?.dt_validade ?? ''}
                                      onChange={(e) =>
                                        setEditForm((prev) =>
                                          prev ? { ...prev, dt_validade: e.target.value } : prev
                                        )
                                      }
                                    />
                                    <div className='form-check'>
                                      <input
                                        id={`chk-ativo-${obs.id}`}
                                        className='form-check-input'
                                        type='checkbox'
                                        checked={(editForm?.ativo ?? 0) === 1}
                                        onChange={(e) =>
                                          setEditForm((prev) =>
                                            prev
                                              ? { ...prev, ativo: e.target.checked ? 1 : 0 }
                                              : prev
                                          )
                                        }
                                      />
                                      <label
                                        className='form-check-label'
                                        htmlFor={`chk-ativo-${obs.id}`}
                                      >
                                        Ativa
                                      </label>
                                    </div>
                                    <div className='d-flex gap-2'>
                                      <button
                                        className='btn btn-sm btn-success w-100'
                                        onClick={salvarEdicao}
                                      >
                                        Salvar
                                      </button>
                                      <button
                                        className='btn btn-sm btn-outline-secondary w-100'
                                        onClick={cancelarEdicao}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className='d-flex flex-column gap-2'>
                                    <button
                                      className='btn btn-sm btn-outline-primary'
                                      onClick={() => abrirEdicao(obs)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      className={`btn btn-sm ${
                                        obs.ativo ? 'btn-outline-danger' : 'btn-outline-success'
                                      }`}
                                      onClick={() => toggleAtivo(obs)}
                                    >
                                      {obs.ativo ? 'Desativar' : 'Reativar'}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
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
