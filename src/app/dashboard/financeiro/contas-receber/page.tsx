'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

// Importando tipos e componentes
import {
  CategoriaFinanceira,
  ContaReceber,
  FiltrosContas,
  FormDataConta,
  FormDataRecebimento,
  Pagination,
  Recebimento,
} from './types';

import FiltrosContasReceber from './components/FiltrosContasReceber';
import ModalEditarConta from './components/ModalEditarConta';
import ModalEditarRecebimento from './components/ModalEditarRecebimento';
import ModalNovaConta from './components/ModalNovaConta';
import ModalRecebimento from './components/ModalRecebimento';
import ModalRecebimentos from './components/ModalRecebimentos';
import PaginacaoContasReceber from './components/PaginacaoContasReceber';
import TabelaContasReceber from './components/TabelaContasReceber';

export default function ContasReceberPage() {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosContas>({
    status: '',
    situacao: '',
    categoria_id: '',
    cliente: '',
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

  // Estados de modais
  const [showNovaConta, setShowNovaConta] = useState(false);
  const [showEditarConta, setShowEditarConta] = useState(false);
  const [showRecebimento, setShowRecebimento] = useState(false);
  const [showRecebimentos, setShowRecebimentos] = useState(false);
  const [showEditarRecebimento, setShowEditarRecebimento] = useState(false);

  // Estados de dados dos formulários
  const [formData, setFormData] = useState<FormDataConta>({
    categoria_id: '',
    descricao: '',
    cliente: '',
    numero_documento: '',
    valor_original: '',
    data_emissao: '',
    data_vencimento: '',
    observacoes: '',
    parcelas: '1',
    data_primeira_parcela: '',
  });

  const [recebimentoData, setRecebimentoData] = useState<FormDataRecebimento>({
    valor_recebido: '',
    valor_desconto: '0',
    valor_juros: '0',
    data_recebimento: new Date().toISOString().split('T')[0],
    forma_recebimento: 'DINHEIRO',
    observacoes: '',
  });

  // Estados de seleção
  const [contaSelecionada, setContaSelecionada] = useState<ContaReceber | null>(null);
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState<Recebimento | null>(null);

  useEffect(() => {
    carregarCategorias();
    carregarContas();
  }, [filtros, pagination.page]);

  const carregarCategorias = async () => {
    try {
      const response = await fetch('/api/financeiro/categorias?tipo=RECEITA', {
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
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v)),
      });

      const response = await fetch(`/api/financeiro/contas-receber?${params}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setContas(data.contas);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarRecebimentos = async (contaId: number) => {
    try {
      const response = await fetch(`/api/financeiro/contas-receber/${contaId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setRecebimentos(data.recebimentos || []);
      } else {
        console.error('Erro ao carregar recebimentos');
        setRecebimentos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar recebimentos:', error);
      setRecebimentos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/financeiro/contas-receber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          valor_original: parseFloat(formData.valor_original),
          parcelas: parseInt(formData.parcelas),
        }),
      });

      if (response.ok) {
        await carregarContas();
        setShowNovaConta(false);
        setFormData({
          categoria_id: '',
          descricao: '',
          cliente: '',
          numero_documento: '',
          valor_original: '',
          data_emissao: '',
          data_vencimento: '',
          observacoes: '',
          parcelas: '1',
          data_primeira_parcela: '',
        });
        alert('Conta criada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta');
    }
  };

  const handleRecebimento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contaSelecionada) return;

    try {
      const response = await fetch(
        `/api/financeiro/contas-receber/${contaSelecionada.id}/recebimentos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...recebimentoData,
            valor_recebido: parseFloat(recebimentoData.valor_recebido),
            valor_desconto: parseFloat(recebimentoData.valor_desconto),
            valor_juros: parseFloat(recebimentoData.valor_juros),
          }),
        }
      );

      if (response.ok) {
        await carregarContas();
        setShowRecebimento(false);
        setContaSelecionada(null);
        setRecebimentoData({
          valor_recebido: '',
          valor_desconto: '0',
          valor_juros: '0',
          data_recebimento: new Date().toISOString().split('T')[0],
          forma_recebimento: 'DINHEIRO',
          observacoes: '',
        });
        alert('Recebimento registrado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao registrar recebimento');
      }
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      alert('Erro ao registrar recebimento');
    }
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contaSelecionada) return;

    try {
      const response = await fetch(`/api/financeiro/contas-receber/${contaSelecionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          valor_original: parseFloat(formData.valor_original),
        }),
      });

      if (response.ok) {
        await carregarContas();
        setShowEditarConta(false);
        setContaSelecionada(null);
        alert('Conta editada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao editar conta');
      }
    } catch (error) {
      console.error('Erro ao editar conta:', error);
      alert('Erro ao editar conta');
    }
  };

  const handleEditarRecebimento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recebimentoSelecionado) return;

    try {
      const response = await fetch(
        `/api/financeiro/contas-receber/recebimentos/${recebimentoSelecionado.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...recebimentoData,
            valor_recebido: parseFloat(recebimentoData.valor_recebido),
            valor_desconto: parseFloat(recebimentoData.valor_desconto),
            valor_juros: parseFloat(recebimentoData.valor_juros),
          }),
        }
      );

      if (response.ok) {
        // Recarregar recebimentos da conta
        if (contaSelecionada) {
          // Implementar carregamento de recebimentos
        }
        setShowEditarRecebimento(false);
        setRecebimentoSelecionado(null);
        alert('Recebimento editado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao editar recebimento');
      }
    } catch (error) {
      console.error('Erro ao editar recebimento:', error);
      alert('Erro ao editar recebimento');
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='d-flex justify-content-center'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='h2 mb-0'>Contas a Receber</h1>
        <div className='d-flex gap-2'>
          <a href='/dashboard/financeiro' className='btn btn-outline-secondary'>
            ← Voltar
          </a>
          <Button onClick={() => setShowNovaConta(true)}>Nova Conta</Button>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosContasReceber filtros={filtros} setFiltros={setFiltros} categorias={categorias} />

      {/* Lista de Contas */}
      <TabelaContasReceber
        contas={contas}
        onEditar={(conta) => {
          setContaSelecionada(conta);
          setFormData({
            categoria_id: '',
            descricao: conta.descricao,
            cliente: conta.cliente || '',
            numero_documento: conta.numero_documento || '',
            valor_original: conta.valor_original.toString(),
            data_emissao: conta.data_emissao,
            data_vencimento: conta.data_vencimento,
            observacoes: '',
            parcelas: '1',
            data_primeira_parcela: '',
          });
          setShowEditarConta(true);
        }}
        onExcluir={(conta) => {
          if (confirm(`Deseja realmente excluir a conta "${conta.descricao}"?`)) {
            // Implementar exclusão
          }
        }}
        onReceber={(conta) => {
          setContaSelecionada(conta);
          setRecebimentoData({
            ...recebimentoData,
            valor_recebido: conta.valor_pendente.toString(),
          });
          setShowRecebimento(true);
        }}
        onVerRecebimentos={(conta) => {
          setContaSelecionada(conta);
          carregarRecebimentos(conta.id);
          setShowRecebimentos(true);
        }}
      />

      {/* Paginação */}
      <PaginacaoContasReceber pagination={pagination} setPagination={setPagination} />

      {/* Modal de Nova Conta */}
      <ModalNovaConta
        show={showNovaConta}
        onClose={() => setShowNovaConta(false)}
        formData={formData}
        setFormData={setFormData}
        categorias={categorias}
        onSubmit={handleSubmit}
      />

      {/* Modal de Editar Conta */}
      <ModalEditarConta
        show={showEditarConta}
        onClose={() => setShowEditarConta(false)}
        formData={formData}
        setFormData={setFormData}
        categorias={categorias}
        onSubmit={handleEditar}
      />

      {/* Modal de Recebimento */}
      <ModalRecebimento
        show={showRecebimento}
        onClose={() => setShowRecebimento(false)}
        conta={contaSelecionada}
        recebimentoData={recebimentoData}
        setRecebimentoData={setRecebimentoData}
        onSubmit={handleRecebimento}
      />

      {/* Modal de Recebimentos */}
      <ModalRecebimentos
        show={showRecebimentos}
        onClose={() => setShowRecebimentos(false)}
        conta={contaSelecionada}
        recebimentos={recebimentos}
        onEditar={(recebimento: Recebimento) => {
          setRecebimentoSelecionado(recebimento);
          setRecebimentoData({
            valor_recebido: recebimento.valor_recebido.toString(),
            valor_desconto: recebimento.valor_desconto.toString(),
            valor_juros: recebimento.valor_juros.toString(),
            data_recebimento: recebimento.data_recebimento,
            forma_recebimento: recebimento.forma_recebimento,
            observacoes: recebimento.observacoes || '',
          });
          setShowEditarRecebimento(true);
        }}
        onExcluir={(recebimento: Recebimento) => {
          if (confirm('Deseja realmente excluir este recebimento?')) {
            // Implementar exclusão
          }
        }}
      />

      {/* Modal de Editar Recebimento */}
      <ModalEditarRecebimento
        show={showEditarRecebimento}
        onClose={() => setShowEditarRecebimento(false)}
        recebimento={recebimentoSelecionado}
        recebimentoData={recebimentoData}
        setRecebimentoData={setRecebimentoData}
        onSubmit={handleEditarRecebimento}
      />
    </div>
  );
}
