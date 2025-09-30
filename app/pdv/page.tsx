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
interface ContaFuncionario {
  codigo_funcionario: number;
  funcionario_nome: string;
  cargo_oficial?: string;
  limite_credito: number | null;
  alerta_credito: number | null;
  total_em_aberto: number;
  limite_disponivel: number | null;
}
interface ConsumoFuncionario {
  id: number;
  id_venda: number;
  valor_original: number;
  valor_aplicado: number;
  desconto_aplicado: number;
  mes_referencia: string;
  dt_venda: string;
  pago: number;
  usuario_nome?: string;
}
interface ItemCarrinho {
  id_produto: number;
  quantidade?: number;
  peso?: number;
}

type FormaPagamento = 'SALDO' | 'DINHEIRO' | 'CARTAO' | 'CONTA_FUNCIONARIO';
type PrioridadeObs = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

interface ObservacaoAluno {
  id: number;
  tipo_observacao: 'MEDICA' | 'ALIMENTAR' | 'COMPORTAMENTAL' | 'GERAL';
  prioridade: PrioridadeObs;
  observacao: string;
  dt_validade_formatada: string | null;
  expirada: boolean;
  destaque: boolean;
  dias_restantes: number | null;
  ativo: number;
}

export default function PDVPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [ra, setRa] = useState('');
  const [aluno, setAluno] = useState<AlunoConta | null>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [observacoes, setObservacoes] = useState<ObservacaoAluno[]>([]);
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
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('SALDO');
  const [contaFuncionarioInfo, setContaFuncionarioInfo] = useState<ContaFuncionario | null>(null);
  const [consumoFuncionario, setConsumoFuncionario] = useState<ConsumoFuncionario[]>([]);
  const [precosCargo, setPrecosCargo] = useState<Record<number, number>>({});
  const [resumoVenda, setResumoVenda] = useState<{
    id_venda: number;
    total: number;
    valor_original: number;
    desconto: number;
    cargo_aplicado: string | null;
  } | null>(null);
  const [avisoConta, setAvisoConta] = useState('');
  const [carregandoFuncionario, setCarregandoFuncionario] = useState(false);

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

  const totais = useMemo(() => {
    let base = 0;
    let aplicado = 0;

    for (const item of itens) {
      const produto = produtos.find((pr) => pr.id === item.id_produto);
      if (!produto) continue;

      const quantidade = produto.por_quilo
        ? Number(item.peso) || 0
        : Number(item.quantidade ?? 1) || 0;

      const precoBase = Number(produto.preco_venda);
      base += precoBase * quantidade;

      let precoAplicado = precoBase;
      if (tipoCliente === 'FUNCIONARIO') {
        const especial = precosCargo[produto.id];
        if (especial != null) {
          precoAplicado = Number(especial);
        }
      }
      aplicado += precoAplicado * quantidade;
    }

    base = Number(base.toFixed(2));
    aplicado = Number(aplicado.toFixed(2));

    return {
      base,
      aplicado,
      desconto: Number((base - aplicado).toFixed(2)),
    };
  }, [itens, produtos, tipoCliente, precosCargo]);

  const total = totais.aplicado;

  async function buscarAluno() {
    setAluno(null);
    setSaldo(0);
    setObservacoes([]);
    setMsg('');
    if (!ra) return;
    const res = await fetch(`/api/alunos/contas/${encodeURIComponent(ra)}`);
    const d = await res.json();
    if (d?.data) {
      setAluno(d.data);
      setSaldo(Number(d.data.saldo_atual || 0));
      const raNum = Number(ra);
      if (!Number.isNaN(raNum)) carregarObservacoesAluno(raNum);
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
    carregarObservacoesAluno(a.ra);
  }

  async function carregarObservacoesAluno(ra: number) {
    try {
      const res = await fetch(`/api/alunos/observacoes/${encodeURIComponent(String(ra))}?ativo=1`);
      if (!res.ok) {
        setObservacoes([]);
        return;
      }
      const d = await res.json();
      if (d?.success) {
        setObservacoes(d.data as ObservacaoAluno[]);
      } else {
        setObservacoes([]);
      }
    } catch {
      setObservacoes([]);
    }
  }

  async function carregarContaFuncionario(codigo: number, cargo?: string) {
    setCarregandoFuncionario(true);
    try {
      const res = await fetch(`/api/funcionarios/contas/${encodeURIComponent(String(codigo))}`);
      if (res.ok) {
        const d = await res.json();
        if (d?.data) {
          const conta = d.data as ContaFuncionario;
          conta.total_em_aberto = Number(conta.total_em_aberto || 0);
          conta.limite_credito =
            conta.limite_credito !== null && conta.limite_credito !== undefined
              ? Number(conta.limite_credito)
              : null;
          conta.alerta_credito =
            conta.alerta_credito !== null && conta.alerta_credito !== undefined
              ? Number(conta.alerta_credito)
              : null;
          conta.limite_disponivel =
            conta.limite_disponivel !== null && conta.limite_disponivel !== undefined
              ? Number(conta.limite_disponivel)
              : null;
          setContaFuncionarioInfo(conta);

          if (
            conta.limite_disponivel !== null &&
            conta.alerta_credito !== null &&
            conta.limite_disponivel <= conta.alerta_credito
          ) {
            setAvisoConta('Limite disponível em alerta. Atenção ao próximo lançamento.');
          } else {
            setAvisoConta('');
          }
        } else {
          setContaFuncionarioInfo(null);
          setAvisoConta('');
        }
      } else {
        setContaFuncionarioInfo(null);
        setAvisoConta('');
      }
    } catch {
      setContaFuncionarioInfo(null);
      setAvisoConta('');
    }

    try {
      if (cargo) {
        const res = await fetch(
          `/api/funcionarios/precos?cargo=${encodeURIComponent(cargo)}&vigentes=1`
        );
        if (res.ok) {
          const d = await res.json();
          const precos = (d?.data || []) as { id_produto: number; preco_especial: number }[];
          const map: Record<number, number> = {};
          precos.forEach((p) => {
            if (p?.id_produto) {
              map[p.id_produto] = Number(p.preco_especial);
            }
          });
          setPrecosCargo(map);
        } else {
          setPrecosCargo({});
        }
      } else {
        setPrecosCargo({});
      }
    } catch {
      setPrecosCargo({});
    }

    try {
      const res = await fetch(
        `/api/funcionarios/consumo?codigo_funcionario=${encodeURIComponent(String(codigo))}&limit=5`
      );
      if (res.ok) {
        const d = await res.json();
        const dados = (d?.data || []) as ConsumoFuncionario[];
        setConsumoFuncionario(dados.slice(0, 5));
      } else {
        setConsumoFuncionario([]);
      }
    } catch {
      setConsumoFuncionario([]);
    }

    setCarregandoFuncionario(false);
  }

  async function selecionarFuncionario(f: Funcionario) {
    setFuncionario(f);
    setSugestoesFunc([]);
    setBuscaFunc('');
    setResumoVenda(null);
    await carregarContaFuncionario(f.codigo, f.cargo?.toUpperCase());
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
    setResumoVenda(null);
    if (itens.length === 0) {
      setMsg('Adicione itens');
      return;
    }
    const payload: {
      tipo_cliente: typeof tipoCliente;
      forma_pagamento: FormaPagamento;
      itens: {
        id_produto: number;
        quantidade: number;
        peso?: number;
      }[];
      ra_aluno?: number;
      codigo_funcionario?: number;
    } = {
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
      if (contaFuncionarioInfo) {
        const limiteCredito = contaFuncionarioInfo.limite_credito;
        const saldoAtual = Number(contaFuncionarioInfo.total_em_aberto || 0);
        if (limiteCredito !== null) {
          const saldoProjetado = Number((saldoAtual + total).toFixed(2));
          if (saldoProjetado - limiteCredito > 0.009) {
            setMsg(
              `Limite excedido: saldo atual R$ ${saldoAtual.toFixed(2)}, venda R$ ${total.toFixed(
                2
              )}, limite R$ ${limiteCredito.toFixed(2)}`
            );
            return;
          }
        }
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
      setMsg(`Venda ${d.data.id_venda} concluída com sucesso.`);
      setResumoVenda({
        id_venda: Number(d.data.id_venda),
        total: Number(d.data.total ?? total),
        valor_original: Number(d.data.valor_original ?? total),
        desconto: Number(d.data.desconto ?? 0),
        cargo_aplicado: d.data.cargo_aplicado ?? null,
      });
      setItens([]);
      // atualizar saldo se aluno
      if (tipoCliente === 'ALUNO') {
        buscarAluno();
      } else if (tipoCliente === 'FUNCIONARIO' && funcionario) {
        await carregarContaFuncionario(funcionario.codigo, funcionario.cargo?.toUpperCase());
      }
    } else {
      if (d?.details) {
        const info = d.details as { limite?: number; saldo_atual?: number; valor_venda?: number };
        const partes: string[] = [];
        if (info?.limite !== undefined) partes.push(`Limite: R$ ${Number(info.limite).toFixed(2)}`);
        if (info?.saldo_atual !== undefined)
          partes.push(`Em aberto: R$ ${Number(info.saldo_atual).toFixed(2)}`);
        if (info?.valor_venda !== undefined)
          partes.push(`Venda atual: R$ ${Number(info.valor_venda).toFixed(2)}`);
        setMsg(
          `${d?.error || 'Erro ao finalizar venda'}${
            partes.length ? ` (${partes.join(' | ')})` : ''
          }`
        );
      } else {
        setMsg(d?.error || 'Erro ao finalizar venda');
      }
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
        {resumoVenda && (
          <div className='alert alert-success mb-3'>
            <div className='fw-semibold'>Venda #{resumoVenda.id_venda}</div>
            <div>Total pago: R$ {Number(resumoVenda.total).toFixed(2)}</div>
            {resumoVenda.valor_original !== resumoVenda.total && (
              <div>
                Valor original: R$ {Number(resumoVenda.valor_original).toFixed(2)} • Desconto: R${' '}
                {Number(resumoVenda.desconto).toFixed(2)}
              </div>
            )}
            {resumoVenda.cargo_aplicado && <div>Cargo aplicado: {resumoVenda.cargo_aplicado}</div>}
          </div>
        )}
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
                      setObservacoes([]);
                      setMsg('');
                      setContaFuncionarioInfo(null);
                      setConsumoFuncionario([]);
                      setPrecosCargo({});
                      setResumoVenda(null);
                      setAvisoConta('');
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
                    onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
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
                    <div className='mt-3'>
                      <h6 className='fw-semibold text-primary'>Observações importantes</h6>
                      {observacoes.length > 0 ? (
                        <div className='d-flex flex-column gap-2'>
                          {observacoes.map((obs) => {
                            const alertClass =
                              obs.prioridade === 'CRITICA'
                                ? 'alert-danger'
                                : obs.prioridade === 'ALTA'
                                ? 'alert-warning text-dark'
                                : 'alert-info text-dark';
                            return (
                              <div key={obs.id} className={`alert ${alertClass} mb-0 py-2 px-3`}>
                                <div className='d-flex justify-content-between align-items-start gap-2'>
                                  <div>
                                    <div className='fw-semibold'>
                                      {obs.tipo_observacao} • Prioridade {obs.prioridade}
                                    </div>
                                    <div>{obs.observacao}</div>
                                  </div>
                                  <span className='badge bg-secondary'>#{obs.id}</span>
                                </div>
                                <div className='small mt-1'>
                                  {obs.dt_validade_formatada ? (
                                    <>
                                      Válido até {obs.dt_validade_formatada}
                                      {obs.expirada && (
                                        <span className='badge bg-danger ms-1'>Vencida</span>
                                      )}
                                      {!obs.expirada && obs.dias_restantes !== null && (
                                        <span className='badge bg-dark text-white ms-1'>
                                          {obs.dias_restantes === 0
                                            ? 'Expira hoje'
                                            : `${obs.dias_restantes} dia(s)`}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className='text-muted'>Sem validade definida</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className='alert alert-light border mb-0 py-2 px-3'>
                          Nenhuma observação ativa para este aluno.
                        </div>
                      )}
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
                    {carregandoFuncionario && (
                      <div className='text-muted small mt-2'>
                        Carregando dados do funcionário...
                      </div>
                    )}
                    {contaFuncionarioInfo && !carregandoFuncionario && (
                      <div className='mt-2 border rounded p-2 bg-light'>
                        <div className='small d-flex justify-content-between'>
                          <span>Limite de crédito</span>
                          <span>
                            {contaFuncionarioInfo.limite_credito !== null
                              ? `R$ ${Number(contaFuncionarioInfo.limite_credito).toFixed(2)}`
                              : 'Sem limite definido'}
                          </span>
                        </div>
                        <div className='small d-flex justify-content-between'>
                          <span>Em aberto</span>
                          <span>
                            R$ {Number(contaFuncionarioInfo.total_em_aberto || 0).toFixed(2)}
                          </span>
                        </div>
                        {contaFuncionarioInfo.limite_disponivel !== null && (
                          <div className='small d-flex justify-content-between'>
                            <span>Disponível</span>
                            <span
                              className={
                                contaFuncionarioInfo.limite_disponivel < 0
                                  ? 'text-danger fw-semibold'
                                  : 'fw-semibold'
                              }
                            >
                              R$ {Number(contaFuncionarioInfo.limite_disponivel).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {avisoConta && (
                          <div className='alert alert-warning py-1 px-2 mt-2 small mb-0'>
                            {avisoConta}
                          </div>
                        )}
                      </div>
                    )}
                    {!carregandoFuncionario && !contaFuncionarioInfo && (
                      <div className='alert alert-light border mt-2 py-2 px-3 small mb-0'>
                        Nenhuma conta configurada. A primeira venda criará o registro
                        automaticamente.
                      </div>
                    )}
                    {consumoFuncionario.length > 0 && (
                      <div className='mt-3'>
                        <h6 className='fw-semibold text-primary'>Últimas movimentações</h6>
                        <div className='table-responsive'>
                          <table className='table table-sm table-bordered align-middle mb-0'>
                            <thead>
                              <tr>
                                <th>Venda</th>
                                <th>Data</th>
                                <th>Valor</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {consumoFuncionario.map((consumo) => (
                                <tr key={consumo.id}>
                                  <td>#{consumo.id_venda}</td>
                                  <td>{new Date(consumo.dt_venda).toLocaleString()}</td>
                                  <td>
                                    R$ {Number(consumo.valor_aplicado).toFixed(2)}
                                    {consumo.valor_aplicado !== consumo.valor_original && (
                                      <small className='text-muted ms-1'>
                                        (Base R$ {Number(consumo.valor_original).toFixed(2)})
                                      </small>
                                    )}
                                  </td>
                                  <td>
                                    {consumo.pago ? (
                                      <span className='badge bg-success'>Pago</span>
                                    ) : (
                                      <span className='badge bg-warning text-dark'>Pendente</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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
                    .map((p) => {
                      const precoEspecial =
                        tipoCliente === 'FUNCIONARIO' ? precosCargo[p.id] : undefined;
                      const possuiEspecial =
                        precoEspecial != null && Number(precoEspecial) !== Number(p.preco_venda);
                      return (
                        <div
                          key={p.id}
                          className='d-flex justify-content-between align-items-center border-bottom py-1'
                        >
                          <div>
                            <div>{p.nome}</div>
                            <small className='text-muted'>
                              {p.tipo_nome} • R$ {Number(p.preco_venda).toFixed(2)}
                              {p.por_quilo ? ' /kg' : ''}
                              {possuiEspecial && (
                                <span className='ms-2 badge bg-warning text-dark'>
                                  Cargo: R$ {Number(precoEspecial).toFixed(2)}
                                  {p.por_quilo ? ' /kg' : ''}
                                </span>
                              )}
                            </small>
                          </div>
                          <button
                            className='btn btn-sm btn-outline-primary'
                            onClick={() => addItem(p)}
                          >
                            Adicionar
                          </button>
                        </div>
                      );
                    })}
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
                    const quantidade = p.por_quilo
                      ? Number(i.peso) || 0
                      : Number(i.quantidade ?? 1) || 0;
                    const precoBase = Number(p.preco_venda);
                    const precoAplicado =
                      tipoCliente === 'FUNCIONARIO' && precosCargo[p.id] != null
                        ? Number(precosCargo[p.id])
                        : precoBase;
                    const valorBase = Number((precoBase * quantidade).toFixed(2));
                    const valorAplicado = Number((precoAplicado * quantidade).toFixed(2));
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
                        <div className='d-flex justify-content-between small text-muted mt-1'>
                          <span>
                            Preço: R$ {precoAplicado.toFixed(2)}
                            {tipoCliente === 'FUNCIONARIO' && precoAplicado !== precoBase && (
                              <span className='ms-1 text-decoration-line-through text-danger'>
                                R$ {precoBase.toFixed(2)}
                              </span>
                            )}
                          </span>
                          <span>Subtotal: R$ {valorAplicado.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className='border-top pt-2 mt-2'>
                  <div className='d-flex justify-content-between small text-muted'>
                    <span>Total base</span>
                    <span>R$ {totais.base.toFixed(2)}</span>
                  </div>
                  {tipoCliente === 'FUNCIONARIO' && Math.abs(totais.desconto) > 0.009 && (
                    <div className='d-flex justify-content-between small text-success'>
                      <span>Desconto aplicado</span>
                      <span>- R$ {Math.abs(totais.desconto).toFixed(2)}</span>
                    </div>
                  )}
                  <div className='d-flex justify-content-between align-items-center mt-2'>
                    <strong>Total a pagar</strong>
                    <span className='fs-5'>R$ {total.toFixed(2)}</span>
                  </div>
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
