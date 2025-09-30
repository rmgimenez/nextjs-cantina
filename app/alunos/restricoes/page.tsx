'use client';

import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../../components/MainLayout';

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
interface Restricao {
  id: number;
  ra_aluno: number;
  tipo_restricao: 'PRODUTO' | 'TIPO_PRODUTO';
  id_produto: number | null;
  id_tipo_produto: number | null;
  motivo: string | null;
  ativo: number;
  dt_criacao: string;
  produto_nome?: string | null;
  tipo_produto_nome?: string | null;
}
interface ProdutoOp {
  id: number;
  nome: string;
  id_tipo: number;
  tipo_nome: string;
}
interface TipoProdutoOp {
  id: number;
  nome: string;
}

export default function RestricoesAlunosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [termo, setTermo] = useState('');
  const [sugestoes, setSugestoes] = useState<AlunoBusca[]>([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [aluno, setAluno] = useState<AlunoBusca | null>(null);
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [tipoNova, setTipoNova] = useState<'PRODUTO' | 'TIPO_PRODUTO'>('PRODUTO');
  const [produtoSel, setProdutoSel] = useState<string>('');
  const [tipoSel, setTipoSel] = useState<string>('');
  const [motivo, setMotivo] = useState('');
  const [produtos, setProdutos] = useState<ProdutoOp[]>([]);
  const [tipos, setTipos] = useState<TipoProdutoOp[]>([]);
  const [busy, setBusy] = useState(false);
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

  // Carregar combos básicos (produtos e tipos)
  useEffect(() => {
    async function loadCombos() {
      try {
        const [resP, resT] = await Promise.all([
          fetch('/api/produtos?ativo=1'),
          fetch('/api/tipos-produtos?ativo=1'),
        ]);
        const [dataP, dataT] = await Promise.all([resP.json(), resT.json()]);
        if (dataP.success) setProdutos(dataP.data);
        if (dataT.success) setTipos(dataT.data);
      } catch (e) {
        console.error('Erro ao carregar combos:', e);
      }
    }
    if (user) loadCombos();
  }, [user]);

  // Busca de sugestões por RA/nome
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

  async function carregarRestricoes(ra: number) {
    const params = new URLSearchParams();
    if (filtroAtivo === 'ativos') params.set('ativo', '1');
    if (filtroAtivo === 'inativos') params.set('ativo', '0');
    const res = await fetch(`/api/alunos/restricoes/${ra}?${params}`);
    const data = await res.json();
    if (data.success) setRestricoes(data.data);
  }

  function handleSelectAluno(a: AlunoBusca) {
    setAluno(a);
    setTermo(`${a.nome} (RA ${a.ra})`);
    setShowSugestoes(false);
    setSugestoes([]);
    carregarRestricoes(a.ra);
  }

  async function adicionarRestricao() {
    if (!aluno) return;
    setBusy(true);
    try {
      const payload: {
        tipo_restricao: string;
        motivo: string | null;
        id_produto?: number;
        id_tipo_produto?: number;
      } = { tipo_restricao: tipoNova, motivo: motivo?.trim() || null };
      if (tipoNova === 'PRODUTO') payload.id_produto = Number(produtoSel) || undefined;
      else payload.id_tipo_produto = Number(tipoSel) || undefined;

      const res = await fetch(`/api/alunos/restricoes/${aluno.ra}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMotivo('');
        setProdutoSel('');
        setTipoSel('');
        await carregarRestricoes(aluno.ra);
      } else {
        alert(data.error || 'Erro ao criar restrição');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao criar restrição');
    } finally {
      setBusy(false);
    }
  }

  async function toggleAtivo(r: Restricao) {
    if (!aluno) return;
    try {
      const res = await fetch(`/api/alunos/restricoes/${aluno.ra}/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: r.ativo ? 0 : 1 }),
      });
      const data = await res.json();
      if (data.success) await carregarRestricoes(aluno.ra);
      else alert(data.error || 'Erro ao atualizar');
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar');
    }
  }

  async function atualizarMotivo(r: Restricao, novoMotivo: string) {
    if (!aluno) return;
    try {
      const res = await fetch(`/api/alunos/restricoes/${aluno.ra}/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: novoMotivo }),
      });
      const data = await res.json();
      if (data.success) await carregarRestricoes(aluno.ra);
      else alert(data.error || 'Erro ao atualizar');
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar');
    }
  }

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
              <div className='col-md-6 d-flex align-items-end gap-2'>
                <div>
                  <label className='form-label'>Filtro</label>
                  <select
                    className='form-select'
                    value={filtroAtivo}
                    onChange={async (e) => {
                      const v = e.target.value as 'todos' | 'ativos' | 'inativos';
                      setFiltroAtivo(v);
                      if (aluno) await carregarRestricoes(aluno.ra);
                    }}
                  >
                    <option value='ativos'>Apenas ativas</option>
                    <option value='inativos'>Apenas inativas</option>
                    <option value='todos'>Todas</option>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  <h6 className='mb-3'>Nova restrição</h6>
                  <div className='mb-2'>
                    <div className='btn-group' role='group'>
                      <input
                        type='radio'
                        className='btn-check'
                        id='opt-prod'
                        checked={tipoNova === 'PRODUTO'}
                        onChange={() => setTipoNova('PRODUTO')}
                      />
                      <label htmlFor='opt-prod' className='btn btn-outline-primary'>
                        Por produto
                      </label>
                      <input
                        type='radio'
                        className='btn-check'
                        id='opt-tipo'
                        checked={tipoNova === 'TIPO_PRODUTO'}
                        onChange={() => setTipoNova('TIPO_PRODUTO')}
                      />
                      <label htmlFor='opt-tipo' className='btn btn-outline-primary'>
                        Por tipo
                      </label>
                    </div>
                  </div>
                  {tipoNova === 'PRODUTO' ? (
                    <div className='mb-2'>
                      <label className='form-label'>Produto</label>
                      <select
                        className='form-select'
                        value={produtoSel}
                        onChange={(e) => setProdutoSel(e.target.value)}
                      >
                        <option value=''>Selecione...</option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} • {p.tipo_nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className='mb-2'>
                      <label className='form-label'>Tipo de produto</label>
                      <select
                        className='form-select'
                        value={tipoSel}
                        onChange={(e) => setTipoSel(e.target.value)}
                      >
                        <option value=''>Selecione...</option>
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className='mb-2'>
                    <label className='form-label'>Motivo (opcional)</label>
                    <input
                      className='form-control'
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                    />
                  </div>
                  <button
                    className='btn btn-primary'
                    disabled={
                      busy ||
                      (!produtoSel && tipoNova === 'PRODUTO') ||
                      (!tipoSel && tipoNova === 'TIPO_PRODUTO')
                    }
                    onClick={adicionarRestricao}
                  >
                    {busy ? 'Adicionando...' : 'Adicionar restrição'}
                  </button>
                </div>
              </div>
            </div>
            <div className='col-lg-8'>
              <div className='card border-0 shadow-sm h-100'>
                <div className='card-body'>
                  <h5 className='mb-3'>Restrições</h5>
                  <div className='table-responsive' style={{ maxHeight: 480 }}>
                    <table className='table table-sm align-middle'>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tipo</th>
                          <th>Referência</th>
                          <th>Motivo</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restricoes.map((r) => (
                          <tr key={r.id}>
                            <td>#{r.id}</td>
                            <td>
                              {r.tipo_restricao === 'PRODUTO' ? 'Produto' : 'Tipo de produto'}
                            </td>
                            <td>
                              {r.tipo_restricao === 'PRODUTO'
                                ? r.produto_nome || `#${r.id_produto}`
                                : r.tipo_produto_nome || `#${r.id_tipo_produto}`}
                            </td>
                            <td style={{ minWidth: 220 }}>
                              <input
                                className='form-control form-control-sm'
                                defaultValue={r.motivo || ''}
                                onBlur={(e) => {
                                  const novo = e.currentTarget.value;
                                  if (novo !== (r.motivo || '')) atualizarMotivo(r, novo);
                                }}
                              />
                            </td>
                            <td>
                              <span className={`badge ${r.ativo ? 'bg-success' : 'bg-secondary'}`}>
                                {r.ativo ? 'Ativa' : 'Inativa'}
                              </span>
                            </td>
                            <td>
                              <div className='btn-group btn-group-sm'>
                                <button
                                  className={`btn ${
                                    r.ativo ? 'btn-outline-warning' : 'btn-outline-success'
                                  }`}
                                  onClick={() => toggleAtivo(r)}
                                >
                                  {r.ativo ? 'Desativar' : 'Ativar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {restricoes.length === 0 && (
                          <tr>
                            <td colSpan={6} className='text-muted'>
                              Nenhuma restrição encontrada
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
