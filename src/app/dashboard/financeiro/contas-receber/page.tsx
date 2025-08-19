'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface ContaReceber {
  id: number;
  descricao: string;
  cliente?: string;
  numero_documento?: string;
  valor_original: number;
  valor_recebido: number;
  valor_pendente: number;
  data_emissao: string;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'PENDENTE' | 'RECEBIDO' | 'ATRASADO' | 'CANCELADO';
  situacao: string;
  dias_atraso?: number;
  categoria_nome?: string;
  usuario_cadastro_nome: string;
}

interface CategoriaFinanceira {
  id: number;
  nome: string;
  tipo: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ContasReceberPage() {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRecebimentoForm, setShowRecebimentoForm] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaReceber | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filtros, setFiltros] = useState({
    status: '',
    situacao: '',
    categoria_id: '',
    cliente: '',
    data_inicio: '',
    data_fim: '',
  });

  const [formData, setFormData] = useState({
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

  const [recebimentoData, setRecebimentoData] = useState({
    valor_recebido: '',
    valor_desconto: '0',
    valor_juros: '0',
    data_recebimento: new Date().toISOString().split('T')[0],
    forma_recebimento: 'DINHEIRO',
    observacoes: '',
  });

  useEffect(() => {
    carregarCategorias();
    carregarContas();
  }, [filtros, pagination.page]);

  const carregarCategorias = async () => {
    try {
      const response = await fetch('/api/financeiro/categorias?tipo=RECEITA');
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

      const response = await fetch(`/api/financeiro/contas-receber?${params}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/financeiro/contas-receber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          valor_original: parseFloat(formData.valor_original),
          parcelas: parseInt(formData.parcelas),
        }),
      });

      if (response.ok) {
        await carregarContas();
        setShowForm(false);
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
        setShowRecebimentoForm(false);
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

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getSituacaoBadge = (situacao: string, status: string) => {
    if (status === 'RECEBIDO') return 'bg-success';
    if (status === 'CANCELADO') return 'bg-secondary';
    if (situacao.includes('Atrasado')) return 'bg-danger';
    if (situacao.includes('Hoje')) return 'bg-warning';
    if (situacao.includes('Semana')) return 'bg-info';
    return 'bg-primary';
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
          <Button onClick={() => setShowForm(true)}>Nova Conta</Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className='mb-4'>
        <div className='card-body'>
          <div className='row'>
            <div className='col-md-2'>
              <label className='form-label'>Status</label>
              <select
                className='form-select'
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              >
                <option value=''>Todos</option>
                <option value='PENDENTE'>Pendente</option>
                <option value='RECEBIDO'>Recebido</option>
                <option value='ATRASADO'>Atrasado</option>
                <option value='CANCELADO'>Cancelado</option>
              </select>
            </div>
            <div className='col-md-2'>
              <label className='form-label'>Situação</label>
              <select
                className='form-select'
                value={filtros.situacao}
                onChange={(e) => setFiltros({ ...filtros, situacao: e.target.value })}
              >
                <option value=''>Todas</option>
                <option value='vence_hoje'>Vence Hoje</option>
                <option value='vence_semana'>Vence Esta Semana</option>
                <option value='atrasado'>Atrasado</option>
              </select>
            </div>
            <div className='col-md-2'>
              <label className='form-label'>Categoria</label>
              <select
                className='form-select'
                value={filtros.categoria_id}
                onChange={(e) => setFiltros({ ...filtros, categoria_id: e.target.value })}
              >
                <option value=''>Todas</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className='col-md-3'>
              <label className='form-label'>Cliente</label>
              <Input
                type='text'
                value={filtros.cliente}
                onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
                placeholder='Nome do cliente'
              />
            </div>
            <div className='col-md-1'>
              <label className='form-label'>&nbsp;</label>
              <div>
                <Button
                  variant='outline'
                  onClick={() =>
                    setFiltros({
                      status: '',
                      situacao: '',
                      categoria_id: '',
                      cliente: '',
                      data_inicio: '',
                      data_fim: '',
                    })
                  }
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <div className='card-body'>
          {contas.length > 0 ? (
            <>
              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Cliente</th>
                      <th>Categoria</th>
                      <th className='text-end'>Valor Original</th>
                      <th className='text-end'>Valor Pendente</th>
                      <th>Vencimento</th>
                      <th>Situação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contas.map((conta) => (
                      <tr key={conta.id}>
                        <td>
                          <div>
                            <strong>{conta.descricao}</strong>
                            {conta.numero_documento && (
                              <>
                                <br />
                                <small className='text-muted'>Doc: {conta.numero_documento}</small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>{conta.cliente || '-'}</td>
                        <td>{conta.categoria_nome || '-'}</td>
                        <td className='text-end'>{formatarMoeda(conta.valor_original)}</td>
                        <td className='text-end'>
                          <strong
                            className={conta.valor_pendente > 0 ? 'text-success' : 'text-muted'}
                          >
                            {formatarMoeda(conta.valor_pendente)}
                          </strong>
                        </td>
                        <td>
                          {formatarData(conta.data_vencimento)}
                          {conta.dias_atraso && conta.dias_atraso > 0 && (
                            <>
                              <br />
                              <small className='text-danger'>
                                {conta.dias_atraso} dias de atraso
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${getSituacaoBadge(conta.situacao, conta.status)}`}
                          >
                            {conta.status}
                          </span>
                        </td>
                        <td>
                          {conta.status === 'PENDENTE' && (
                            <Button
                              size='small'
                              onClick={() => {
                                setContaSelecionada(conta);
                                setRecebimentoData({
                                  ...recebimentoData,
                                  valor_recebido: conta.valor_pendente.toString(),
                                });
                                setShowRecebimentoForm(true);
                              }}
                            >
                              Receber
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className='d-flex justify-content-between align-items-center mt-4'>
                  <div>
                    Página {pagination.page} de {pagination.totalPages}({pagination.total}{' '}
                    registros)
                  </div>
                  <div className='d-flex gap-2'>
                    <Button
                      variant='outline'
                      disabled={!pagination.hasPrev}
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant='outline'
                      disabled={!pagination.hasNext}
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className='text-muted text-center'>Nenhuma conta encontrada</p>
          )}
        </div>
      </Card>

      {/* Modal de Nova Conta */}
      {showForm && (
        <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Nova Conta a Receber</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className='modal-body'>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Descrição *</label>
                        <Input
                          type='text'
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Cliente</label>
                        <Input
                          type='text'
                          value={formData.cliente}
                          onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Categoria</label>
                        <select
                          className='form-select'
                          value={formData.categoria_id}
                          onChange={(e) =>
                            setFormData({ ...formData, categoria_id: e.target.value })
                          }
                        >
                          <option value=''>Selecione...</option>
                          {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Número do Documento</label>
                        <Input
                          type='text'
                          value={formData.numero_documento}
                          onChange={(e) =>
                            setFormData({ ...formData, numero_documento: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className='row'>
                    <div className='col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Valor *</label>
                        <Input
                          type='number'
                          step='0.01'
                          value={formData.valor_original}
                          onChange={(e) =>
                            setFormData({ ...formData, valor_original: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Data Emissão *</label>
                        <Input
                          type='date'
                          value={formData.data_emissao}
                          onChange={(e) =>
                            setFormData({ ...formData, data_emissao: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Data Vencimento *</label>
                        <Input
                          type='date'
                          value={formData.data_vencimento}
                          onChange={(e) =>
                            setFormData({ ...formData, data_vencimento: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Parcelas</label>
                        <Input
                          type='number'
                          min='1'
                          value={formData.parcelas}
                          onChange={(e) => setFormData({ ...formData, parcelas: e.target.value })}
                        />
                      </div>
                    </div>
                    {parseInt(formData.parcelas) > 1 && (
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label className='form-label'>Data 1ª Parcela</label>
                          <Input
                            type='date'
                            value={formData.data_primeira_parcela}
                            onChange={(e) =>
                              setFormData({ ...formData, data_primeira_parcela: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='mb-3'>
                    <label className='form-label'>Observações</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <Button type='submit'>Salvar</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recebimento */}
      {showRecebimentoForm && contaSelecionada && (
        <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Registrar Recebimento</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowRecebimentoForm(false)}
                ></button>
              </div>
              <form onSubmit={handleRecebimento}>
                <div className='modal-body'>
                  <div className='mb-3'>
                    <strong>Conta:</strong> {contaSelecionada.descricao}
                    <br />
                    <strong>Valor Pendente:</strong>{' '}
                    {formatarMoeda(contaSelecionada.valor_pendente)}
                  </div>

                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Valor Recebido *</label>
                        <Input
                          type='number'
                          step='0.01'
                          value={recebimentoData.valor_recebido}
                          onChange={(e) =>
                            setRecebimentoData({
                              ...recebimentoData,
                              valor_recebido: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Data Recebimento *</label>
                        <Input
                          type='date'
                          value={recebimentoData.data_recebimento}
                          onChange={(e) =>
                            setRecebimentoData({
                              ...recebimentoData,
                              data_recebimento: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className='row'>
                    <div className='col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Desconto</label>
                        <Input
                          type='number'
                          step='0.01'
                          value={recebimentoData.valor_desconto}
                          onChange={(e) =>
                            setRecebimentoData({
                              ...recebimentoData,
                              valor_desconto: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Juros</label>
                        <Input
                          type='number'
                          step='0.01'
                          value={recebimentoData.valor_juros}
                          onChange={(e) =>
                            setRecebimentoData({ ...recebimentoData, valor_juros: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Forma Recebimento *</label>
                        <select
                          className='form-select'
                          value={recebimentoData.forma_recebimento}
                          onChange={(e) =>
                            setRecebimentoData({
                              ...recebimentoData,
                              forma_recebimento: e.target.value,
                            })
                          }
                          required
                        >
                          <option value='DINHEIRO'>Dinheiro</option>
                          <option value='CHEQUE'>Cheque</option>
                          <option value='TRANSFERENCIA'>Transferência</option>
                          <option value='PIX'>PIX</option>
                          <option value='CARTAO_DEBITO'>Cartão Débito</option>
                          <option value='CARTAO_CREDITO'>Cartão Crédito</option>
                          <option value='OUTRO'>Outro</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className='mb-3'>
                    <label className='form-label'>Observações</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      value={recebimentoData.observacoes}
                      onChange={(e) =>
                        setRecebimentoData({ ...recebimentoData, observacoes: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowRecebimentoForm(false)}
                  >
                    Cancelar
                  </button>
                  <Button type='submit'>Registrar Recebimento</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
