'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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
interface AlunoBusca {
  ra: number;
  nome: string;
  turma?: string | null;
  serie?: string | number | null;
  curso_nome?: string | null;
}

export default function ContasAlunosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ra, setRa] = useState('');
  const [termo, setTermo] = useState('');
  const [aluno, setAluno] = useState<AlunoConta | null>(null);
  const [movs, setMovs] = useState<MovimentacaoAluno[]>([]);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('Recarga manual');
  const [busy, setBusy] = useState(false);
  const [sugestoes, setSugestoes] = useState<AlunoBusca[]>([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [fotoDisponivel, setFotoDisponivel] = useState(true);
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

  useEffect(() => {
    setFotoDisponivel(true);
  }, [aluno?.ra]);

  async function buscarPorRa(raParam: string | number) {
    const raStr = String(raParam).trim();
    if (!raStr) return;
    try {
      const res = await fetch(`/api/alunos/contas/${raStr}`);
      const data = await res.json();
      if (data.success) {
        setAluno(data.data as AlunoConta);
        const resMov = await fetch(`/api/alunos/contas/${raStr}/movimentacoes?limit=50`);
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

  // Mantém compatibilidade com chamadas existentes
  async function buscar() {
    if (!ra.trim()) return;
    await buscarPorRa(ra.trim());
  }

  function handleSelectAluno(a: AlunoBusca) {
    setRa(String(a.ra));
    setTermo('');
    setSugestoes([]);
    setShowSugestoes(false);
    buscarPorRa(a.ra);
  }

  function handleSearchClick() {
    const t = termo.trim();
    if (!t) return;
    if (/^\d+$/.test(t)) {
      setRa(t);
      buscarPorRa(t);
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
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [termo]);

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
              <div className='col-md-5'>
                <label className='form-label'>RA ou nome do aluno</label>
                <div className='position-relative'>
                  <input
                    className='form-control'
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    onFocus={() => {
                      if (sugestoes.length > 0) setShowSugestoes(true);
                    }}
                    onBlur={() => {
                      // Pequeno atraso para permitir clique nas sugestões
                      setTimeout(() => setShowSugestoes(false), 150);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchClick();
                    }}
                    placeholder='Digite o RA ou parte do nome'
                  />
                  {showSugestoes && sugestoes.length > 0 && (
                    <div
                      className='list-group position-absolute w-100 shadow-sm'
                      style={{ zIndex: 1000, maxHeight: 260, overflowY: 'auto' }}
                    >
                      {sugestoes.map((s) => (
                        <button
                          type='button'
                          key={s.ra}
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
              <div className='col-md-2'>
                <button className='btn btn-primary w-100' onClick={handleSearchClick}>
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
                    {fotoDisponivel ? (
                      <Image
                        src={`https://sistema.santanna.g12.br/carometr/${aluno.ra}.jpg`}
                        alt='Foto do aluno'
                        width={72}
                        height={72}
                        unoptimized
                        style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }}
                        onError={() => setFotoDisponivel(false)}
                      />
                    ) : (
                      <div
                        className='d-flex align-items-center justify-content-center bg-light text-muted'
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 8,
                          border: '1px solid #eee',
                          fontSize: 12,
                        }}
                      >
                        Sem foto
                      </div>
                    )}
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
