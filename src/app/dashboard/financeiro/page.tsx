'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface DashboardFinanceiro {
  contas_pagar_pendentes: number;
  contas_receber_pendentes: number;
  contas_pagar_atrasadas: number;
  contas_receber_atrasadas: number;
  valor_total_pagar: number;
  valor_total_receber: number;
  valor_atrasado_pagar: number;
  valor_atrasado_receber: number;
}

interface ContaResumo {
  id: number;
  descricao: string;
  fornecedor?: string;
  cliente?: string;
  valor_pendente: number;
  data_vencimento: string;
  dias_atraso?: number;
}

interface FluxoCaixa {
  data: string;
  entradas: number;
  saidas: number;
}

export default function FinanceiroPage() {
  const [dashboard, setDashboard] = useState<DashboardFinanceiro | null>(null);
  const [contasPagarHoje, setContasPagarHoje] = useState<ContaResumo[]>([]);
  const [contasReceberHoje, setContasReceberHoje] = useState<ContaResumo[]>([]);
  const [contasPagarAtrasadas, setContasPagarAtrasadas] = useState<ContaResumo[]>([]);
  const [contasReceberAtrasadas, setContasReceberAtrasadas] = useState<ContaResumo[]>([]);
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      const response = await fetch('/api/financeiro/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.dashboard);
        setContasPagarHoje(data.contas_pagar_hoje || []);
        setContasReceberHoje(data.contas_receber_hoje || []);
        setContasPagarAtrasadas(data.contas_pagar_atrasadas || []);
        setContasReceberAtrasadas(data.contas_receber_atrasadas || []);
        setFluxoCaixa(data.fluxo_caixa || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
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
        <h1 className='h2 mb-0'>Financeiro</h1>
        <div className='d-flex gap-2'>
          <a href='/dashboard/financeiro/contas-pagar' className='btn btn-outline-primary'>
            Contas a Pagar
          </a>
          <a href='/dashboard/financeiro/contas-receber' className='btn btn-outline-primary'>
            Contas a Receber
          </a>
          <a href='/dashboard/financeiro/categorias' className='btn btn-outline-primary'>
            Categorias
          </a>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className='row mb-4'>
        <div className='col-md-3'>
          <Card className='border-primary'>
            <div className='card-body text-center'>
              <h5 className='card-title text-primary'>Contas a Pagar</h5>
              <p className='h4 mb-1'>{dashboard?.contas_pagar_pendentes || 0}</p>
              <small className='text-muted'>Pendentes</small>
              <hr />
              <p className='h6 text-success mb-0'>
                {formatarMoeda(dashboard?.valor_total_pagar || 0)}
              </p>
            </div>
          </Card>
        </div>

        <div className='col-md-3'>
          <Card className='border-success'>
            <div className='card-body text-center'>
              <h5 className='card-title text-success'>Contas a Receber</h5>
              <p className='h4 mb-1'>{dashboard?.contas_receber_pendentes || 0}</p>
              <small className='text-muted'>Pendentes</small>
              <hr />
              <p className='h6 text-success mb-0'>
                {formatarMoeda(dashboard?.valor_total_receber || 0)}
              </p>
            </div>
          </Card>
        </div>

        <div className='col-md-3'>
          <Card className='border-danger'>
            <div className='card-body text-center'>
              <h5 className='card-title text-danger'>Atrasadas</h5>
              <p className='h4 mb-1'>
                {(dashboard?.contas_pagar_atrasadas || 0) +
                  (dashboard?.contas_receber_atrasadas || 0)}
              </p>
              <small className='text-muted'>Total</small>
              <hr />
              <p className='h6 text-danger mb-0'>
                {formatarMoeda(
                  (dashboard?.valor_atrasado_pagar || 0) + (dashboard?.valor_atrasado_receber || 0)
                )}
              </p>
            </div>
          </Card>
        </div>

        <div className='col-md-3'>
          <Card className='border-info'>
            <div className='card-body text-center'>
              <h5 className='card-title text-info'>Saldo</h5>
              <p className='h4 mb-1'>
                {formatarMoeda(
                  (dashboard?.valor_total_receber || 0) - (dashboard?.valor_total_pagar || 0)
                )}
              </p>
              <small className='text-muted'>A Receber - A Pagar</small>
            </div>
          </Card>
        </div>
      </div>

      <div className='row'>
        {/* Contas que vencem hoje */}
        <div className='col-md-6 mb-4'>
          <Card>
            <div className='card-header'>
              <h5 className='mb-0'>Vencem Hoje</h5>
            </div>
            <div className='card-body'>
              <div className='row'>
                <div className='col-12 mb-3'>
                  <h6 className='text-danger'>Contas a Pagar</h6>
                  {contasPagarHoje.length > 0 ? (
                    <div className='list-group list-group-flush'>
                      {contasPagarHoje.map((conta) => (
                        <div key={`pagar-${conta.id}`} className='list-group-item px-0'>
                          <div className='d-flex justify-content-between'>
                            <div>
                              <small className='text-muted'>{conta.fornecedor}</small>
                              <p className='mb-1'>{conta.descricao}</p>
                            </div>
                            <span className='text-danger fw-bold'>
                              {formatarMoeda(conta.valor_pendente)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted'>Nenhuma conta a pagar vence hoje</p>
                  )}
                </div>

                <div className='col-12'>
                  <h6 className='text-success'>Contas a Receber</h6>
                  {contasReceberHoje.length > 0 ? (
                    <div className='list-group list-group-flush'>
                      {contasReceberHoje.map((conta) => (
                        <div key={`receber-${conta.id}`} className='list-group-item px-0'>
                          <div className='d-flex justify-content-between'>
                            <div>
                              <small className='text-muted'>{conta.cliente}</small>
                              <p className='mb-1'>{conta.descricao}</p>
                            </div>
                            <span className='text-success fw-bold'>
                              {formatarMoeda(conta.valor_pendente)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted'>Nenhuma conta a receber vence hoje</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contas atrasadas */}
        <div className='col-md-6 mb-4'>
          <Card>
            <div className='card-header'>
              <h5 className='mb-0 text-danger'>Contas Atrasadas</h5>
            </div>
            <div className='card-body'>
              <div className='row'>
                <div className='col-12 mb-3'>
                  <h6 className='text-danger'>A Pagar</h6>
                  {contasPagarAtrasadas.length > 0 ? (
                    <div className='list-group list-group-flush'>
                      {contasPagarAtrasadas.map((conta) => (
                        <div key={`atraso-pagar-${conta.id}`} className='list-group-item px-0'>
                          <div className='d-flex justify-content-between'>
                            <div>
                              <small className='text-muted'>{conta.fornecedor}</small>
                              <p className='mb-1'>{conta.descricao}</p>
                              <small className='text-danger'>
                                {conta.dias_atraso} dias de atraso
                              </small>
                            </div>
                            <span className='text-danger fw-bold'>
                              {formatarMoeda(conta.valor_pendente)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted'>Nenhuma conta a pagar atrasada</p>
                  )}
                </div>

                <div className='col-12'>
                  <h6 className='text-warning'>A Receber</h6>
                  {contasReceberAtrasadas.length > 0 ? (
                    <div className='list-group list-group-flush'>
                      {contasReceberAtrasadas.map((conta) => (
                        <div key={`atraso-receber-${conta.id}`} className='list-group-item px-0'>
                          <div className='d-flex justify-content-between'>
                            <div>
                              <small className='text-muted'>{conta.cliente}</small>
                              <p className='mb-1'>{conta.descricao}</p>
                              <small className='text-warning'>
                                {conta.dias_atraso} dias de atraso
                              </small>
                            </div>
                            <span className='text-warning fw-bold'>
                              {formatarMoeda(conta.valor_pendente)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted'>Nenhuma conta a receber atrasada</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Fluxo de Caixa Próximos 30 dias */}
      {fluxoCaixa.length > 0 && (
        <div className='row'>
          <div className='col-12'>
            <Card>
              <div className='card-header'>
                <h5 className='mb-0'>Fluxo de Caixa - Próximos 30 dias</h5>
              </div>
              <div className='card-body'>
                <div className='table-responsive'>
                  <table className='table table-sm'>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th className='text-end'>Entradas</th>
                        <th className='text-end'>Saídas</th>
                        <th className='text-end'>Saldo do Dia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fluxoCaixa.map((item, index) => {
                        const saldo = item.entradas - item.saidas;
                        return (
                          <tr key={index}>
                            <td>{formatarData(item.data)}</td>
                            <td className='text-end text-success'>
                              {item.entradas > 0 ? formatarMoeda(item.entradas) : '-'}
                            </td>
                            <td className='text-end text-danger'>
                              {item.saidas > 0 ? formatarMoeda(item.saidas) : '-'}
                            </td>
                            <td
                              className={`text-end fw-bold ${
                                saldo >= 0 ? 'text-success' : 'text-danger'
                              }`}
                            >
                              {formatarMoeda(saldo)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
