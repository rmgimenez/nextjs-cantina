'use client';

import MainLayout from '@/components/MainLayout';
import { useEffect, useState } from 'react';

interface Venda {
  id: number;
  tipo_cliente: 'ALUNO' | 'FUNCIONARIO' | 'GERAL';
  nome_cliente: string;
  ra_aluno: number | null;
  codigo_funcionario: number | null;
  valor_total: number;
  forma_pagamento: 'SALDO' | 'DINHEIRO' | 'CARTAO' | 'CONTA_FUNCIONARIO';
  status: 'CONCLUIDA' | 'CANCELADA' | 'ESTORNADA';
  dt_venda: string;
  usuario_nome: string;
  quantidade_itens: number;
}

interface ItemVenda {
  id: number;
  id_produto: number;
  produto_nome: string;
  tipo_produto: string;
  quantidade: number;
  peso: number | null;
  preco_unitario: number;
  valor_total: number;
}

interface VendaDetalhe {
  venda: {
    id: number;
    tipo_cliente: 'ALUNO' | 'FUNCIONARIO' | 'GERAL';
    nome_cliente: string;
    ra_aluno: number | null;
    codigo_funcionario: number | null;
    valor_total: number;
    forma_pagamento: 'SALDO' | 'DINHEIRO' | 'CARTAO' | 'CONTA_FUNCIONARIO';
    status: 'CONCLUIDA' | 'CANCELADA' | 'ESTORNADA';
    dt_venda: string;
    usuario_nome: string;
    observacoes: string | null;
    id_caixa: number;
    dt_abertura_caixa: string;
  };
  itens: ItemVenda[];
}

export default function HistoricoVendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [dtInicio, setDtInicio] = useState('');
  const [dtFim, setDtFim] = useState('');
  const [tipoCliente, setTipoCliente] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [status, setStatus] = useState('CONCLUIDA');

  // Modal de detalhes
  const [vendaDetalhada, setVendaDetalhada] = useState<VendaDetalhe | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  useEffect(() => {
    buscarVendas();
  }, [page, status]);

  async function buscarVendas() {
    setCarregando(true);
    setErro('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        status: status || 'CONCLUIDA',
      });

      if (dtInicio) params.append('dt_inicio', dtInicio);
      if (dtFim) params.append('dt_fim', dtFim);
      if (tipoCliente) params.append('tipo_cliente', tipoCliente);
      if (formaPagamento) params.append('forma_pagamento', formaPagamento);

      const res = await fetch(`/api/vendas/historico?${params.toString()}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar vendas');
      }

      setVendas(data.data.vendas);
      setTotalPages(data.data.pagination.totalPages);
      setTotal(data.data.pagination.total);
    } catch (error) {
      console.error(error);
      setErro(error instanceof Error ? error.message : 'Erro ao buscar vendas');
    } finally {
      setCarregando(false);
    }
  }

  async function verDetalhes(id: number) {
    setCarregandoDetalhe(true);
    setVendaDetalhada(null);
    try {
      const res = await fetch(`/api/vendas/historico/${id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar detalhes');
      }

      setVendaDetalhada(data.data);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erro ao buscar detalhes');
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  function aplicarFiltros() {
    setPage(1);
    buscarVendas();
  }

  function limparFiltros() {
    setDtInicio('');
    setDtFim('');
    setTipoCliente('');
    setFormaPagamento('');
    setStatus('CONCLUIDA');
    setPage(1);
    setTimeout(() => buscarVendas(), 100);
  }

  function formatarData(dataStr: string) {
    const data = new Date(dataStr);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function getTipoClienteLabel(tipo: string) {
    const labels: Record<string, string> = {
      ALUNO: 'Aluno',
      FUNCIONARIO: 'Funcionário',
      GERAL: 'Geral',
    };
    return labels[tipo] || tipo;
  }

  function getFormaPagamentoLabel(forma: string) {
    const labels: Record<string, string> = {
      SALDO: 'Saldo',
      DINHEIRO: 'Dinheiro',
      CARTAO: 'Cartão',
      CONTA_FUNCIONARIO: 'Conta Funcionário',
    };
    return labels[forma] || forma;
  }

  function getStatusBadge(statusVenda: string) {
    const badges: Record<string, string> = {
      CONCLUIDA: 'bg-success',
      CANCELADA: 'bg-danger',
      ESTORNADA: 'bg-warning text-dark',
    };
    return badges[statusVenda] || 'bg-secondary';
  }

  return (
    <MainLayout>
      <div className='container-fluid py-4'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h2 className='text-primary mb-0'>
            <i className='bi bi-clock-history me-2'></i>
            Histórico de Vendas
          </h2>
        </div>

        {/* Filtros */}
        <div className='card shadow-sm mb-4'>
          <div className='card-body'>
            <h5 className='card-title mb-3'>
              <i className='bi bi-funnel me-2'></i>Filtros
            </h5>
            <div className='row g-3'>
              <div className='col-md-3'>
                <label className='form-label'>Data Início</label>
                <input
                  type='date'
                  className='form-control'
                  value={dtInicio}
                  onChange={(e) => setDtInicio(e.target.value)}
                />
              </div>
              <div className='col-md-3'>
                <label className='form-label'>Data Fim</label>
                <input
                  type='date'
                  className='form-control'
                  value={dtFim}
                  onChange={(e) => setDtFim(e.target.value)}
                />
              </div>
              <div className='col-md-2'>
                <label className='form-label'>Tipo Cliente</label>
                <select
                  className='form-select'
                  value={tipoCliente}
                  onChange={(e) => setTipoCliente(e.target.value)}
                >
                  <option value=''>Todos</option>
                  <option value='ALUNO'>Aluno</option>
                  <option value='FUNCIONARIO'>Funcionário</option>
                  <option value='GERAL'>Geral</option>
                </select>
              </div>
              <div className='col-md-2'>
                <label className='form-label'>Pagamento</label>
                <select
                  className='form-select'
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value=''>Todos</option>
                  <option value='SALDO'>Saldo</option>
                  <option value='DINHEIRO'>Dinheiro</option>
                  <option value='CARTAO'>Cartão</option>
                  <option value='CONTA_FUNCIONARIO'>Conta Funcionário</option>
                </select>
              </div>
              <div className='col-md-2'>
                <label className='form-label'>Status</label>
                <select
                  className='form-select'
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value='CONCLUIDA'>Concluída</option>
                  <option value='CANCELADA'>Cancelada</option>
                  <option value='ESTORNADA'>Estornada</option>
                </select>
              </div>
              <div className='col-12'>
                <button className='btn btn-primary me-2' onClick={aplicarFiltros}>
                  <i className='bi bi-search me-2'></i>Buscar
                </button>
                <button className='btn btn-outline-secondary' onClick={limparFiltros}>
                  <i className='bi bi-x-circle me-2'></i>Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {erro && (
          <div className='alert alert-danger' role='alert'>
            <i className='bi bi-exclamation-triangle me-2'></i>
            {erro}
          </div>
        )}

        {/* Carregando */}
        {carregando && (
          <div className='text-center py-5'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Carregando...</span>
            </div>
          </div>
        )}

        {/* Tabela de vendas */}
        {!carregando && vendas.length > 0 && (
          <>
            <div className='card shadow-sm'>
              <div className='card-body'>
                <div className='d-flex justify-content-between align-items-center mb-3'>
                  <h5 className='mb-0'>
                    Total: <strong>{total}</strong> vendas encontradas
                  </h5>
                  <span className='text-muted'>
                    Página {page} de {totalPages}
                  </span>
                </div>
                <div className='table-responsive'>
                  <table className='table table-hover'>
                    <thead className='table-light'>
                      <tr>
                        <th>ID</th>
                        <th>Data/Hora</th>
                        <th>Cliente</th>
                        <th>Tipo</th>
                        <th>Itens</th>
                        <th>Valor</th>
                        <th>Pagamento</th>
                        <th>Status</th>
                        <th>Atendente</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendas.map((venda) => (
                        <tr key={venda.id}>
                          <td>
                            <strong>#{venda.id}</strong>
                          </td>
                          <td>{formatarData(venda.dt_venda)}</td>
                          <td>
                            {venda.nome_cliente}
                            {venda.ra_aluno && (
                              <small className='text-muted d-block'>RA: {venda.ra_aluno}</small>
                            )}
                          </td>
                          <td>
                            <span className='badge bg-info text-dark'>
                              {getTipoClienteLabel(venda.tipo_cliente)}
                            </span>
                          </td>
                          <td className='text-center'>{venda.quantidade_itens}</td>
                          <td>
                            <strong className='text-success'>
                              {formatarMoeda(venda.valor_total)}
                            </strong>
                          </td>
                          <td>
                            <small>{getFormaPagamentoLabel(venda.forma_pagamento)}</small>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(venda.status)}`}>
                              {venda.status}
                            </span>
                          </td>
                          <td>
                            <small>{venda.usuario_nome}</small>
                          </td>
                          <td>
                            <button
                              className='btn btn-sm btn-outline-primary'
                              onClick={() => verDetalhes(venda.id)}
                              data-bs-toggle='modal'
                              data-bs-target='#modalDetalhes'
                            >
                              <i className='bi bi-eye'></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                <div className='d-flex justify-content-center mt-4'>
                  <nav>
                    <ul className='pagination'>
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button className='page-link' onClick={() => setPage(page - 1)}>
                          Anterior
                        </button>
                      </li>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        if (pageNum <= totalPages) {
                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${page === pageNum ? 'active' : ''}`}
                            >
                              <button className='page-link' onClick={() => setPage(pageNum)}>
                                {pageNum}
                              </button>
                            </li>
                          );
                        }
                        return null;
                      })}
                      <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button className='page-link' onClick={() => setPage(page + 1)}>
                          Próximo
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sem resultados */}
        {!carregando && vendas.length === 0 && (
          <div className='card shadow-sm'>
            <div className='card-body text-center py-5'>
              <i className='bi bi-inbox' style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className='text-muted mt-3'>Nenhuma venda encontrada com os filtros aplicados.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <div
        className='modal fade'
        id='modalDetalhes'
        tabIndex={-1}
        aria-labelledby='modalDetalhesLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog modal-lg modal-dialog-scrollable'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='modalDetalhesLabel'>
                <i className='bi bi-receipt me-2'></i>
                Detalhes da Venda
              </h5>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
              ></button>
            </div>
            <div className='modal-body'>
              {carregandoDetalhe && (
                <div className='text-center py-4'>
                  <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Carregando...</span>
                  </div>
                </div>
              )}

              {!carregandoDetalhe && vendaDetalhada && (
                <>
                  {/* Informações da Venda */}
                  <div className='card mb-3'>
                    <div className='card-header bg-primary text-white'>
                      <h6 className='mb-0'>Informações da Venda #{vendaDetalhada.venda.id}</h6>
                    </div>
                    <div className='card-body'>
                      <div className='row'>
                        <div className='col-md-6 mb-2'>
                          <strong>Data/Hora:</strong>
                          <br />
                          {formatarData(vendaDetalhada.venda.dt_venda)}
                        </div>
                        <div className='col-md-6 mb-2'>
                          <strong>Status:</strong>
                          <br />
                          <span className={`badge ${getStatusBadge(vendaDetalhada.venda.status)}`}>
                            {vendaDetalhada.venda.status}
                          </span>
                        </div>
                        <div className='col-md-6 mb-2'>
                          <strong>Cliente:</strong>
                          <br />
                          {vendaDetalhada.venda.nome_cliente}
                        </div>
                        <div className='col-md-6 mb-2'>
                          <strong>Tipo:</strong>
                          <br />
                          <span className='badge bg-info text-dark'>
                            {getTipoClienteLabel(vendaDetalhada.venda.tipo_cliente)}
                          </span>
                        </div>
                        <div className='col-md-6 mb-2'>
                          <strong>Forma de Pagamento:</strong>
                          <br />
                          {getFormaPagamentoLabel(vendaDetalhada.venda.forma_pagamento)}
                        </div>
                        <div className='col-md-6 mb-2'>
                          <strong>Atendente:</strong>
                          <br />
                          {vendaDetalhada.venda.usuario_nome}
                        </div>
                        <div className='col-md-6 mb-2'>
                          <strong>Caixa:</strong>
                          <br />#{vendaDetalhada.venda.id_caixa}
                        </div>
                        {vendaDetalhada.venda.observacoes && (
                          <div className='col-12 mb-2'>
                            <strong>Observações:</strong>
                            <br />
                            <p className='text-muted'>{vendaDetalhada.venda.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Itens da Venda */}
                  <div className='card'>
                    <div className='card-header bg-light'>
                      <h6 className='mb-0'>Itens da Venda</h6>
                    </div>
                    <div className='card-body'>
                      <div className='table-responsive'>
                        <table className='table table-sm'>
                          <thead>
                            <tr>
                              <th>Produto</th>
                              <th>Tipo</th>
                              <th className='text-center'>Qtd.</th>
                              <th className='text-center'>Peso</th>
                              <th className='text-end'>Preço Un.</th>
                              <th className='text-end'>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vendaDetalhada.itens.map((item) => (
                              <tr key={item.id}>
                                <td>{item.produto_nome}</td>
                                <td>
                                  <small className='text-muted'>{item.tipo_produto}</small>
                                </td>
                                <td className='text-center'>{item.quantidade}</td>
                                <td className='text-center'>
                                  {item.peso ? `${item.peso.toFixed(3)} kg` : '-'}
                                </td>
                                <td className='text-end'>{formatarMoeda(item.preco_unitario)}</td>
                                <td className='text-end'>
                                  <strong>{formatarMoeda(item.valor_total)}</strong>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className='table-active'>
                              <td colSpan={5} className='text-end'>
                                <strong>TOTAL:</strong>
                              </td>
                              <td className='text-end'>
                                <strong className='text-success fs-5'>
                                  {formatarMoeda(vendaDetalhada.venda.valor_total)}
                                </strong>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
