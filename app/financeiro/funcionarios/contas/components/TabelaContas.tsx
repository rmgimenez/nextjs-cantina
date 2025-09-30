import type { ContaFuncionario } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface TabelaContasProps {
  contas: ContaFuncionario[];
  loading: boolean;
  onEdit: (conta: ContaFuncionario) => void;
  onToggleStatus: (conta: ContaFuncionario) => void;
}

export function TabelaContas({ contas, loading, onEdit, onToggleStatus }: TabelaContasProps) {
  if (loading) {
    return (
      <div className='d-flex justify-content-center py-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='table-responsive table-responsive-custom'>
      <table className='table table-hover align-middle'>
        <thead className='table-light'>
          <tr>
            <th>Funcionário</th>
            <th>Cargo</th>
            <th>Limite Crédito</th>
            <th>Total em Aberto</th>
            <th>Disponível</th>
            <th>Alerta</th>
            <th>Status</th>
            <th>Atualizado</th>
            <th style={{ width: '140px' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contas.length === 0 ? (
            <tr>
              <td colSpan={9} className='text-center py-4'>
                <div className='empty-state'>
                  <div className='empty-state-icon'>👥</div>
                  <p className='text-muted mb-0'>
                    Nenhuma conta encontrada com os filtros selecionados.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            contas.map((conta) => {
              const saldoCritico =
                conta.limite_disponivel != null &&
                conta.limite_disponivel <= (conta.alerta_credito ?? 0);
              return (
                <tr key={conta.id}>
                  <td>
                    <div className='fw-semibold'>
                      {conta.funcionario_nome || 'Funcionário não localizado'}
                    </div>
                    <small className='text-muted'>Código: {conta.codigo_funcionario}</small>
                    {conta.observacoes && (
                      <div>
                        <small className='text-info'>💬 {conta.observacoes}</small>
                      </div>
                    )}
                  </td>
                  <td>{conta.cargo_oficial || '-'}</td>
                  <td>{formatCurrency(conta.limite_credito)}</td>
                  <td className='text-danger fw-semibold'>
                    {formatCurrency(conta.total_em_aberto)}
                  </td>
                  <td className={saldoCritico ? 'fw-semibold text-warning' : 'fw-semibold'}>
                    {formatCurrency(conta.limite_disponivel)}
                  </td>
                  <td>{formatCurrency(conta.alerta_credito)}</td>
                  <td>
                    <span className={`badge ${conta.ativo ? 'bg-success' : 'bg-secondary'}`}>
                      {conta.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>{formatDate(conta.dt_alteracao)}</td>
                  <td>
                    <div className='btn-group btn-group-sm'>
                      <button
                        className='btn btn-outline-primary'
                        onClick={() => onEdit(conta)}
                        title='Editar conta'
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn ${
                          conta.ativo ? 'btn-outline-warning' : 'btn-outline-success'
                        }`}
                        onClick={() => onToggleStatus(conta)}
                        title={conta.ativo ? 'Desativar conta' : 'Ativar conta'}
                      >
                        {conta.ativo ? '⏸️' : '▶️'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
