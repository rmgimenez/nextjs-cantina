'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatarMoeda } from '@/lib/formatters';
import { useEffect, useState } from 'react';

// Importando tipos e componentes
import {
  CategoriaFinanceira,
  ContaPagar,
  FiltrosContas,
  FormDataConta,
  FormDataPagamento,
  Pagamento,
  Pagination,
} from './types';

import ContaCard from '@/components/ui/conta-card';
import FiltrosContasPagar from './components/FiltrosContasPagar';
import ModalEditarConta from './components/ModalEditarConta';
import ModalEditarPagamento from './components/ModalEditarPagamento';
import ModalNovaConta from './components/ModalNovaConta';
import ModalPagamento from './components/ModalPagamento';
import ModalPagamentos from './components/ModalPagamentos';
import PaginacaoContasPagar from './components/PaginacaoContasPagar';

export default function ContasPagarPage() {
  // Estados principais
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosContas>({
    status: '',
    situacao: '',
    categoria_id: '',
    fornecedor: '',
    data_inicio: '',
    data_fim: '',
  });

  // Estados de paginação
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Estados dos modais
  const [showModalNovaConta, setShowModalNovaConta] = useState(false);
  const [showModalEditarConta, setShowModalEditarConta] = useState(false);
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [showModalPagamentos, setShowModalPagamentos] = useState(false);
  const [showModalEditarPagamento, setShowModalEditarPagamento] = useState(false);

  // Estados de dados dos modais
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagar | null>(null);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null);
  const [editData, setEditData] = useState<FormDataConta>({
    categoria_id: '',
    descricao: '',
    fornecedor: '',
    numero_documento: '',
    valor_original: '',
    data_emissao: '',
    data_vencimento: '',
    observacoes: '',
    parcelas: '',
    data_primeira_parcela: '',
  });
  const [pagamentoData, setPagamentoData] = useState<FormDataPagamento>({
    valor_pago: '',
    valor_desconto: '',
    valor_juros: '',
    data_pagamento: '',
    forma_pagamento: 'DINHEIRO',
    observacoes: '',
  });
  const [editPagamentoData, setEditPagamentoData] = useState<FormDataPagamento>({
    valor_pago: '',
    valor_desconto: '',
    valor_juros: '',
    data_pagamento: '',
    forma_pagamento: '',
    observacoes: '',
  });
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);

  // Carregar categorias
  useEffect(() => {
    carregarCategorias();
  }, []);

  // Carregar contas quando filtros ou paginação mudam
  useEffect(() => {
    carregarContas();
  }, [filtros, pagination.page, pagination.limit]);

  const carregarCategorias = async () => {
    try {
      const response = await fetch('/api/financeiro/categorias', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const carregarContas = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filtros).filter(([_, value]) => value !== '')),
      });

      const response = await fetch(`/api/financeiro/contas-pagar?${params}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setContas(data.contas);
        setPagination({
          ...pagination,
          total: data.total,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev,
        });
      } else {
        setError('Erro ao carregar contas');
      }
    } catch (error) {
      setError('Erro de conexão');
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAplicarFiltros = (novosFiltros: FiltrosContas) => {
    setFiltros(novosFiltros);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleLimparFiltros = () => {
    setFiltros({
      status: '',
      situacao: '',
      categoria_id: '',
      fornecedor: '',
      data_inicio: '',
      data_fim: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEditarConta = (conta: ContaPagar) => {
    setContaSelecionada(conta);
    // tenta obter categoria_id diretamente; se não existir, tenta casar pelo nome
    const rawCategoriaId = (conta as any).categoria_id ?? null;
    let categoriaId = '';
    if (rawCategoriaId) {
      categoriaId = String(rawCategoriaId);
    } else if (conta.categoria_nome) {
      const cat = categorias.find((c) => c.nome === conta.categoria_nome);
      categoriaId = cat ? String(cat.id) : '';
    }

    const formatDate = (d?: string) => {
      if (!d) return '';
      try {
        return new Date(d).toISOString().split('T')[0];
      } catch (e) {
        return '';
      }
    };

    setEditData({
      categoria_id: categoriaId,
      descricao: conta.descricao,
      fornecedor: conta.fornecedor || '',
      numero_documento: conta.numero_documento || '',
      valor_original: conta.valor_original.toString(),
      data_emissao: formatDate(conta.data_emissao),
      data_vencimento: formatDate(conta.data_vencimento),
      observacoes: (conta as any).observacoes || '',
      parcelas: '',
      data_primeira_parcela: '',
    });
    setShowModalEditarConta(true);
  };

  const handleExcluirConta = async (conta: ContaPagar) => {
    const valor = formatarMoeda((conta as any).valor_pendente ?? 0);
    if (confirm(`Tem certeza que deseja excluir esta conta? Valor pendente: ${valor}`)) {
      try {
        const response = await fetch(`/api/financeiro/contas-pagar/${conta.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          carregarContas();
        } else {
          alert('Erro ao excluir conta');
        }
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        alert('Erro ao excluir conta');
      }
    }
  };

  const handlePagarConta = (conta: ContaPagar) => {
    const valorPendente = isNaN(conta.valor_pendente) ? 0 : conta.valor_pendente;
    setContaSelecionada(conta);
    setPagamentoData({
      valor_pago: Math.max(0, valorPendente).toString(),
      valor_desconto: '',
      valor_juros: '',
      data_pagamento: new Date().toISOString().split('T')[0],
      forma_pagamento: 'DINHEIRO',
      observacoes: '',
    });
    setShowModalPagamento(true);
  };

  const handleVerPagamentos = async (conta: ContaPagar) => {
    setContaSelecionada(conta);
    try {
      const response = await fetch(`/api/financeiro/contas-pagar/${conta.id}/pagamentos`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPagamentos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      setPagamentos([]);
    }
    setShowModalPagamentos(true);
  };

  const handleEditarPagamento = (pagamento: Pagamento) => {
    setPagamentoSelecionado(pagamento);
    setEditPagamentoData({
      valor_pago: pagamento.valor_pago.toString(),
      valor_desconto: pagamento.valor_desconto.toString(),
      valor_juros: pagamento.valor_juros.toString(),
      data_pagamento: pagamento.data_pagamento,
      forma_pagamento: pagamento.forma_pagamento,
      observacoes: pagamento.observacoes || '',
    });
    setShowModalEditarPagamento(true);
  };

  const handleExcluirPagamento = async (pagamento: Pagamento) => {
    if (!contaSelecionada) return;
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return;
    try {
      const response = await fetch(
        `/api/financeiro/contas-pagar/${contaSelecionada.id}/pagamentos/${pagamento.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (response.ok) {
        // recarrega pagamentos da conta
        const res = await fetch(`/api/financeiro/contas-pagar/${contaSelecionada.id}/pagamentos`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setPagamentos(data);
        }
        carregarContas();
      } else {
        const errorData = await response.json();
        alert(`Erro ao excluir pagamento: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      alert('Erro ao excluir pagamento');
    }
  };

  const handleNovaConta = () => {
    setEditData({
      categoria_id: '',
      descricao: '',
      fornecedor: '',
      numero_documento: '',
      valor_original: '',
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: '',
      observacoes: '',
      parcelas: '',
      data_primeira_parcela: '',
    });
    setShowModalNovaConta(true);
  };

  const handleSubmitNovaConta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/financeiro/contas-pagar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setShowModalNovaConta(false);
        carregarContas();
      } else {
        alert('Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      alert('Erro ao criar conta');
    }
  };

  const handleSubmitEditarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaSelecionada) return;

    try {
      const response = await fetch(`/api/financeiro/contas-pagar/${contaSelecionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setShowModalEditarConta(false);
        setContaSelecionada(null);
        carregarContas();
      } else {
        alert('Erro ao editar conta');
      }
    } catch (error) {
      console.error('Erro ao editar conta:', error);
      alert('Erro ao editar conta');
    }
  };

  const handleSubmitPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaSelecionada) return;

    // Validação básica no frontend
    if (!pagamentoData.valor_pago || parseFloat(pagamentoData.valor_pago) <= 0) {
      alert('Valor pago deve ser maior que zero');
      return;
    }
    if (!pagamentoData.data_pagamento) {
      alert('Data do pagamento é obrigatória');
      return;
    }
    if (!pagamentoData.forma_pagamento) {
      alert('Forma de pagamento é obrigatória');
      return;
    }

    try {
      const response = await fetch(
        `/api/financeiro/contas-pagar/${contaSelecionada.id}/pagamentos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(pagamentoData),
        }
      );
      if (response.ok) {
        setShowModalPagamento(false);
        setContaSelecionada(null);
        carregarContas();
      } else {
        const errorData = await response.json();
        alert(`Erro ao registrar pagamento: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento');
    }
  };

  const handleSubmitEditarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagamentoSelecionado) return;
    if (!contaSelecionada) {
      alert('Conta não selecionada. Reabra a lista de pagamentos e tente novamente.');
      return;
    }

    try {
      const response = await fetch(
        `/api/financeiro/contas-pagar/${contaSelecionada.id}/pagamentos/${pagamentoSelecionado.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(editPagamentoData),
        }
      );
      if (response.ok) {
        setShowModalEditarPagamento(false);
        setPagamentoSelecionado(null);
        // recarrega pagamentos caso modal de pagamentos esteja aberto
        if (showModalPagamentos && contaSelecionada) {
          const res = await fetch(
            `/api/financeiro/contas-pagar/${contaSelecionada.id}/pagamentos`,
            {
              credentials: 'include',
            }
          );
          if (res.ok) {
            const data = await res.json();
            setPagamentos(data);
          }
        }
        carregarContas();
      } else {
        const errorData = await response.json();
        alert(`Erro ao editar pagamento: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao editar pagamento:', error);
      alert('Erro ao editar pagamento');
    }
  };

  const handleCloseModal = () => {
    setShowModalNovaConta(false);
    setShowModalEditarConta(false);
    setShowModalPagamento(false);
    setShowModalPagamentos(false);
    setShowModalEditarPagamento(false);
    setContaSelecionada(null);
    setPagamentoSelecionado(null);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='h3 mb-0'>Contas a Pagar</h1>
        <Button onClick={handleNovaConta} className='btn btn-primary'>
          Nova Conta
        </Button>
      </div>

      <Card className='mb-4'>
        <div className='card-body'>
          <FiltrosContasPagar filtros={filtros} setFiltros={setFiltros} categorias={categorias} />
          <div className='d-flex gap-2 mt-3'>
            <Button onClick={() => handleAplicarFiltros(filtros)} className='btn btn-primary'>
              Aplicar Filtros
            </Button>
            <Button
              onClick={handleLimparFiltros}
              variant='outline'
              className='btn btn-outline-secondary'
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className='card-body'>
          {loading ? (
            <div className='text-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Carregando...</span>
              </div>
              <p className='mt-2 text-muted'>Carregando contas...</p>
            </div>
          ) : error ? (
            <div className='text-center py-5'>
              <p className='text-danger'>{error}</p>
              <Button
                onClick={carregarContas}
                variant='outline'
                className='btn btn-outline-primary'
              >
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Lista em cards para melhor espaçamento */}
              <div className='mb-3'>
                {contas.length === 0 && (
                  <div className='text-center py-5'>
                    <p className='text-muted'>Nenhuma conta encontrada</p>
                  </div>
                )}

                {contas.map((c) => (
                  <ContaCard
                    key={c.id}
                    id={c.id}
                    descricao={c.descricao}
                    categoria={(c as any).categoria_nome}
                    documento={c.numero_documento}
                    participante={c.fornecedor}
                    valor_original={c.valor_original}
                    valor_pendente={(c as any).valor_pendente}
                    data_emissao={c.data_emissao}
                    data_vencimento={c.data_vencimento}
                    situacao={(c as any).situacao}
                    status={c.status}
                    onEditar={() => handleEditarConta(c)}
                    onExcluir={() => handleExcluirConta(c)}
                    onAcaoPrincipal={() => handlePagarConta(c)}
                    onVerLancamentos={() => handleVerPagamentos(c)}
                  />
                ))}

                {contas.length > 0 && (
                  <div className='mt-4'>
                    <PaginacaoContasPagar pagination={pagination} setPagination={setPagination} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Modais */}
      <ModalNovaConta
        show={showModalNovaConta}
        onClose={handleCloseModal}
        formData={editData}
        setFormData={setEditData}
        categorias={categorias}
        onSubmit={handleSubmitNovaConta}
      />

      <ModalEditarConta
        show={showModalEditarConta}
        onClose={handleCloseModal}
        conta={contaSelecionada}
        editData={editData}
        setEditData={setEditData}
        categorias={categorias}
        onSubmit={handleSubmitEditarConta}
      />

      <ModalPagamento
        show={showModalPagamento}
        onClose={handleCloseModal}
        conta={contaSelecionada}
        pagamentoData={pagamentoData}
        setPagamentoData={setPagamentoData}
        onSubmit={handleSubmitPagamento}
      />

      <ModalPagamentos
        show={showModalPagamentos}
        onClose={handleCloseModal}
        conta={contaSelecionada}
        pagamentos={pagamentos}
        onEditar={handleEditarPagamento}
        onExcluir={handleExcluirPagamento}
      />

      <ModalEditarPagamento
        show={showModalEditarPagamento}
        onClose={handleCloseModal}
        pagamento={pagamentoSelecionado}
        editPagamentoData={editPagamentoData}
        setEditPagamentoData={setEditPagamentoData}
        onSubmit={handleSubmitEditarPagamento}
      />
    </div>
  );
}
