'use client';

import { formatarData, formatarMoeda } from '@/lib/formatters';
import { ContaReceber } from '../types';

interface TabelaContasReceberProps {
  contas: ContaReceber[];
  onEditar: (conta: ContaReceber) => void;
  onExcluir: (conta: ContaReceber) => void;
  onReceber: (conta: ContaReceber) => void;
  onVerRecebimentos: (conta: ContaReceber) => void;
}

export default function TabelaContasReceber({
  contas,
  onEditar,
  onExcluir,
  onReceber,
  onVerRecebimentos,
}: TabelaContasReceberProps) {
  const getSituacaoBadge = (situacao: string, status: string) => {
    if (status === 'RECEBIDO') return 'bg-success';
    if (status === 'CANCELADO') return 'bg-secondary';
    if (situacao.includes('Atrasado')) return 'bg-danger';
    if (situacao.includes('Hoje')) return 'bg-warning';
    if (situacao.includes('Semana')) return 'bg-info';
    return 'bg-primary';
  };

  if (contas.length === 0) {
    return <p className='text-muted text-center'>Nenhuma conta encontrada</p>;
  }

  return (
    <div className='table-responsive'>
      <table className='table table-hover'>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Cliente</th>
            <th>Valor Original</th>
            <th>Valor Pendente</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contas.map((conta) => (
            <tr key={conta.id}>
              <td>{conta.descricao}</td>
              <td>{conta.cliente || '-'}</td>
              <td>{formatarMoeda(conta.valor_original)}</td>
              <td className={conta.valor_pendente > 0 ? 'text-danger fw-bold' : 'text-success'}>
                {formatarMoeda(conta.valor_pendente)}
              </td>
              <td>{formatarData(conta.data_vencimento)}</td>
              <td>
                <span
                  className={`badge ${
                    conta.status === 'RECEBIDO'
                      ? 'bg-success'
                      : conta.status === 'ATRASADO'
                      ? 'bg-danger'
                      : conta.status === 'CANCELADO'
                      ? 'bg-secondary'
                      : 'bg-warning'
                  }`}
                >
                  {conta.status}
                </span>
              </td>
              <td>
                <span className={`badge ${getSituacaoBadge(conta.situacao, conta.status)}`}>
                  {conta.situacao}
                </span>
              </td>
              <td>
                <div className='d-flex gap-1'>
                  {conta.status !== 'RECEBIDO' &&
                    conta.status !== 'CANCELADO' &&
                    conta.valor_pendente > 0 && (
                      <button
                        className='btn btn-sm btn-success'
                        onClick={() => onReceber(conta)}
                        title='Registrar Recebimento'
                        aria-label={`Registrar recebimento da conta ${conta.descricao}`}
                      >
                        Receber
                      </button>
                    )}
                  <button
                    className='btn btn-sm btn-info'
                    onClick={() => onVerRecebimentos(conta)}
                    title='Ver Recebimentos'
                    aria-label={`Ver recebimentos da conta ${conta.descricao}`}
                  >
                    Ver Recebimentos
                  </button>
                  <button
                    className='btn btn-sm btn-warning'
                    onClick={() => onEditar(conta)}
                    title='Editar'
                    aria-label={`Editar conta ${conta.descricao}`}
                  >
                    Editar
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={() => onExcluir(conta)}
                    title='Excluir'
                    aria-label={`Excluir conta ${conta.descricao}`}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
