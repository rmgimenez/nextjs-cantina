'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import styles from './pdv.module.css';

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

  // Estados para pacotes de alimentação
  const [pacotesAluno, setPacotesAluno] = useState<any[]>([]);
  const [temPacoteValido, setTemPacoteValido] = useState(false);

  // Refs para controle de foco e atalhos
  const buscaProdutoRef = useRef<HTMLInputElement>(null);
  const buscaClienteRef = useRef<HTMLInputElement>(null);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // F2 - Focar na busca de cliente
      if (e.key === 'F2') {
        e.preventDefault();
        buscaClienteRef.current?.focus();
      }
      // F3 - Focar na busca de produto
      if (e.key === 'F3') {
        e.preventDefault();
        buscaProdutoRef.current?.focus();
      }
      // F9 - Finalizar venda
      if (e.key === 'F9') {
        e.preventDefault();
        finalizarVenda();
      }
      // ESC - Limpar venda
      if (e.key === 'Escape' && !resumoVenda) {
        e.preventDefault();
        limparVenda();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [resumoVenda]); // eslint-disable-line react-hooks/exhaustive-deps

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
    // Carregar pacotes do aluno
    await carregarPacotesAluno(ra);
  }

  async function carregarPacotesAluno(ra: number) {
    try {
      const res = await fetch(`/api/alunos/pacotes/verificar/${encodeURIComponent(String(ra))}`);
      if (res.ok) {
        const d = await res.json();
        if (d?.success) {
          setPacotesAluno(d.pacotes || []);
          setTemPacoteValido(d.temPacoteValido || false);
        } else {
          setPacotesAluno([]);
          setTemPacoteValido(false);
        }
      } else {
        setPacotesAluno([]);
        setTemPacoteValido(false);
      }
    } catch {
      setPacotesAluno([]);
      setTemPacoteValido(false);
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
        // Consumo carregado com sucesso (não está sendo exibido no momento)
      } else {
        // Erro ao carregar consumo
      }
    } catch {
      // Erro ao carregar consumo
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

  function limparVenda() {
    setItens([]);
    setAluno(null);
    setFuncionario(null);
    setBuscaAluno('');
    setBuscaFunc('');
    setSaldo(0);
    setObservacoes([]);
    setPacotesAluno([]);
    setTemPacoteValido(false);
    setContaFuncionarioInfo(null);
    setPrecosCargo({});
    setAvisoConta('');
    setResumoVenda(null);
    setMsg('');
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
      const vendaInfo = {
        id_venda: Number(d.data.id_venda),
        total: Number(d.data.total ?? total),
        valor_original: Number(d.data.valor_original ?? total),
        desconto: Number(d.data.desconto ?? 0),
        cargo_aplicado: d.data.cargo_aplicado ?? null,
      };

      // Mostra resumo e limpa após 3 segundos
      setMsg(
        `Venda ${vendaInfo.id_venda} concluída com sucesso! A tela será limpa em instantes...`
      );
      setResumoVenda(vendaInfo);

      setTimeout(() => {
        limparVenda();
      }, 3000);
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

  if (carregando) {
    return (
      <div className='container py-5 text-center'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
        <p className='mt-3 text-muted'>Verificando autenticação...</p>
      </div>
    );
  }
  if (!user) return null;

  // Função para obter ícone do produto por tipo
  const getProdutoIcon = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes('salgado')) return '🥖';
    if (t.includes('doce')) return '🍰';
    if (t.includes('bebida')) return '🥤';
    if (t.includes('refeiç') || t.includes('almoço')) return '🍽️';
    if (t.includes('lanche')) return '🥪';
    return '🍴';
  };

  const clienteSelecionado = aluno || funcionario;
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <MainLayout>
      <div className={styles.pdvContainer}>
        {/* Header com status do caixa */}
        <div className={styles.headerBar}>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <h4 className='mb-0'>
                <strong>PDV - Ponto de Venda</strong>
              </h4>
              <small>
                Caixa: <strong>{statusCaixa?.aberto ? 'ABERTO' : 'FECHADO'}</strong>
                {statusCaixa?.aberto && (
                  <span className='ms-3'>
                    Valor esperado: R$ {Number(statusCaixa?.totais?.esperado || 0).toFixed(2)}
                  </span>
                )}
              </small>
            </div>
            <div>
              <a href='/caixa' className='btn btn-light btn-sm'>
                Gerenciar Caixa
              </a>
            </div>
          </div>
        </div>

        {/* Alertas e mensagens */}
        {msg && (
          <div
            className={`alert ${
              resumoVenda ? 'alert-success' : 'alert-info'
            } alert-dismissible fade show`}
            role='alert'
          >
            <strong>{resumoVenda ? '✓ Sucesso!' : 'ℹ️ Atenção'}</strong> {msg}
            <button type='button' className='btn-close' onClick={() => setMsg('')}></button>
          </div>
        )}

        {resumoVenda && (
          <div className='alert alert-success border-success mb-3'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h5 className='mb-2'>✓ Venda #{resumoVenda.id_venda} concluída!</h5>
                <div className='row g-2'>
                  <div className='col-auto'>
                    <strong>Total:</strong> R$ {Number(resumoVenda.total).toFixed(2)}
                  </div>
                  {resumoVenda.desconto > 0 && (
                    <div className='col-auto'>
                      <strong>Desconto:</strong> R$ {Number(resumoVenda.desconto).toFixed(2)}
                    </div>
                  )}
                  {resumoVenda.cargo_aplicado && (
                    <div className='col-auto'>
                      <span className='badge bg-warning text-dark'>
                        Cargo: {resumoVenda.cargo_aplicado}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button className='btn btn-primary btn-lg' onClick={limparVenda}>
                Nova Venda
              </button>
            </div>
          </div>
        )}

        {/* Seleção de tipo de cliente */}
        <div className='card mb-3 border-0 shadow-sm'>
          <div className='card-body py-2'>
            <div className='row g-2 align-items-center'>
              <div className='col-auto'>
                <label className='col-form-label fw-semibold'>Tipo de Cliente:</label>
              </div>
              <div className='col-auto'>
                <div className='btn-group' role='group'>
                  <input
                    type='radio'
                    className='btn-check'
                    name='tipoCliente'
                    id='tipoAluno'
                    value='ALUNO'
                    checked={tipoCliente === 'ALUNO'}
                    onChange={() => {
                      setTipoCliente('ALUNO');
                      setAluno(null);
                      setFuncionario(null);
                      setObservacoes([]);
                      setMsg('');
                      setFormaPagamento('SALDO');
                      setTimeout(() => buscaClienteRef.current?.focus(), 100);
                    }}
                  />
                  <label className='btn btn-outline-primary' htmlFor='tipoAluno'>
                    👨‍🎓 Aluno
                  </label>

                  <input
                    type='radio'
                    className='btn-check'
                    name='tipoCliente'
                    id='tipoFuncionario'
                    value='FUNCIONARIO'
                    checked={tipoCliente === 'FUNCIONARIO'}
                    onChange={() => {
                      setTipoCliente('FUNCIONARIO');
                      setAluno(null);
                      setFuncionario(null);
                      setMsg('');
                      setFormaPagamento('CONTA_FUNCIONARIO');
                      setTimeout(() => buscaClienteRef.current?.focus(), 100);
                    }}
                  />
                  <label className='btn btn-outline-primary' htmlFor='tipoFuncionario'>
                    👔 Funcionário
                  </label>

                  <input
                    type='radio'
                    className='btn-check'
                    name='tipoCliente'
                    id='tipoGeral'
                    value='GERAL'
                    checked={tipoCliente === 'GERAL'}
                    onChange={() => {
                      setTipoCliente('GERAL');
                      setAluno(null);
                      setFuncionario(null);
                      setMsg('');
                      setFormaPagamento('DINHEIRO');
                      setTimeout(() => buscaProdutoRef.current?.focus(), 100);
                    }}
                  />
                  <label className='btn btn-outline-primary' htmlFor='tipoGeral'>
                    🛒 Geral
                  </label>
                </div>
              </div>
              <div className='col-auto ms-auto'>
                <button
                  className='btn btn-outline-danger btn-sm'
                  onClick={limparVenda}
                  title='Limpar venda (ESC)'
                >
                  🗑️ Limpar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout principal em grid */}
        <div className='row g-3'>
          {/* Coluna Esquerda - Cliente */}
          <div className='col-lg-3'>
            <div className={styles.clienteCard}>
              <h5 className='mb-3 text-center'>
                {tipoCliente === 'ALUNO' && '👨‍🎓 Identificar Aluno'}
                {tipoCliente === 'FUNCIONARIO' && '👔 Identificar Funcionário'}
                {tipoCliente === 'GERAL' && '🛒 Venda Geral'}
              </h5>

              {/* Busca de cliente */}
              {tipoCliente !== 'GERAL' && (
                <div className={styles.buscaRapida}>
                  {tipoCliente === 'ALUNO' ? (
                    <>
                      <input
                        ref={buscaClienteRef}
                        className={styles.buscaInput}
                        placeholder='🔍 Buscar por nome ou RA... (F2)'
                        value={buscaAluno}
                        onChange={(e) => setBuscaAluno(e.target.value)}
                        autoFocus
                      />
                      {sugestoesAlunos.length > 0 && (
                        <div className={styles.sugestoesDropdown}>
                          {sugestoesAlunos.map((a) => (
                            <div
                              key={a.ra}
                              className={styles.sugestaoItem}
                              onClick={() => selecionarAluno(a)}
                            >
                              <div className='fw-semibold'>{a.nome}</div>
                              <small className='text-muted'>RA: {a.ra}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        ref={buscaClienteRef}
                        className={styles.buscaInput}
                        placeholder='🔍 Buscar funcionário... (F2)'
                        value={buscaFunc}
                        onChange={(e) => setBuscaFunc(e.target.value)}
                        autoFocus
                      />
                      {sugestoesFunc.length > 0 && (
                        <div className={styles.sugestoesDropdown}>
                          {sugestoesFunc.map((f) => (
                            <div
                              key={f.codigo}
                              className={styles.sugestaoItem}
                              onClick={() => selecionarFuncionario(f)}
                            >
                              <div className='fw-semibold'>{f.nome}</div>
                              <small className='text-muted'>
                                Cód: {f.codigo} {f.cargo && `• ${f.cargo}`}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Informações do cliente selecionado */}
              {!clienteSelecionado && tipoCliente !== 'GERAL' && (
                <div className='text-center text-muted py-5'>
                  <div className={styles.fotoPlaceholder}>
                    {tipoCliente === 'ALUNO' ? '👨‍🎓' : '👔'}
                  </div>
                  <p className='mt-3'>
                    {tipoCliente === 'ALUNO'
                      ? 'Busque o aluno para iniciar'
                      : 'Busque o funcionário para iniciar'}
                  </p>
                </div>
              )}

              {aluno && tipoCliente === 'ALUNO' && (
                <div className={styles.clienteInfo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://sistema.santanna.g12.br/carometr/${aluno.ra}.jpg`}
                    alt={aluno.nome}
                    className={styles.fotoCliente}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('d-none');
                    }}
                  />
                  <div className={`${styles.fotoPlaceholder} d-none`}>👨‍🎓</div>

                  <div className={styles.clienteNome}>{aluno.nome}</div>
                  <div className='text-muted small mb-2'>RA: {aluno.ra}</div>
                  <div
                    className={`${styles.clienteSaldo} ${
                      saldo < 10 ? styles.clienteSaldoBaixo : ''
                    }`}
                  >
                    R$ {saldo.toFixed(2)}
                  </div>
                  {saldo < 10 && (
                    <div className='alert alert-warning py-1 px-2 mt-2 small'>⚠️ Saldo baixo!</div>
                  )}

                  {/* Observações do aluno */}
                  {observacoes.length > 0 && (
                    <div className='mt-3'>
                      <h6 className='fw-bold text-danger mb-2'>⚠️ ATENÇÃO</h6>
                      {observacoes.map((obs) => {
                        const alertClass =
                          obs.prioridade === 'CRITICA'
                            ? styles.obsAlertCritica
                            : obs.prioridade === 'ALTA'
                            ? styles.obsAlertAlta
                            : obs.prioridade === 'MEDIA'
                            ? styles.obsAlertMedia
                            : styles.obsAlertBaixa;

                        return (
                          <div key={obs.id} className={`${styles.obsAlert} ${alertClass}`}>
                            <div className='fw-semibold small'>{obs.tipo_observacao}</div>
                            <div className='small'>{obs.observacao}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pacotes de Alimentação */}
                  {temPacoteValido && pacotesAluno.length > 0 && (
                    <div className='mt-3 border border-success rounded p-2 bg-light'>
                      <h6 className='fw-bold text-success mb-2'>
                        <i className='bi bi-box-seam me-1'></i>
                        Pacotes Disponíveis
                      </h6>
                      {pacotesAluno.map((pacote) => {
                        const getTipoLabel = (tipo: string) => {
                          const tipos: Record<string, string> = {
                            LANCHE_MANHA: 'Lanche Manhã',
                            ALMOCO: 'Almoço',
                            LANCHE_TARDE: 'Lanche Tarde',
                            JANTAR: 'Jantar',
                            PERSONALIZADO: 'Personalizado',
                          };
                          return tipos[tipo] || tipo;
                        };

                        return (
                          <div key={pacote.id} className='small mb-2 pb-2 border-bottom'>
                            <div className='fw-semibold'>{pacote.pacote_nome}</div>
                            <div className='text-muted'>{getTipoLabel(pacote.tipo_refeicao)}</div>
                            <div className='d-flex justify-content-between mt-1'>
                              <span>Restante:</span>
                              <strong className='text-success'>
                                {pacote.quantidade_restante} refeições
                              </strong>
                            </div>
                            {pacote.data_fim && (
                              <div className='text-muted' style={{ fontSize: '0.7rem' }}>
                                Válido até: {new Date(pacote.data_fim).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div className='text-center mt-2'>
                        <a
                          href={`/alunos/pacotes/consultar`}
                          className='btn btn-sm btn-outline-success'
                          target='_blank'
                        >
                          <i className='bi bi-clipboard-check me-1'></i>
                          Usar Pacote
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {funcionario && tipoCliente === 'FUNCIONARIO' && (
                <div className={styles.clienteInfo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://sistema.santanna.g12.br/carometr/f${funcionario.codigo}.jpg`}
                    alt={funcionario.nome}
                    className={styles.fotoCliente}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('d-none');
                    }}
                  />
                  <div className={`${styles.fotoPlaceholder} d-none`}>👔</div>

                  <div className={styles.clienteNome}>{funcionario.nome}</div>
                  <div className='text-muted small mb-2'>
                    Cód: {funcionario.codigo}
                    {funcionario.cargo && ` • ${funcionario.cargo}`}
                  </div>

                  {carregandoFuncionario && (
                    <div className='text-center py-3'>
                      <div className='spinner-border spinner-border-sm text-primary' role='status'>
                        <span className='visually-hidden'>Carregando...</span>
                      </div>
                      <div className='small text-muted mt-2'>Carregando dados...</div>
                    </div>
                  )}

                  {!carregandoFuncionario && contaFuncionarioInfo && (
                    <div className='border rounded p-2 mt-3 bg-light'>
                      <div className='d-flex justify-content-between small mb-1'>
                        <span>Limite:</span>
                        <strong>
                          {contaFuncionarioInfo.limite_credito !== null
                            ? `R$ ${Number(contaFuncionarioInfo.limite_credito).toFixed(2)}`
                            : 'Sem limite'}
                        </strong>
                      </div>
                      <div className='d-flex justify-content-between small mb-1'>
                        <span>Em aberto:</span>
                        <strong className='text-warning'>
                          R$ {Number(contaFuncionarioInfo.total_em_aberto || 0).toFixed(2)}
                        </strong>
                      </div>
                      {contaFuncionarioInfo.limite_disponivel !== null && (
                        <div className='d-flex justify-content-between small'>
                          <span>Disponível:</span>
                          <strong
                            className={
                              contaFuncionarioInfo.limite_disponivel < 0
                                ? 'text-danger'
                                : 'text-success'
                            }
                          >
                            R$ {Number(contaFuncionarioInfo.limite_disponivel).toFixed(2)}
                          </strong>
                        </div>
                      )}
                      {avisoConta && (
                        <div className='alert alert-warning py-1 px-2 mt-2 small mb-0'>
                          {avisoConta}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tipoCliente === 'GERAL' && (
                <div className='text-center py-5'>
                  <div className={styles.fotoPlaceholder}>🛒</div>
                  <p className='mt-3 text-muted'>
                    Venda para público geral
                    <br />
                    <small>Pagamento: Dinheiro ou Cartão</small>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Central - Produtos */}
          <div className='col-lg-5'>
            <div className={styles.clienteCard}>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h5 className='mb-0'>🛍️ Produtos</h5>
                <span className='badge bg-secondary'>{produtosFiltrados.length} produtos</span>
              </div>

              <div className='mb-3'>
                <input
                  ref={buscaProdutoRef}
                  className={styles.buscaInput}
                  placeholder='🔍 Buscar produto... (F3)'
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <div className={styles.produtosGrid}>
                {produtosFiltrados.length === 0 ? (
                  <div className='col-12 text-center text-muted py-5'>
                    <p>Nenhum produto encontrado</p>
                  </div>
                ) : (
                  produtosFiltrados.map((p) => {
                    const precoEspecial =
                      tipoCliente === 'FUNCIONARIO' ? precosCargo[p.id] : undefined;
                    const temDesconto =
                      precoEspecial != null && Number(precoEspecial) !== Number(p.preco_venda);
                    const precoFinal = temDesconto ? Number(precoEspecial) : Number(p.preco_venda);

                    return (
                      <div
                        key={p.id}
                        className={styles.produtoCard}
                        onClick={() => addItem(p)}
                        title={`Adicionar ${p.nome}`}
                      >
                        <div className={styles.produtoIcon}>{getProdutoIcon(p.tipo_nome)}</div>
                        <div className={styles.produtoNome}>{p.nome}</div>
                        <div className='text-muted small mb-1'>{p.tipo_nome}</div>
                        <div
                          className={`${styles.produtoPreco} ${
                            temDesconto ? styles.produtoPrecoDesconto : ''
                          }`}
                        >
                          R$ {precoFinal.toFixed(2)}
                          {p.por_quilo ? '/kg' : ''}
                        </div>
                        {temDesconto && (
                          <div className='text-decoration-line-through text-muted small'>
                            R$ {Number(p.preco_venda).toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Carrinho */}
          <div className='col-lg-4'>
            <div className={styles.carrinhoContainer}>
              <div className={styles.carrinhoHeader}>
                <div className='d-flex justify-content-between align-items-center'>
                  <h5 className='mb-0'>🛒 Carrinho</h5>
                  <span className='badge bg-primary'>
                    {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>

              <div className={styles.carrinhoItens}>
                {itens.length === 0 ? (
                  <div className='text-center text-muted py-5'>
                    <div style={{ fontSize: '3rem' }}>🛒</div>
                    <p className='mt-2'>Carrinho vazio</p>
                    <small>Adicione produtos para começar</small>
                  </div>
                ) : (
                  itens.map((item) => {
                    const p = produtos.find((pr) => pr.id === item.id_produto);
                    if (!p) return null;

                    const quantidade = p.por_quilo
                      ? Number(item.peso) || 0
                      : Number(item.quantidade ?? 1) || 0;
                    const precoBase = Number(p.preco_venda);
                    const precoAplicado =
                      tipoCliente === 'FUNCIONARIO' && precosCargo[p.id] != null
                        ? Number(precosCargo[p.id])
                        : precoBase;
                    const subtotal = precoAplicado * quantidade;
                    const temDesconto = precoAplicado !== precoBase;

                    return (
                      <div key={item.id_produto} className={styles.carrinhoItem}>
                        <div className={styles.carrinhoItemHeader}>
                          <div className={styles.carrinhoItemNome}>
                            {getProdutoIcon(p.tipo_nome)} {p.nome}
                          </div>
                          <button
                            className={styles.btnRemover}
                            onClick={() => removerItem(item.id_produto)}
                            title='Remover item'
                          >
                            ✕
                          </button>
                        </div>

                        <div className='mt-2'>
                          {p.por_quilo ? (
                            <div className='input-group input-group-sm'>
                              <span className='input-group-text'>Peso (kg)</span>
                              <input
                                type='number'
                                className='form-control'
                                value={item.peso ?? ''}
                                onChange={(e) =>
                                  updateItem(item.id_produto, 'peso', e.target.value)
                                }
                                step='0.01'
                                min='0'
                              />
                            </div>
                          ) : (
                            <div className='input-group input-group-sm'>
                              <button
                                className='btn btn-outline-secondary'
                                onClick={() => {
                                  const novaQtd = Math.max(1, (item.quantidade ?? 1) - 1);
                                  updateItem(item.id_produto, 'quantidade', String(novaQtd));
                                }}
                              >
                                −
                              </button>
                              <input
                                type='number'
                                className='form-control text-center'
                                value={item.quantidade ?? 1}
                                onChange={(e) =>
                                  updateItem(item.id_produto, 'quantidade', e.target.value)
                                }
                                min='1'
                                style={{ maxWidth: '60px' }}
                              />
                              <button
                                className='btn btn-outline-secondary'
                                onClick={() => {
                                  const novaQtd = (item.quantidade ?? 1) + 1;
                                  updateItem(item.id_produto, 'quantidade', String(novaQtd));
                                }}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>

                        <div className='d-flex justify-content-between mt-2 small'>
                          <span className='text-muted'>
                            R$ {precoAplicado.toFixed(2)}
                            {p.por_quilo && '/kg'}
                            {temDesconto && (
                              <span className='text-decoration-line-through text-danger ms-1'>
                                R$ {precoBase.toFixed(2)}
                              </span>
                            )}
                          </span>
                          <strong className='text-success'>R$ {subtotal.toFixed(2)}</strong>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={styles.carrinhoFooter}>
                <div className={styles.totalContainer}>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <span className='text-muted small'>Subtotal:</span>
                    <span className='fw-semibold'>R$ {totais.base.toFixed(2)}</span>
                  </div>

                  {tipoCliente === 'FUNCIONARIO' && totais.desconto > 0 && (
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <span className='text-success small'>Desconto:</span>
                      <span className='text-success fw-semibold'>
                        - R$ {totais.desconto.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className='border-top pt-2 mt-2'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <div className={styles.totalLabel}>Total:</div>
                      <div className={styles.totalValor}>R$ {total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <button
                  className={styles.btnFinalizar}
                  onClick={finalizarVenda}
                  disabled={
                    (tipoCliente === 'ALUNO' && !aluno) ||
                    (tipoCliente === 'FUNCIONARIO' && !funcionario) ||
                    itens.length === 0
                  }
                  title='Finalizar venda (F9)'
                >
                  {itens.length === 0
                    ? '🛒 Carrinho vazio'
                    : (tipoCliente === 'ALUNO' && !aluno) ||
                      (tipoCliente === 'FUNCIONARIO' && !funcionario)
                    ? '⚠️ Selecione um cliente'
                    : '✓ Finalizar Venda (F9)'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Atalhos de teclado */}
        <div className={styles.atalhos}>
          <div>
            <kbd>F2</kbd> Buscar cliente
          </div>
          <div>
            <kbd>F3</kbd> Buscar produto
          </div>
          <div>
            <kbd>F9</kbd> Finalizar venda
          </div>
          <div>
            <kbd>ESC</kbd> Limpar venda
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
