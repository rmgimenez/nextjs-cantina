'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatarMoeda } from '@/lib/formatters';
import { useCallback, useEffect, useMemo, useOptimistic, useState, useTransition } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash,
  FiTrendingDown,
  FiXCircle,
} from 'react-icons/fi';

interface TipoProduto {
  id: number;
  descricao: string;
  codigo: string;
  exige_peso: number;
  ativo: number;
}

interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco_unitario: number;
  codigo_barra?: string;
  estoque_minimo?: number;
  ativo: number;
  tipo_descricao: string;
  tipo_codigo: string;
  estoque_atual: number;
}

interface Props {
  initialProdutos: Produto[];
  initialTipos: TipoProduto[];
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

// Helper seguro para formatar preços
function formatCurrency(value: any): string {
  const n = Number(value);
  if (Number.isNaN(n)) return 'R$ 0,00';
  return formatarMoeda(n);
}

// Helper para formatar números
function formatNumber(value: any): string {
  const n = Number(value);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

type OptimisticAction =
  | { type: 'add-produto'; produto: Produto }
  | { type: 'update-produto'; id: number; patch: Partial<Produto> }
  | { type: 'delete-produto'; id: number }
  | { type: 'toggle-ativo'; id: number; ativo: number };

type SortField = 'nome' | 'tipo_descricao' | 'preco_unitario' | 'estoque_atual';
type SortDirection = 'asc' | 'desc';

export default function ProdutosClient({ initialProdutos, initialTipos }: Props) {
  // Estados principais
  const [tipos, setTipos] = useState<TipoProduto[]>(initialTipos);
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [isPending, startTransition] = useTransition();

  // Estados de UI
  const [showFormProduto, setShowFormProduto] = useState(false);
  const [showFormTipo, setShowFormTipo] = useState(false);
  const [showFormMov, setShowFormMov] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  // Estados de busca e filtros
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [showFiltros, setShowFiltros] = useState(false);

  // Estados de paginação e ordenação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Estados de formulário
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de notificações
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [optimisticProdutos, applyOptimistic] = useOptimistic<Produto[], OptimisticAction>(
    produtos,
    (state, action) => {
      switch (action.type) {
        case 'add-produto':
          return [action.produto, ...state];
        case 'update-produto':
          return state.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p));
        case 'delete-produto':
          return state.filter((p) => p.id !== action.id);
        case 'toggle-ativo':
          return state.map((p) => (p.id === action.id ? { ...p, ativo: action.ativo } : p));
        default:
          return state;
      }
    }
  );

  // Função para adicionar toast
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Função para remover toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Função para validar formulário
  const validateForm = useCallback(
    (formData: FormData, isTipo: boolean = false): FormErrors => {
      const errors: FormErrors = {};

      if (isTipo) {
        const descricao = formData.get('descricao')?.toString().trim();
        const codigo = formData.get('codigo')?.toString().trim();

        if (!descricao || descricao.length < 2) {
          errors.descricao = 'Descrição deve ter pelo menos 2 caracteres';
        }
        if (!codigo || codigo.length < 2) {
          errors.codigo = 'Código deve ter pelo menos 2 caracteres';
        }
        if (
          codigo &&
          tipos.some(
            (t) => t.codigo.toLowerCase() === codigo.toLowerCase() && t.id !== selectedProduto?.id
          )
        ) {
          errors.codigo = 'Este código já está em uso';
        }
      } else {
        const nome = formData.get('nome')?.toString().trim();
        const preco = Number(formData.get('preco'));
        const tipoId = Number(formData.get('tipoId'));

        if (!nome || nome.length < 2) {
          errors.nome = 'Nome deve ter pelo menos 2 caracteres';
        }
        if (Number.isNaN(preco) || preco < 0) {
          errors.preco = 'Preço deve ser um valor positivo';
        }
        if (!selectedProduto && !tipoId) {
          errors.tipoId = 'Tipo de produto é obrigatório';
        }
      }

      return errors;
    },
    [tipos, selectedProduto]
  );

  // Filtragem e ordenação dos produtos
  const filteredAndSorted = useMemo(() => {
    let filtered = optimisticProdutos.filter((p) => {
      const matchesSearch =
        !search ||
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.codigo_barra || '').includes(search) ||
        p.tipo_descricao.toLowerCase().includes(search.toLowerCase());

      const matchesTipo = !filtroTipo || p.tipo_descricao === filtroTipo;

      const matchesStatus =
        !filtroStatus ||
        (filtroStatus === 'ativo' && p.ativo === 1) ||
        (filtroStatus === 'inativo' && p.ativo === 0) ||
        (filtroStatus === 'baixo_estoque' && p.estoque_atual <= (p.estoque_minimo ?? 0)) ||
        (filtroStatus === 'sem_estoque' && p.estoque_atual === 0);

      return matchesSearch && matchesTipo && matchesStatus;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [optimisticProdutos, search, filtroTipo, filtroStatus, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedProdutos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  // Função para mudar ordenação
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    },
    [sortField, sortDirection]
  );

  // Funções de reload
  const reloadProdutos = useCallback(async () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/produtos');
        if (res.ok) {
          const data = await res.json();
          setProdutos(data.produtos);
          addToast('success', 'Produtos atualizados com sucesso');
        } else {
          addToast('error', 'Erro ao carregar produtos');
        }
      } catch (error) {
        addToast('error', 'Erro de conexão ao carregar produtos');
      }
    });
  }, [addToast]);

  const reloadTipos = useCallback(async () => {
    try {
      const res = await fetch('/api/produtos/tipos');
      if (res.ok) {
        const data = await res.json();
        setTipos(data.tipos);
      } else {
        addToast('error', 'Erro ao carregar tipos de produto');
      }
    } catch (error) {
      addToast('error', 'Erro de conexão ao carregar tipos');
    }
  }, [addToast]);

  // Efeito para carregar tipos se necessário
  useEffect(() => {
    if (!tipos || tipos.length === 0) {
      reloadTipos();
    }
  }, [tipos, reloadTipos]);

  // Handlers de formulário
  async function handleCreateTipo(form: FormData) {
    const errors = validateForm(form, true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const descricao = form.get('descricao')?.toString().trim();
      const codigo = form.get('codigo')?.toString().trim();
      const exige_peso = form.get('exige_peso') === 'on';

      const res = await fetch('/api/produtos/tipos', {
        method: 'POST',
        body: JSON.stringify({ descricao, codigo, exigePeso: exige_peso }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        await reloadTipos();
        setShowFormTipo(false);
        addToast('success', 'Tipo de produto criado com sucesso');
      } else {
        const error = await res.json();
        addToast('error', error.message || 'Erro ao criar tipo de produto');
      }
    } catch (error) {
      addToast('error', 'Erro de conexão ao criar tipo');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateProduto(form: FormData) {
    const errors = validateForm(form, false);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const tipoId = Number(form.get('tipoId'));
      const nome = form.get('nome')?.toString().trim() || '';
      const precoUnitario = Number(form.get('preco'));
      const codigoBarra = form.get('codigo_barra')?.toString().trim() || undefined;
      const estoqueMinimo = form.get('estoque_minimo') ? Number(form.get('estoque_minimo')) : 0;

      const tempId = Date.now() * -1;
      const tipo = tipos.find((t) => t.id === tipoId)!;

      applyOptimistic({
        type: 'add-produto',
        produto: {
          id: tempId,
          nome,
          preco_unitario: precoUnitario || 0,
          codigo_barra: codigoBarra,
          estoque_minimo: estoqueMinimo,
          ativo: 1,
          descricao: '',
          tipo_descricao: tipo.descricao,
          tipo_codigo: tipo.codigo,
          estoque_atual: 0,
        },
      });

      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoId,
          nome,
          precoUnitario,
          codigoBarra,
          estoqueMinimo,
        }),
      });

      if (res.ok) {
        await reloadProdutos();
        setShowFormProduto(false);
        addToast('success', 'Produto criado com sucesso');
      } else {
        await reloadProdutos(); // Reverte optimistic update
        const error = await res.json();
        addToast('error', error.message || 'Erro ao criar produto');
      }
    } catch (error) {
      await reloadProdutos(); // Reverte optimistic update
      addToast('error', 'Erro de conexão ao criar produto');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditProduto(form: FormData) {
    if (!selectedProduto) return;

    const errors = validateForm(form, false);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const patch: any = {};
      const nome = form.get('nome')?.toString().trim();
      if (nome) patch.nome = nome;
      const preco = form.get('preco');
      if (preco) patch.preco_unitario = Number(preco);
      const estoqueMinimo = form.get('estoque_minimo');
      if (estoqueMinimo !== undefined) patch.estoque_minimo = Number(estoqueMinimo);

      applyOptimistic({
        type: 'update-produto',
        id: selectedProduto.id,
        patch,
      });

      const res = await fetch('/api/produtos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedProduto.id, ...patch }),
      });

      if (res.ok) {
        await reloadProdutos();
        setSelectedProduto(null);
        setShowFormProduto(false);
        addToast('success', 'Produto atualizado com sucesso');
      } else {
        await reloadProdutos(); // Reverte optimistic update
        const error = await res.json();
        addToast('error', error.message || 'Erro ao atualizar produto');
      }
    } catch (error) {
      await reloadProdutos(); // Reverte optimistic update
      addToast('error', 'Erro de conexão ao atualizar produto');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProduto(id: number) {
    setIsSubmitting(true);
    try {
      applyOptimistic({ type: 'delete-produto', id });

      const res = await fetch('/api/produtos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setShowConfirmDelete(null);
        addToast('success', 'Produto excluído com sucesso');
      } else {
        await reloadProdutos(); // Reverte optimistic update
        const error = await res.json();
        addToast('error', error.message || 'Erro ao excluir produto');
      }
    } catch (error) {
      await reloadProdutos(); // Reverte optimistic update
      addToast('error', 'Erro de conexão ao excluir produto');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleAtivo(id: number, ativo: number) {
    applyOptimistic({ type: 'toggle-ativo', id, ativo });

    try {
      const res = await fetch('/api/produtos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo }),
      });

      if (!res.ok) {
        await reloadProdutos(); // Reverte optimistic update
        addToast('error', 'Erro ao alterar status do produto');
      } else {
        addToast('success', `Produto ${ativo ? 'ativado' : 'desativado'} com sucesso`);
      }
    } catch (error) {
      await reloadProdutos(); // Reverte optimistic update
      addToast('error', 'Erro de conexão');
    }
  }

  async function handleMovimentacao(form: FormData) {
    const produtoId = Number(form.get('produtoId'));
    const tipoMov = form.get('tipo_mov')?.toString();
    const quantidade = Number(form.get('quantidade'));
    const observacao = form.get('observacao')?.toString().trim();

    if (!produtoId || !tipoMov || !quantidade) {
      addToast('warning', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const mult = ['ENTRADA', 'AJUSTE_POSITIVO'].includes(tipoMov) ? 1 : -1;
      applyOptimistic({
        type: 'update-produto',
        id: produtoId,
        patch: {
          estoque_atual:
            (optimisticProdutos.find((p) => p.id === produtoId)?.estoque_atual || 0) +
            mult * quantidade,
        },
      });

      const res = await fetch('/api/estoque/movimentacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoId, tipoMov, quantidade, observacao }),
      });

      if (res.ok) {
        await reloadProdutos();
        setShowFormMov(false);
        addToast('success', 'Movimentação registrada com sucesso');
      } else {
        await reloadProdutos(); // Reverte optimistic update
        const error = await res.json();
        addToast('error', error.message || 'Erro ao registrar movimentação');
      }
    } catch (error) {
      await reloadProdutos(); // Reverte optimistic update
      addToast('error', 'Erro de conexão ao registrar movimentação');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Função para obter badge de status
  function getStatusBadge(stock: number, estoqueMinimo?: number, ativo?: number) {
    if (ativo === 0) {
      return <span className='badge bg-secondary'>Inativo</span>;
    }
    if (stock === 0) {
      return <span className='badge bg-danger'>Sem Estoque</span>;
    }
    if (stock <= (estoqueMinimo ?? 0)) {
      return <span className='badge bg-warning text-dark'>Baixo</span>;
    }
    return <span className='badge bg-success'>OK</span>;
  }

  // Função para obter ícone de ordenação
  function getSortIcon(field: SortField) {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            if (!showFormProduto && !showFormTipo && !showFormMov) {
              setShowFormProduto(true);
            }
            break;
          case 't':
            e.preventDefault();
            if (!showFormProduto && !showFormTipo && !showFormMov) {
              setShowFormTipo(true);
            }
            break;
          case 'r':
            e.preventDefault();
            reloadProdutos();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFormProduto, showFormTipo, showFormMov, reloadProdutos]);

  return (
    <div className='space-y-4'>
      {/* Toast Notifications */}
      <div className='position-fixed top-0 end-0 p-3' style={{ zIndex: 1050 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast show align-items-center text-white bg-${
              toast.type === 'error'
                ? 'danger'
                : toast.type === 'warning'
                ? 'warning'
                : toast.type === 'success'
                ? 'success'
                : 'info'
            } border-0`}
            role='alert'
          >
            <div className='d-flex'>
              <div className='toast-body'>
                {toast.type === 'success' && <FiCheckCircle className='me-2' />}
                {toast.type === 'error' && <FiXCircle className='me-2' />}
                {toast.type === 'warning' && <FiAlertTriangle className='me-2' />}
                {toast.type === 'info' && <FiInfo className='me-2' />}
                {toast.message}
              </div>
              <button
                type='button'
                className='btn-close btn-close-white me-2 m-auto'
                onClick={() => removeToast(toast.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Header com ações */}
      <div className='d-flex flex-wrap gap-2 align-items-center justify-content-between'>
        <div className='d-flex flex-wrap gap-2 align-items-center flex-grow-1'>
          <div style={{ minWidth: 250 }}>
            <Input
              placeholder='Buscar produtos...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              icon={<FiSearch />}
            />
          </div>
          <Button
            variant='outline'
            icon={showFiltros ? <FiEyeOff /> : <FiEye />}
            onClick={() => setShowFiltros(!showFiltros)}
          >
            {showFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>

        <div className='d-flex flex-wrap gap-2 align-items-center'>
          <Button
            variant='secondary'
            icon={<FiPlus />}
            onClick={() => setShowFormTipo(true)}
            title='Novo Tipo (Ctrl+T)'
          >
            Novo Tipo
          </Button>
          <Button
            variant='primary'
            icon={<FiPlus />}
            onClick={() => setShowFormProduto(true)}
            title='Novo Produto (Ctrl+N)'
          >
            Novo Produto
          </Button>
          <Button variant='success' icon={<FiTrendingDown />} onClick={() => setShowFormMov(true)}>
            Movimentação
          </Button>
          <Button
            variant='outline'
            icon={<FiRefreshCw />}
            loading={isPending}
            onClick={reloadProdutos}
            title='Atualizar (Ctrl+R)'
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros avançados */}
      {showFiltros && (
        <Card>
          <CardContent className='pt-3'>
            <div className='row g-3'>
              <div className='col-md-4'>
                <label className='form-label'>Tipo de Produto</label>
                <select
                  className='form-select'
                  value={filtroTipo}
                  onChange={(e) => {
                    setFiltroTipo(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value=''>Todos os tipos</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.descricao}>
                      {t.descricao}
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-md-4'>
                <label className='form-label'>Status</label>
                <select
                  className='form-select'
                  value={filtroStatus}
                  onChange={(e) => {
                    setFiltroStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value=''>Todos os status</option>
                  <option value='ativo'>Ativo</option>
                  <option value='inativo'>Inativo</option>
                  <option value='baixo_estoque'>Baixo Estoque</option>
                  <option value='sem_estoque'>Sem Estoque</option>
                </select>
              </div>
              <div className='col-md-4 d-flex align-items-end'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearch('');
                    setFiltroTipo('');
                    setFiltroStatus('');
                    setCurrentPage(1);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de estatísticas */}
      <div className='row g-3'>
        <div className='col-sm-6 col-md-3'>
          <Card>
            <CardContent className='pt-3'>
              <div className='d-flex align-items-center'>
                <FiPackage className='text-primary me-2' size={24} />
                <div>
                  <p className='text-muted mb-1 small'>Total de Produtos</p>
                  <h5 className='mb-0'>{filteredAndSorted.length}</h5>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='col-sm-6 col-md-3'>
          <Card>
            <CardContent className='pt-3'>
              <div className='d-flex align-items-center'>
                <FiTrendingDown className='text-warning me-2' size={24} />
                <div>
                  <p className='text-muted mb-1 small'>Baixo Estoque</p>
                  <h5 className='mb-0'>
                    {
                      filteredAndSorted.filter((p) => p.estoque_atual <= (p.estoque_minimo ?? 0))
                        .length
                    }
                  </h5>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='col-sm-6 col-md-3'>
          <Card>
            <CardContent className='pt-3'>
              <div className='d-flex align-items-center'>
                <FiXCircle className='text-danger me-2' size={24} />
                <div>
                  <p className='text-muted mb-1 small'>Sem Estoque</p>
                  <h5 className='mb-0'>
                    {filteredAndSorted.filter((p) => p.estoque_atual === 0).length}
                  </h5>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='col-sm-6 col-md-3'>
          <Card>
            <CardContent className='pt-3'>
              <div className='d-flex align-items-center'>
                <FiDollarSign className='text-success me-2' size={24} />
                <div>
                  <p className='text-muted mb-1 small'>Valor Total</p>
                  <h5 className='mb-0'>
                    R${' '}
                    {formatCurrency(
                      filteredAndSorted.reduce(
                        (acc, p) => acc + Number(p.preco_unitario) * Number(p.estoque_atual),
                        0
                      )
                    )}
                  </h5>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabela de produtos */}
      <Card>
        <CardHeader>
          <div className='d-flex justify-content-between align-items-center'>
            <CardTitle>Produtos ({filteredAndSorted.length})</CardTitle>
            <div className='text-muted small'>
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className='d-none d-md-block'>
            <div className='table-responsive'>
              <table className='table table-hover align-middle'>
                <thead className='table-light'>
                  <tr>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nome')}>
                      Produto {getSortIcon('nome')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('tipo_descricao')}>
                      Tipo {getSortIcon('tipo_descricao')}
                    </th>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('preco_unitario')}
                      className='text-end'
                    >
                      Preço {getSortIcon('preco_unitario')}
                    </th>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('estoque_atual')}
                      className='text-center'
                    >
                      Estoque {getSortIcon('estoque_atual')}
                    </th>
                    <th className='text-center'>Status</th>
                    <th className='text-center' style={{ width: 180 }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProdutos.map((p) => (
                    <tr key={p.id} className={p.id < 0 ? 'opacity-50' : ''}>
                      <td>
                        <div>
                          <strong>{p.nome}</strong>
                          {p.codigo_barra && (
                            <div className='text-muted small'>Cod: {p.codigo_barra}</div>
                          )}
                        </div>
                      </td>
                      <td>{p.tipo_descricao}</td>
                      <td className='text-end'>R$ {formatCurrency(p.preco_unitario)}</td>
                      <td className='text-center'>
                        <span
                          className={
                            p.estoque_atual <= (p.estoque_minimo ?? 0) ? 'text-danger fw-bold' : ''
                          }
                        >
                          {formatNumber(p.estoque_atual)}
                        </span>
                        {p.estoque_minimo && p.estoque_minimo > 0 && (
                          <div className='text-muted small'>
                            Mín: {formatNumber(p.estoque_minimo)}
                          </div>
                        )}
                      </td>
                      <td className='text-center'>
                        {getStatusBadge(p.estoque_atual, p.estoque_minimo, p.ativo)}
                      </td>
                      <td className='text-center'>
                        <div className='d-flex gap-1 justify-content-center'>
                          <Button
                            size='small'
                            variant='outline'
                            icon={<FiEdit />}
                            onClick={() => {
                              setSelectedProduto(p);
                              setShowFormProduto(true);
                            }}
                            title='Editar produto'
                          />
                          <Button
                            size='small'
                            variant={p.ativo ? 'warning' : 'success'}
                            icon={p.ativo ? <FiEyeOff /> : <FiEye />}
                            onClick={() => handleToggleAtivo(p.id, p.ativo ? 0 : 1)}
                            title={p.ativo ? 'Desativar produto' : 'Ativar produto'}
                          />
                          <Button
                            size='small'
                            variant='danger'
                            icon={<FiTrash />}
                            onClick={() => setShowConfirmDelete(p.id)}
                            title='Excluir produto'
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedProdutos.length === 0 && (
                    <tr>
                      <td colSpan={6} className='text-center text-muted py-5'>
                        <FiPackage size={48} className='mb-3 opacity-50' />
                        <div>Nenhum produto encontrado</div>
                        <small>Verifique os filtros aplicados</small>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className='d-md-none'>
            {paginatedProdutos.map((p) => (
              <Card key={p.id} className='mb-3'>
                <CardContent className='p-3'>
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <div className='flex-grow-1'>
                      <h6 className='mb-1'>{p.nome}</h6>
                      {p.codigo_barra && (
                        <small className='text-muted'>Cod: {p.codigo_barra}</small>
                      )}
                    </div>
                    {getStatusBadge(p.estoque_atual, p.estoque_minimo, p.ativo)}
                  </div>
                  <div className='row g-2 mb-2'>
                    <div className='col-6'>
                      <small className='text-muted d-block'>Tipo</small>
                      {p.tipo_descricao}
                    </div>
                    <div className='col-6'>
                      <small className='text-muted d-block'>Preço</small>
                      R$ {formatCurrency(p.preco_unitario)}
                    </div>
                    <div className='col-6'>
                      <small className='text-muted d-block'>Estoque</small>
                      <span
                        className={
                          p.estoque_atual <= (p.estoque_minimo ?? 0) ? 'text-danger fw-bold' : ''
                        }
                      >
                        {formatNumber(p.estoque_atual)}
                      </span>
                    </div>
                    <div className='col-6'>
                      <small className='text-muted d-block'>Mínimo</small>
                      {formatNumber(p.estoque_minimo || 0)}
                    </div>
                  </div>
                  <div className='d-flex gap-1'>
                    <Button
                      size='small'
                      variant='outline'
                      icon={<FiEdit />}
                      onClick={() => {
                        setSelectedProduto(p);
                        setShowFormProduto(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size='small'
                      variant={p.ativo ? 'warning' : 'success'}
                      icon={p.ativo ? <FiEyeOff /> : <FiEye />}
                      onClick={() => handleToggleAtivo(p.id, p.ativo ? 0 : 1)}
                    />
                    <Button
                      size='small'
                      variant='danger'
                      icon={<FiTrash />}
                      onClick={() => setShowConfirmDelete(p.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {paginatedProdutos.length === 0 && (
              <div className='text-center text-muted py-5'>
                <FiPackage size={48} className='mb-3 opacity-50' />
                <div>Nenhum produto encontrado</div>
                <small>Verifique os filtros aplicados</small>
              </div>
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className='d-flex justify-content-between align-items-center mt-3'>
              <div className='text-muted small'>
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} de{' '}
                {filteredAndSorted.length} produtos
              </div>
              <div className='d-flex gap-1'>
                <Button
                  size='small'
                  variant='outline'
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  icon={<FiChevronLeft />}
                />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      size='small'
                      variant={pageNum === currentPage ? 'primary' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  size='small'
                  variant='outline'
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  icon={<FiChevronRight />}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Novo Tipo */}
      {showFormTipo && (
        <div className='modal d-block' tabIndex={-1} role='dialog'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <form action={handleCreateTipo}>
                <div className='modal-header'>
                  <h5 className='modal-title'>Novo Tipo de Produto</h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => {
                      setShowFormTipo(false);
                      setFormErrors({});
                    }}
                  />
                </div>
                <div className='modal-body'>
                  <div className='mb-3'>
                    <Input
                      name='descricao'
                      label='Descrição'
                      required
                      error={formErrors.descricao}
                    />
                  </div>
                  <div className='mb-3'>
                    <Input name='codigo' label='Código' required error={formErrors.codigo} />
                  </div>
                  <div className='form-check'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      id='exige_peso'
                      name='exige_peso'
                    />
                    <label className='form-check-label' htmlFor='exige_peso'>
                      Exige peso (por kg)
                    </label>
                  </div>
                </div>
                <div className='modal-footer'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setShowFormTipo(false);
                      setFormErrors({});
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type='submit' variant='primary' loading={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Produto */}
      {showFormProduto && (
        <div className='modal d-block' tabIndex={-1} role='dialog'>
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <form action={selectedProduto ? handleEditProduto : handleCreateProduto}>
                <div className='modal-header'>
                  <h5 className='modal-title'>
                    {selectedProduto ? 'Editar Produto' : 'Novo Produto'}
                  </h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => {
                      setShowFormProduto(false);
                      setSelectedProduto(null);
                      setFormErrors({});
                    }}
                  />
                </div>
                <div className='modal-body row g-3'>
                  <div className='col-md-8'>
                    <Input
                      name='nome'
                      label='Nome do Produto'
                      defaultValue={selectedProduto?.nome}
                      required
                      error={formErrors.nome}
                    />
                  </div>
                  <div className='col-md-4'>
                    <Input
                      type='number'
                      step='0.01'
                      name='preco'
                      label='Preço Unitário'
                      defaultValue={selectedProduto?.preco_unitario}
                      required
                      error={formErrors.preco}
                    />
                  </div>
                  {!selectedProduto && (
                    <div className='col-md-6'>
                      <label className='form-label'>Tipo de Produto</label>
                      <select name='tipoId' className='form-select' required defaultValue=''>
                        <option value='' disabled>
                          Selecione um tipo...
                        </option>
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.descricao}
                          </option>
                        ))}
                      </select>
                      {formErrors.tipoId && (
                        <div className='text-danger small mt-1'>{formErrors.tipoId}</div>
                      )}
                    </div>
                  )}
                  <div className='col-md-3'>
                    <Input
                      type='number'
                      step='0.001'
                      name='estoque_minimo'
                      label='Estoque Mínimo'
                      defaultValue={selectedProduto?.estoque_minimo}
                    />
                  </div>
                  <div className='col-md-3'>
                    <Input
                      name='codigo_barra'
                      label='Código de Barras'
                      defaultValue={selectedProduto?.codigo_barra}
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setShowFormProduto(false);
                      setSelectedProduto(null);
                      setFormErrors({});
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type='submit' variant='primary' loading={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Movimentação */}
      {showFormMov && (
        <div className='modal d-block' tabIndex={-1} role='dialog'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <form action={handleMovimentacao}>
                <div className='modal-header'>
                  <h5 className='modal-title'>Movimentação de Estoque</h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setShowFormMov(false)}
                  />
                </div>
                <div className='modal-body'>
                  <div className='mb-3'>
                    <label className='form-label'>Produto</label>
                    <select name='produtoId' className='form-select' required defaultValue=''>
                      <option value='' disabled>
                        Selecione um produto...
                      </option>
                      {optimisticProdutos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} (Estoque: {formatNumber(p.estoque_atual)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Tipo de Movimentação</label>
                    <select name='tipo_mov' className='form-select' required defaultValue='ENTRADA'>
                      <option value='ENTRADA'>Entrada de Estoque</option>
                      <option value='SAIDA'>Saída de Estoque</option>
                      <option value='AJUSTE_POSITIVO'>Ajuste Positivo</option>
                      <option value='AJUSTE_NEGATIVO'>Ajuste Negativo</option>
                    </select>
                  </div>
                  <div className='mb-3'>
                    <Input
                      type='number'
                      step='0.001'
                      name='quantidade'
                      label='Quantidade'
                      required
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Observação (opcional)</label>
                    <textarea
                      name='observacao'
                      className='form-control'
                      rows={3}
                      placeholder='Digite uma observação para esta movimentação...'
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowFormMov(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type='submit' variant='primary' loading={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar Movimentação'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação de Exclusão */}
      {showConfirmDelete && (
        <div className='modal d-block' tabIndex={-1} role='dialog'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Confirmar Exclusão</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowConfirmDelete(null)}
                />
              </div>
              <div className='modal-body'>
                <p>Tem certeza que deseja excluir este produto?</p>
                <p className='text-muted small'>
                  Esta ação não pode ser desfeita. O produto será removido permanentemente do
                  sistema.
                </p>
              </div>
              <div className='modal-footer'>
                <Button
                  variant='outline'
                  onClick={() => setShowConfirmDelete(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant='danger'
                  onClick={() => handleDeleteProduto(showConfirmDelete)}
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
