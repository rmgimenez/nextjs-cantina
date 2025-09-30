'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import type {
  TipoCliente,
  FormaPagamento,
  ResumoVenda,
  ProdutoBloqueado,
  ItemCarrinho,
  Produto,
} from './types';
import {
  HeaderBar,
  SeletorTipoCliente,
  ClienteCard,
  ProdutosGrid,
  CarrinhoCompras,
  Alertas,
  AtalhosTeclado,
  ModalRestricoes,
  ModalBloqueioVenda,
} from './components';
import {
  usePDVAuth,
  useCaixaStatus,
  useProdutos,
  useBuscaAlunos,
  useBuscaFuncionarios,
  useCarrinho,
  useDadosCliente,
} from './hooks';
import styles from './pdv.module.css';

export default function PDVPage() {
  const router = useRouter();

  // Autenticação e caixa
  const { user, carregando } = usePDVAuth();
  const { statusCaixa } = useCaixaStatus(user);

  // Estados principais
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('ALUNO');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('SALDO');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [msg, setMsg] = useState<string>('');
  const [resumoVenda, setResumoVenda] = useState<ResumoVenda | null>(null);

  // Modais
  const [showRestricaoModal, setShowRestricaoModal] = useState(false);
  const [showBloqueioVendaModal, setShowBloqueioVendaModal] = useState(false);
  const [produtosBloqueados, setProdutosBloqueados] = useState<ProdutoBloqueado[]>([]);

  // Hooks customizados
  const { produtos } = useProdutos();
  const {
    buscaAluno,
    setBuscaAluno,
    sugestoesAlunos,
    setSugestoesAlunos,
  } = useBuscaAlunos(tipoCliente);
  const {
    buscaFunc,
    setBuscaFunc,
    sugestoesFunc,
    setSugestoesFunc,
  } = useBuscaFuncionarios(tipoCliente);
  const {
    aluno,
    saldo,
    observacoes,
    restricoes,
    pacotes,
    temPacoteValido,
    selecionarAluno,
    funcionario,
    contaFuncionario,
    precosCargo,
    avisoCredito,
    carregandoFuncionario,
    selecionarFuncionario,
    limparDadosCliente,
  } = useDadosCliente(tipoCliente);
  const {
    itens,
    totais,
    addItem,
    updateItem,
    removerItem,
    limparCarrinho,
  } = useCarrinho(produtos, tipoCliente, precosCargo);

  // Refs
  const buscaProdutoRef = useRef<HTMLInputElement>(null);
  const buscaClienteRef = useRef<HTMLInputElement>(null);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        buscaClienteRef.current?.focus();
      }
      if (e.key === 'F3') {
        e.preventDefault();
        buscaProdutoRef.current?.focus();
      }
      if (e.key === 'F9') {
        e.preventDefault();
        finalizarVenda();
      }
      if (e.key === 'Escape' && !resumoVenda) {
        e.preventDefault();
        limparVenda();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [resumoVenda, itens, aluno, funcionario]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleChangeTipoCliente = (tipo: TipoCliente, forma: FormaPagamento) => {
    setTipoCliente(tipo);
    setFormaPagamento(forma);
    limparDadosCliente();
    setMsg('');
    setBuscaProduto('');
    limparCarrinho();
    setResumoVenda(null);

    setTimeout(() => {
      if (tipo === 'GERAL') {
        buscaProdutoRef.current?.focus();
      } else {
        buscaClienteRef.current?.focus();
      }
    }, 100);
  };

  const handleSelecionarAluno = async (a: any) => {
    const restricoesData = await selecionarAluno(a);
    setSugestoesAlunos([]);
    setBuscaAluno('');
    if (restricoesData && restricoesData.length > 0) {
      setShowRestricaoModal(true);
    }
  };

  const handleSelecionarFuncionario = async (f: any) => {
    await selecionarFuncionario(f);
    setSugestoesFunc([]);
    setBuscaFunc('');
    setResumoVenda(null);
  };

  function limparVenda() {
    limparCarrinho();
    limparDadosCliente();
    setBuscaAluno('');
    setBuscaFunc('');
    setBuscaProduto('');
    setShowRestricaoModal(false);
    setShowBloqueioVendaModal(false);
    setProdutosBloqueados([]);
    setResumoVenda(null);
    setMsg('');
  }

  function validarRestricoesVenda(): ProdutoBloqueado[] {
    const bloqueados: ProdutoBloqueado[] = [];

    for (const item of itens) {
      const produto = produtos.find((p) => p.id === item.id_produto);
      if (!produto) continue;

      const restricaoProduto = restricoes.find(
        (r) => r.tipo_restricao === 'PRODUTO' && r.id_produto === produto.id
      );
      if (restricaoProduto) {
        bloqueados.push({ produto, restricao: restricaoProduto });
        continue;
      }

      const restricaoTipo = restricoes.find(
        (r) => r.tipo_restricao === 'TIPO_PRODUTO' && r.tipo_produto_nome === produto.tipo_nome
      );
      if (restricaoTipo) {
        bloqueados.push({ produto, restricao: restricaoTipo });
      }
    }

    return bloqueados;
  }

  async function finalizarVenda() {
    setMsg('');
    setResumoVenda(null);

    if (itens.length === 0) {
      setMsg('Adicione itens');
      return;
    }

    // Validar restrições para alunos
    if (tipoCliente === 'ALUNO' && aluno && restricoes.length > 0) {
      const bloqueados = validarRestricoesVenda();
      if (bloqueados.length > 0) {
        setProdutosBloqueados(bloqueados);
        setShowBloqueioVendaModal(true);
        return;
      }
    }

    const payload: {
      tipo_cliente: TipoCliente;
      forma_pagamento: FormaPagamento;
      itens: { id_produto: number; quantidade: number; peso?: number }[];
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

      if (!['CONTA_FUNCIONARIO', 'DINHEIRO', 'CARTAO'].includes(formaPagamento)) {
        setMsg('Forma de pagamento inválida');
        return;
      }

      if (contaFuncionario) {
        const limiteCredito = contaFuncionario.limite_credito;
        const saldoAtual = Number(contaFuncionario.total_em_aberto || 0);
        if (limiteCredito !== null) {
          const saldoProjetado = Number((saldoAtual + totais.aplicado).toFixed(2));
          if (saldoProjetado - limiteCredito > 0.009) {
            setMsg(
              `Limite excedido: saldo atual R$ ${saldoAtual.toFixed(
                2
              )}, venda R$ ${totais.aplicado.toFixed(2)}, limite R$ ${limiteCredito.toFixed(2)}`
            );
            return;
          }
        }
      }
    } else {
      if (!['DINHEIRO', 'CARTAO'].includes(formaPagamento)) {
        setMsg('Cliente geral: use DINHEIRO ou CARTAO');
        return;
      }
    }

    try {
      const res = await fetch('/api/pdv/venda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();

      if (res.ok) {
        const vendaInfo: ResumoVenda = {
          id_venda: Number(d.data.id_venda),
          total: Number(d.data.total ?? totais.aplicado),
          valor_original: Number(d.data.valor_original ?? totais.aplicado),
          desconto: Number(d.data.desconto ?? 0),
          cargo_aplicado: d.data.cargo_aplicado ?? null,
        };

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
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      setMsg('Erro ao processar venda. Tente novamente.');
    }
  }

  const handleRemoverBloqueados = () => {
    const idsBloqueados = produtosBloqueados.map((b) => b.produto.id);
    itens.forEach((item) => {
      if (idsBloqueados.includes(item.id_produto)) {
        removerItem(item.id_produto);
      }
    });
    setShowBloqueioVendaModal(false);
    setProdutosBloqueados([]);
    setMsg('Produtos restritos removidos do carrinho');
  };

  // Loading state
  if (carregando) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3 text-muted">Verificando autenticação...</p>
      </div>
    );
  }

  if (!user) return null;

  const clienteSelecionado = !!(aluno || funcionario);
  const podeFinali =
    itens.length > 0 &&
    (tipoCliente === 'GERAL' || (tipoCliente === 'ALUNO' && !!aluno) || (tipoCliente === 'FUNCIONARIO' && !!funcionario));

  return (
    <MainLayout>
      <div className={styles.pdvContainer}>
        <HeaderBar statusCaixa={statusCaixa} />

        <Alertas
          msg={msg}
          resumoVenda={resumoVenda}
          onDismiss={() => setMsg('')}
          onNovaVenda={limparVenda}
        />

        <SeletorTipoCliente
          tipoCliente={tipoCliente}
          onChangeTipoCliente={handleChangeTipoCliente}
          onLimparVenda={limparVenda}
        />

        <div className="row g-3">
          <div className="col-lg-3">
            <ClienteCard
              tipoCliente={tipoCliente}
              buscaAluno={buscaAluno}
              onBuscaAlunoChange={setBuscaAluno}
              sugestoesAlunos={sugestoesAlunos}
              onSelecionarAluno={handleSelecionarAluno}
              buscaFunc={buscaFunc}
              onBuscaFuncChange={setBuscaFunc}
              sugestoesFunc={sugestoesFunc}
              onSelecionarFunc={handleSelecionarFuncionario}
              aluno={aluno}
              funcionario={funcionario}
              saldo={saldo}
              observacoes={observacoes}
              restricoes={restricoes}
              pacotes={pacotes}
              temPacoteValido={temPacoteValido}
              onShowRestricoes={() => setShowRestricaoModal(true)}
              contaFuncionario={contaFuncionario}
              carregandoFuncionario={carregandoFuncionario}
              avisoCredito={avisoCredito}
            />
          </div>

          <div className="col-lg-5">
            <ProdutosGrid
              ref={buscaProdutoRef}
              produtos={produtos}
              busca={buscaProduto}
              onBuscaChange={setBuscaProduto}
              onAddItem={addItem}
              tipoCliente={tipoCliente}
              precosCargo={precosCargo}
            />
          </div>

          <div className="col-lg-4">
            <CarrinhoCompras
              itens={itens}
              produtos={produtos}
              tipoCliente={tipoCliente}
              precosCargo={precosCargo}
              totais={totais}
              onUpdateItem={updateItem}
              onRemoverItem={removerItem}
              onFinalizar={finalizarVenda}
              podeFinali={podeFinali}
              clienteSelecionado={clienteSelecionado}
            />
          </div>
        </div>

        <AtalhosTeclado />

        <ModalRestricoes
          show={showRestricaoModal}
          aluno={aluno}
          restricoes={restricoes}
          onClose={() => setShowRestricaoModal(false)}
        />

        <ModalBloqueioVenda
          show={showBloqueioVendaModal}
          aluno={aluno}
          produtosBloqueados={produtosBloqueados}
          onClose={() => setShowBloqueioVendaModal(false)}
          onRemoverBloqueados={handleRemoverBloqueados}
        />
      </div>
    </MainLayout>
  );
}
