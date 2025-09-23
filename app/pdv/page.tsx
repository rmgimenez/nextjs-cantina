'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';

interface User {
  id: number;
  nome: string;
  perfil: number;
}
interface Produto {
  id: number;
  nome: string;
  preco_venda: number;
  por_quilo: number;
  tipo_nome: string;
}
interface AlunoConta {
  ra: number;
  nome: string;
  saldo_atual?: number;
}
interface Funcionario {
  codigo: number;
  nome: string;
  cargo?: string;
}
interface ItemCarrinho {
  id_produto: number;
  quantidade?: number;
  peso?: number;
}

export default function PDVPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [ra, setRa] = useState('');
  const [aluno, setAluno] = useState<AlunoConta | null>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [msg, setMsg] = useState<string>('');
  const [statusCaixa, setStatusCaixa] = useState<{
    aberto: boolean;
    caixa?: { id: number; dt_abertura: string; valor_inicial: number };
    totais?: { suprimentos: number; sangrias: number; vendas_dinheiro: number; esperado: number };
  } | null>(null);

  // Novo: tipo de cliente e buscas por nome
  const [tipoCliente, setTipoCliente] = useState<'ALUNO' | 'FUNCIONARIO' | 'GERAL'>('ALUNO');
  const [buscaAluno, setBuscaAluno] = useState('');
  const [sugestoesAlunos, setSugestoesAlunos] = useState<AlunoConta[]>([]);
  const [buscaFunc, setBuscaFunc] = useState('');
  const [sugestoesFunc, setSugestoesFunc] = useState<Funcionario[]>([]);
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<
    'SALDO' | 'DINHEIRO' | 'CARTAO' | 'CONTA_FUNCIONARIO'
  >('SALDO');

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
      setCarregando(false);
    }
    checkAuth();
  }, [router]);

  // Carregar status do caixa e redirecionar se fechado
  useEffect(() => {
    async function loadStatus() {
      try {
        const r = await fetch('/api/caixa/status');
        if (r.status === 401) return; // já redirecionado pelo checkAuth
        const d = await r.json();
        const st = d?.data || { aberto: false };
        setStatusCaixa(st);
        if (!st.aberto) {
          // redirecionar para abertura do caixa
          router.push('/caixa');
        }
      } catch {}
    }
    if (user) loadStatus();
  }, [user, router]);

  useEffect(() => {
    fetch(`/api/produtos?ativo=1`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) setProdutos(d.data);
      })
      .catch(() => {});
  }, []);

  // Busca de alunos por nome/RA
  useEffect(() => {
    let ignore = false;
    async function run() {
      if (tipoCliente !== 'ALUNO') return;
      const q = buscaAluno.trim();
      if (!q || q.length < 2) {
        setSugestoesAlunos([]);
        return;
      }
      const res = await fetch(`/api/alunos/busca?q=${encodeURIComponent(q)}&limit=10`);
      const d = await res.json();
      if (!ignore) setSugestoesAlunos(d?.data || []);
    }
    run();
    return () => {
      ignore = true;
    };
  }, [buscaAluno, tipoCliente]);

  // Busca de funcionários por nome/código
  useEffect(() => {
    let ignore = false;
    async function run() {
      if (tipoCliente !== 'FUNCIONARIO') return;
      const q = buscaFunc.trim();
      if (!q || q.length < 2) {
        setSugestoesFunc([]);
        return;
      }
      const res = await fetch(`/api/funcionarios/busca?q=${encodeURIComponent(q)}&limit=10`);
      const d = await res.json();
      if (!ignore) setSugestoesFunc(d?.data || []);
    }
    run();
    return () => {
      ignore = true;
    };
  }, [buscaFunc, tipoCliente]);

  const total = useMemo(() => {
    return itens.reduce((acc, it) => {
      const p = produtos.find((pr) => pr.id === it.id_produto);
      if (!p) return acc;
      if (p.por_quilo) return acc + p.preco_venda * (Number(it.peso) || 0);
      return acc + p.preco_venda * (Number(it.quantidade) || 0);
    }, 0);
  }, [itens, produtos]);

  async function buscarAluno() {
    setAluno(null);
    setSaldo(0);
    setMsg('');
    if (!ra) return;
    const res = await fetch(`/api/alunos/contas/${encodeURIComponent(ra)}`);
    const d = await res.json();
    if (d?.data) {
      setAluno(d.data);
      setSaldo(Number(d.data.saldo_atual || 0));
    } else {
      setMsg(d?.error || 'Aluno não encontrado');
    }
  }

  async function selecionarAluno(a: AlunoConta) {
    try {
      const res = await fetch(`/api/alunos/contas/${encodeURIComponent(String(a.ra))}`);
      const d = await res.json();
      if (d?.data) {
        setAluno(d.data);
        setSaldo(Number(d.data.saldo_atual || 0));
      } else {
        setAluno({ ra: a.ra, nome: a.nome });
      }
    } catch {
      setAluno({ ra: a.ra, nome: a.nome });
    }
    setRa(String(a.ra));
    setSugestoesAlunos([]);
    setBuscaAluno('');
  }

  function selecionarFuncionario(f: Funcionario) {
    setFuncionario(f);
    setSugestoesFunc([]);
    setBuscaFunc('');
  }

  function addItem(p: Produto) {
    setItens((cur) => {
      const existente = cur.find((i) => i.id_produto === p.id);
      if (existente) {
        if (p.por_quilo) return cur; // controlar por input de peso
        return cur.map((i) =>
          i.id_produto === p.id ? { ...i, quantidade: Number(i.quantidade || 0) + 1 } : i
        );
      }
      return [
        ...cur,
        { id_produto: p.id, quantidade: p.por_quilo ? 1 : 1, peso: p.por_quilo ? 0.1 : undefined },
      ];
    });
  }

  function updateItem(id_produto: number, field: 'quantidade' | 'peso', value: string) {
    setItens((cur) =>
      cur.map((i) =>
        i.id_produto === id_produto
          ? { ...i, [field]: field === 'quantidade' ? Number(value) : Number(value) }
          : i
      )
    );
  }

  function removerItem(id_produto: number) {
    setItens((cur) => cur.filter((i) => i.id_produto !== id_produto));
  }

  async function finalizarVenda() {
    setMsg('');
    if (itens.length === 0) {
      setMsg('Adicione itens');
      return;
    }
    let payload: any = {
      tipo_cliente: tipoCliente,
      forma_pagamento: formaPagamento,
      itens: itens.map((i) => ({
        id_produto: i.id_produto,
        quantidade: Number(i.quantidade || 1),
        peso: i.peso ? Number(i.peso) : undefined,
      })),
    };
    if (tipoCliente === 'ALUNO') {
      if (!aluno) {
        setMsg('Selecione um aluno');
        return;
      }
      payload.ra_aluno = Number(aluno.ra);
      payload.forma_pagamento = 'SALDO';
    } else if (tipoCliente === 'FUNCIONARIO') {
      if (!funcionario) {
        setMsg('Selecione um funcionário');
        return;
      }
      if (formaPagamento === 'SALDO') {
        setMsg('Funcionário não utiliza SALDO');
        return;
      }
      payload.codigo_funcionario = Number(funcionario.codigo);
      // padrão: conta do funcionário; permite dinheiro/cartão também
      if (!['CONTA_FUNCIONARIO', 'DINHEIRO', 'CARTAO'].includes(formaPagamento)) {
        setMsg('Forma de pagamento inválida');
        return;
      }
    } else {
      // GERAL
      if (!['DINHEIRO', 'CARTAO'].includes(formaPagamento)) {
        setMsg('Cliente geral: use DINHEIRO ou CARTAO');
        return;
      }
    }
    const res = await fetch('/api/pdv/venda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg(`Venda ${d.data.id_venda} concluída`);
      setItens([]);
      // atualizar saldo se aluno
      if (tipoCliente === 'ALUNO') buscarAluno();
    } else {
      setMsg(d?.error || 'Erro ao finalizar venda');
    }
  }

  if (carregando) return <div className='container py-4'>Verificando autenticação...</div>;
  if (!user) return null;

  return (
    <MainLayout>
      <div>
        {/* Status do Caixa */}
        {statusCaixa && (
          <div
            className={`alert ${
              statusCaixa.aberto ? 'alert-success' : 'alert-warning'
            } d-flex justify-content-between align-items-center mb-3`}
          >
            <div>
              <strong>Caixa: {statusCaixa.aberto ? 'ABERTO' : 'FECHADO'}</strong>
              {statusCaixa.aberto && (
                <>
                  {' '}
                  <span className='ms-2'>
                    Esperado: R$ {Number(statusCaixa?.totais?.esperado || 0).toFixed(2)}
                  </span>
                </>
              )}
            </div>
            <a
              className='btn btn-sm btn-outline-primary'
              href='/caixa'
              target='_self'
              rel='noopener'
            >
              Ir para o Caixa
            </a>
          </div>
        )}
        {msg && <div className='alert alert-info mb-3'>{msg}</div>}
        <div className='row g-3'>
          <div className='col-12'>
            <div className='card mb-2'>
              <div className='card-body d-flex flex-wrap gap-2 align-items-center'>
                <div className='me-3'>
                  <label className='form-label mb-0 me-2'>Tipo de cliente</label>
                  <select
                    className='form-select d-inline-block w-auto'
                    value={tipoCliente}
                    onChange={(e) => {
                      const novo = e.target.value as 'ALUNO' | 'FUNCIONARIO' | 'GERAL';
                      setTipoCliente(novo);
                      setAluno(null);
                      setFuncionario(null);
                      setMsg('');
                      setFormaPagamento(
                        novo === 'ALUNO'
                          ? 'SALDO'
                          : novo === 'FUNCIONARIO'
                          ? 'CONTA_FUNCIONARIO'
                          : 'DINHEIRO'
                      );
                    }}
                  >
                    <option value='ALUNO'>Aluno</option>
                    <option value='FUNCIONARIO'>Funcionário</option>
                    <option value='GERAL'>Geral</option>
                  </select>
                </div>
                <div>
                  <label className='form-label mb-0 me-2'>Pagamento</label>
                  <select
                    className='form-select d-inline-block w-auto'
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value as any)}
                    disabled={tipoCliente === 'FUNCIONARIO'}
                  >
                    {tipoCliente === 'ALUNO' && <option value='SALDO'>Saldo do aluno</option>}
                    {tipoCliente === 'FUNCIONARIO' && (
                      <option value='CONTA_FUNCIONARIO'>Conta do funcionário</option>
                    )}
                    {tipoCliente === 'GERAL' && (
                      <>
                        <option value='DINHEIRO'>Dinheiro</option>
                        <option value='CARTAO'>Cartão</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='card'>
              <div className='card-body'>
                <h5>Identificação</h5>
                {tipoCliente === 'ALUNO' && (
                  <>
                    <div className='input-group mb-2'>
                      <input
                        className='form-control'
                        placeholder='RA do aluno'
                        value={ra}
                        onChange={(e) => setRa(e.target.value)}
                      />
                      <button className='btn btn-primary' onClick={buscarAluno}>
                        Buscar
                      </button>
                    </div>
                    <input
                      className='form-control mb-2'
                      placeholder='Buscar aluno por nome ou RA'
                      value={buscaAluno}
                      onChange={(e) => setBuscaAluno(e.target.value)}
                    />
                    {sugestoesAlunos.length > 0 && (
                      <div
                        className='list-group mb-2'
                        style={{ maxHeight: 150, overflowY: 'auto' }}
                      >
                        {sugestoesAlunos.map((a) => (
                          <button
                            key={a.ra}
                            className='list-group-item list-group-item-action'
                            onClick={() => selecionarAluno(a)}
                          >
                            {a.nome} (RA {a.ra})
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {tipoCliente === 'FUNCIONARIO' && (
                  <>
                    <input
                      className='form-control mb-2'
                      placeholder='Buscar funcionário por nome ou código'
                      value={buscaFunc}
                      onChange={(e) => setBuscaFunc(e.target.value)}
                    />
                    {sugestoesFunc.length > 0 && (
                      <div
                        className='list-group mb-2'
                        style={{ maxHeight: 150, overflowY: 'auto' }}
                      >
                        {sugestoesFunc.map((f) => (
                          <button
                            key={f.codigo}
                            className='list-group-item list-group-item-action'
                            onClick={() => selecionarFuncionario(f)}
                          >
                            {f.nome} (cód. {f.codigo}) {f.cargo ? `- ${f.cargo}` : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {aluno && tipoCliente === 'ALUNO' && (
                  <div>
                    <div>
                      <strong>{aluno.nome}</strong>
                    </div>
                    <div>Saldo: R$ {Number(saldo).toFixed(2)}</div>
                    <div className='mt-2'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://sistema.santanna.g12.br/carometr/${aluno.ra}.jpg`}
                        alt='Foto'
                        width={120}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                {funcionario && tipoCliente === 'FUNCIONARIO' && (
                  <div>
                    <div>
                      <strong>{funcionario.nome}</strong>
                    </div>
                    <div>Código: {funcionario.codigo}</div>
                    {funcionario.cargo && <div>Cargo: {funcionario.cargo}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='card'>
              <div className='card-body'>
                <h5>Produtos</h5>
                <input
                  className='form-control mb-2'
                  placeholder='Buscar produto por nome ou código de barras'
                  value={busca}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setBusca(val);
                    // Busca dinâmica simples (debounce leve pode ser adicionado)
                    const q = val.trim();
                    if (q.length >= 2) {
                      try {
                        const r = await fetch(`/api/produtos?q=${encodeURIComponent(q)}&ativo=1`);
                        const d = await r.json();
                        if (d?.data) setProdutos(d.data);
                      } catch {}
                    } else {
                      // recarrega lista base
                      try {
                        const r = await fetch(`/api/produtos?ativo=1`);
                        const d = await r.json();
                        if (d?.data) setProdutos(d.data);
                      } catch {}
                    }
                  }}
                />
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {produtos
                    .filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
                    .map((p) => (
                      <div
                        key={p.id}
                        className='d-flex justify-content-between align-items-center border-bottom py-1'
                      >
                        <div>
                          <div>{p.nome}</div>
                          <small className='text-muted'>
                            {p.tipo_nome} • R$ {Number(p.preco_venda).toFixed(2)}
                            {p.por_quilo ? ' /kg' : ''}
                          </small>
                        </div>
                        <button
                          className='btn btn-sm btn-outline-primary'
                          onClick={() => addItem(p)}
                        >
                          Adicionar
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='card'>
              <div className='card-body'>
                <h5>Carrinho</h5>
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {itens.map((i) => {
                    const p = produtos.find((pr) => pr.id === i.id_produto);
                    if (!p) return null;
                    return (
                      <div key={i.id_produto} className='border-bottom pb-2 mb-2'>
                        <div className='d-flex justify-content-between'>
                          <strong>{p.nome}</strong>
                          <button
                            className='btn btn-sm btn-link text-danger'
                            onClick={() => removerItem(i.id_produto)}
                          >
                            remover
                          </button>
                        </div>
                        {p.por_quilo ? (
                          <div className='input-group input-group-sm'>
                            <span className='input-group-text'>Peso (kg)</span>
                            <input
                              className='form-control'
                              value={i.peso ?? ''}
                              onChange={(e) => updateItem(i.id_produto, 'peso', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className='input-group input-group-sm'>
                            <span className='input-group-text'>Qtd</span>
                            <input
                              className='form-control'
                              value={i.quantidade ?? 1}
                              onChange={(e) =>
                                updateItem(i.id_produto, 'quantidade', e.target.value)
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className='d-flex justify-content-between align-items-center mt-2'>
                  <strong>Total:</strong>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <button
                  className='btn btn-success w-100 mt-2'
                  onClick={finalizarVenda}
                  disabled={
                    (tipoCliente === 'ALUNO' && !aluno) ||
                    (tipoCliente === 'FUNCIONARIO' && !funcionario) ||
                    itens.length === 0
                  }
                >
                  Finalizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
