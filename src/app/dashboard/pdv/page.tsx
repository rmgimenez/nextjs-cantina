'use client';

// import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatarMoeda } from '@/lib/formatters';
import { useEffect, useState } from 'react';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';

// Componentes do PDV
import Carrinho from '@/components/pdv/Carrinho';
import Checkout from '@/components/pdv/Checkout';
import ControleCaixa from '@/components/pdv/ControleCaixa';
import GridProdutos from '@/components/pdv/GridProdutos';
import SeletorCliente from '@/components/pdv/SeletorCliente';

interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
  estoqueMinimo: number;
  exigePeso: boolean;
}

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
}

interface Cliente {
  tipo: 'aluno' | 'funcionario';
  id: number;
  nome: string;
  curso?: string;
  serie?: string;
  turma?: string;
  cargo?: string;
  saldo?: number;
  precoRefeicao?: number;
  observacao?: string;
  fotoUrl?: string;
}

interface StatusCaixa {
  caixaAberto: boolean;
  caixa: {
    id: number;
    dataAbertura: string;
    valorInicial: number;
    totalVendas: number;
    totalSangrias: number;
    totalReforcos: number;
    valorCalculado: number;
    usuarioAbertura: string;
  } | null;
}

export default function PDVPage() {
  // Estados principais
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [statusCaixa, setStatusCaixa] = useState<StatusCaixa>({ caixaAberto: false, caixa: null });

  // Estados de controle
  const [buscaProduto, setBuscaProduto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [loadingCaixa, setLoadingCaixa] = useState(true);

  // Carregar status do caixa
  const carregarStatusCaixa = async () => {
    try {
      const response = await fetch('/api/pdv/caixa');
      const data = await response.json();

      if (data.ok) {
        setStatusCaixa(data);
      }
    } catch (error) {
      console.error('Erro ao carregar status do caixa:', error);
    } finally {
      setLoadingCaixa(false);
    }
  };

  // Buscar produtos
  const buscarProdutos = async (busca: string = '', categoria: string = '') => {
    setLoadingProdutos(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.append('q', busca);
      if (categoria) params.append('categoria', categoria);
      params.append('estoque', 'true'); // Apenas produtos com estoque

      const response = await fetch(`/api/pdv/produtos?${params}`);
      const data = await response.json();

      if (data.ok) {
        setProdutos(data.produtos);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  // Buscar clientes
  const buscarClientes = async (busca: string): Promise<Cliente[]> => {
    try {
      const response = await fetch(`/api/pdv/clientes?q=${encodeURIComponent(busca)}`);
      const data = await response.json();
      return data.ok ? data.clientes : [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  };

  // Validação de restrição via backend
  const validarRestricao = async (alunoId: number, produtoId: number) => {
    try {
      const res = await fetch(
        `/api/alunos/restricoes/valida?aluno_ra=${alunoId}&produtoId=${produtoId}`
      );
      if (!res.ok) return { blocked: false, reasons: [] };
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Erro ao validar restrição', err);
      return { blocked: false, reasons: [] };
    }
  };

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = async (produto: Produto) => {
    if (!statusCaixa.caixaAberto) {
      alert('Abra o caixa antes de realizar vendas');
      return;
    }

    const adicionarAoCarrinhoProceed = (p: Produto) => {
      const itemExistente = carrinho.find((item) => item.id === p.id);

      if (itemExistente) {
        if (itemExistente.quantidade >= (p.estoque ?? 0)) {
          alert('Quantidade solicitada excede o estoque disponível');
          return;
        }
        setCarrinho(
          carrinho.map((item) =>
            item.id === p.id ? { ...item, quantidade: item.quantidade + 1 } : item
          )
        );
      } else {
        const novoItem: ItemCarrinho = {
          id: p.id,
          nome: p.nome,
          preco: p.preco,
          quantidade: 1,
          categoria: p.categoria,
        };
        setCarrinho([...carrinho, novoItem]);
      }
    };

    // Se cliente selecionado é aluno, validar restrição
    if (clienteSelecionado && clienteSelecionado.tipo === 'aluno') {
      const data = await validarRestricao(clienteSelecionado.id, produto.id);
      if (data && data.blocked) {
        const motivos = (data.reasons || []).map((r: any) => r.motivo || r.type || '').join('; ');
        alert(`Venda bloqueada: ${motivos}`);
        console.warn('Tentativa de venda bloqueada', {
          aluno_ra: clienteSelecionado.id,
          produtoId: produto.id,
          reasons: data.reasons,
        });
        return;
      }
    }

    // inserir no carrinho
    adicionarAoCarrinhoProceed(produto);
  };

  // Atualizar quantidade no carrinho
  const atualizarQuantidade = (id: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(id);
      return;
    }

    const produto = produtos.find((p) => p.id === id);
    if (produto && novaQuantidade > produto.estoque) {
      alert('Quantidade solicitada excede o estoque disponível');
      return;
    }

    setCarrinho(
      carrinho.map((item) => (item.id === id ? { ...item, quantidade: novaQuantidade } : item))
    );
  };

  // Remover item do carrinho
  const removerItem = (id: number) => {
    setCarrinho(carrinho.filter((item) => item.id !== id));
  };

  // Finalizar venda
  const finalizarVenda = async (formaPagamento: string) => {
    try {
      let tipoComprador: 'ALUNO' | 'FUNCIONARIO_ESCOLA' | 'AVULSA';
      let compradorId: number | undefined;

      if (clienteSelecionado) {
        if (clienteSelecionado.tipo === 'aluno') {
          tipoComprador = 'ALUNO';
          compradorId = clienteSelecionado.id;
        } else {
          tipoComprador = 'FUNCIONARIO_ESCOLA';
          compradorId = clienteSelecionado.id;
        }
      } else {
        tipoComprador = 'AVULSA';
      }

      // Antes de enviar, validar restrições para alunos em todos os itens do carrinho
      if (clienteSelecionado && clienteSelecionado.tipo === 'aluno') {
        for (const item of carrinho) {
          try {
            const resVal = await fetch(
              `/api/alunos/restricoes/valida?aluno_ra=${clienteSelecionado.id}&produtoId=${item.id}`
            );
            if (resVal.ok) {
              const dv = await resVal.json();
              if (dv && dv.blocked) {
                const motivos = (dv.reasons || [])
                  .map((r: any) => r.motivo || r.type || '')
                  .join('; ');
                alert(`Venda bloqueada para o aluno: Item "${item.nome}" - ${motivos}`);
                console.warn('Venda bloqueada na finalização', {
                  aluno_ra: clienteSelecionado.id,
                  produtoId: item.id,
                  reasons: dv.reasons,
                });
                return; // abortar finalização
              }
            }
          } catch (e) {
            console.error('Erro ao validar restrição para item', item, e);
            // Em caso de erro de validação, prevenir a venda por segurança
            alert('Erro ao validar restrições do aluno. Verifique a conexão e tente novamente.');
            return;
          }
        }
      }

      const dadosVenda = {
        tipoComprador,
        compradorId,
        formaPagamento,
        itens: carrinho.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          precoUnitario: item.preco,
        })),
      } as any;

      const response = await fetch('/api/pdv/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosVenda),
      });

      const data = await response.json();

      if (data.ok) {
        const valorTotal = typeof data.valorTotal === 'number' ? data.valorTotal : undefined;
        const vendaId = data.vendaId !== undefined ? data.vendaId : '---';

        if (data.vendaId === undefined || valorTotal === undefined) {
          console.warn('Resposta inesperada ao finalizar venda:', data);
        }

        alert(
          `Venda realizada com sucesso!\nVenda #${vendaId}\nTotal: ${
            valorTotal !== undefined ? formatarMoeda(valorTotal) : '---'
          }`
        );

        setCarrinho([]);
        setClienteSelecionado(null);

        buscarProdutos(buscaProduto, filtroCategoria);
        carregarStatusCaixa();
      } else {
        alert(data.error || 'Erro ao processar venda');
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao conectar com o servidor');
    }
  };

  // Effect para carregar dados iniciais
  useEffect(() => {
    carregarStatusCaixa();
    buscarProdutos();
  }, []);

  // Effect para busca de produtos
  useEffect(() => {
    const timeout = setTimeout(() => {
      buscarProdutos(buscaProduto, filtroCategoria);
    }, 500);

    return () => clearTimeout(timeout);
  }, [buscaProduto, filtroCategoria]);

  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>PDV - Ponto de Venda</h1>
        <p className='text-muted mb-0'>Sistema de vendas da cantina</p>
      </div>

      <div className='pb-3'>
        {/* Barra superior de status do caixa */}
        <div className='mb-4'>
          <ControleCaixa
            status={statusCaixa}
            onAtualizarStatus={carregarStatusCaixa}
            loading={loadingCaixa}
          />
        </div>

        {statusCaixa.caixaAberto && (
          <div className='row g-3'>
            {/* Coluna Produtos */}
            <div className='col-12 col-lg-7 d-flex flex-column'>
              {/* Card filtros */}
              <div className='card shadow-sm mb-3'>
                <div className='card-body py-3'>
                  <div className='row g-2 align-items-center'>
                    <div className='col-12 col-md-5'>
                      <div className='position-relative'>
                        <FiSearch className='position-absolute top-50 translate-middle-y ms-2 text-muted' />
                        <input
                          type='text'
                          value={buscaProduto}
                          onChange={(e) => setBuscaProduto(e.target.value)}
                          placeholder='Buscar produto ou código'
                          className='form-control ps-5'
                        />
                      </div>
                    </div>
                    <div className='col-8 col-md-4'>
                      <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className='form-select'
                      >
                        <option value=''>Todas as categorias</option>
                        <option value='salgados'>Salgados</option>
                        <option value='doces'>Doces</option>
                        <option value='bebidas'>Bebidas</option>
                        <option value='refeicoes'>Refeições</option>
                      </select>
                    </div>
                    <div className='col-4 col-md-3 d-grid'>
                      <button
                        onClick={() => buscarProdutos(buscaProduto, filtroCategoria)}
                        className='btn btn-primary d-flex align-items-center justify-content-center gap-2'
                        title='Recarregar lista'
                      >
                        <FiRefreshCw /> <span>Atualizar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Produtos */}
              <div className='card flex-fill shadow-sm'>
                <div className='card-header bg-white pb-2 pt-3 border-0 d-flex justify-content-between align-items-center'>
                  <h5 className='mb-0 fw-semibold'>Produtos Disponíveis</h5>
                  <small className='text-muted'>{produtos.length} itens</small>
                </div>
                <div className='card-body pt-0 overflow-auto' style={{ maxHeight: '62vh' }}>
                  <GridProdutos
                    produtos={produtos}
                    onAdicionarAoCarrinho={adicionarAoCarrinho}
                    loading={loadingProdutos}
                  />
                </div>
              </div>
            </div>

            {/* Coluna lateral: cliente + carrinho + checkout */}
            <div className='col-12 col-lg-5 d-flex flex-column gap-3'>
              <SeletorCliente
                clienteSelecionado={clienteSelecionado}
                onClienteSelecionado={setClienteSelecionado}
                onBuscarClientes={buscarClientes}
              />
              <Carrinho
                itens={carrinho}
                onUpdateQuantidade={atualizarQuantidade}
                onRemoverItem={removerItem}
              />
              <Checkout
                itens={carrinho}
                cliente={clienteSelecionado}
                onFinalizarVenda={finalizarVenda}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
