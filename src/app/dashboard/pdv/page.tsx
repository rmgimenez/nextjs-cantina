'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
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

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto: Produto) => {
    if (!statusCaixa.caixaAberto) {
      alert('Abra o caixa antes de realizar vendas');
      return;
    }

    const itemExistente = carrinho.find((item) => item.id === produto.id);

    if (itemExistente) {
      if (itemExistente.quantidade >= produto.estoque) {
        alert('Quantidade solicitada excede o estoque disponível');
        return;
      }
      setCarrinho(
        carrinho.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      );
    } else {
      const novoItem: ItemCarrinho = {
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: 1,
        categoria: produto.categoria,
      };
      setCarrinho([...carrinho, novoItem]);
    }
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

      const dadosVenda = {
        tipoComprador,
        compradorId,
        formaPagamento,
        itens: carrinho.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          precoUnitario: item.preco,
        })),
      };

      const response = await fetch('/api/pdv/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosVenda),
      });

      const data = await response.json();

      if (data.ok) {
        alert(
          `Venda realizada com sucesso!\nVenda #${
            data.vendaId
          }\nTotal: R$ ${data.valorTotal.toFixed(2)}`
        );

        // Limpar carrinho e cliente
        setCarrinho([]);
        setClienteSelecionado(null);

        // Recarregar produtos e status do caixa
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
    <DashboardLayout title='PDV - Ponto de Venda' subtitle='Sistema de vendas da cantina'>
      <div className='space-y-6'>
        {/* Status do Caixa */}
        <ControleCaixa
          status={statusCaixa}
          onAtualizarStatus={carregarStatusCaixa}
          loading={loadingCaixa}
        />

        {statusCaixa.caixaAberto && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Área de Produtos */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Filtros e Busca */}
              <div className='bg-white border rounded-lg p-4'>
                <div className='flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4'>
                  <div className='flex-1'>
                    <div className='relative'>
                      <input
                        type='text'
                        value={buscaProduto}
                        onChange={(e) => setBuscaProduto(e.target.value)}
                        placeholder='Buscar produtos por nome ou código...'
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    </div>
                  </div>

                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Todas as categorias</option>
                    <option value='salgados'>Salgados</option>
                    <option value='doces'>Doces</option>
                    <option value='bebidas'>Bebidas</option>
                    <option value='refeicoes'>Refeições</option>
                  </select>

                  <button
                    onClick={() => buscarProdutos(buscaProduto, filtroCategoria)}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2'
                  >
                    <FiRefreshCw className='w-4 h-4' />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>

              {/* Grid de Produtos */}
              <div className='bg-white border rounded-lg p-4'>
                <h3 className='font-semibold text-lg mb-4'>Produtos Disponíveis</h3>
                <GridProdutos
                  produtos={produtos}
                  onAdicionarAoCarrinho={adicionarAoCarrinho}
                  loading={loadingProdutos}
                />
              </div>
            </div>

            {/* Área do Cliente e Carrinho */}
            <div className='space-y-6'>
              {/* Seletor de Cliente */}
              <SeletorCliente
                clienteSelecionado={clienteSelecionado}
                onClienteSelecionado={setClienteSelecionado}
                onBuscarClientes={buscarClientes}
              />

              {/* Carrinho */}
              <Carrinho
                itens={carrinho}
                onUpdateQuantidade={atualizarQuantidade}
                onRemoverItem={removerItem}
              />

              {/* Checkout */}
              <Checkout
                itens={carrinho}
                cliente={clienteSelecionado}
                onFinalizarVenda={finalizarVenda}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
