'use client';

import { ContaReceber, Recebimento } from '../types';

interface ModalRecebimentosProps {
  show: boolean;
  onClose: () => void;
  conta: ContaReceber | null;
  recebimentos: Recebimento[];
  onEditar: (recebimento: Recebimento) => void;
  onExcluir: (recebimento: Recebimento) => void;
}

export default function ModalRecebimentos({
  show,
  onClose,
  conta,
  recebimentos,
  onEditar,
  onExcluir,
}: ModalRecebimentosProps) {
  if (!show || !conta) return null;

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div
      className='modal show d-block'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Recebimentos - {conta.descricao}</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            <div className='mb-3'>
              <strong>Valor Original:</strong> {formatarMoeda(conta.valor_original)}
              <br />
              <strong>Valor Recebido:</strong> {formatarMoeda(conta.valor_recebido)}
              <br />
              <strong>Valor Pendente:</strong>{' '}
              <span className={conta.valor_pendente > 0 ? 'text-danger' : 'text-success'}>
                {formatarMoeda(conta.valor_pendente)}
              </span>
            </div>

            {recebimentos.length > 0 ? (
              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Valor Recebido</th>
                      <th>Desconto</th>
                      <th>Juros</th>
                      <th>Forma</th>
                      <th>Usuário</th>
                      <th>Observações</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recebimentos.map((recebimento) => (
                      <tr key={recebimento.id}>
                        <td>{formatarData(recebimento.data_recebimento)}</td>
                        <td>{formatarMoeda(recebimento.valor_recebido)}</td>
                        <td>{formatarMoeda(recebimento.valor_desconto)}</td>
                        <td>{formatarMoeda(recebimento.valor_juros)}</td>
                        <td>{recebimento.forma_recebimento}</td>
                        <td>{recebimento.usuario_nome}</td>
                        <td>{recebimento.observacoes || '-'}</td>
                        <td>
                          <div className='d-flex gap-1'>
                            <button
                              className='btn btn-sm btn-warning'
                              onClick={() => onEditar(recebimento)}
                              title='Editar recebimento'
                            >
                              Editar
                            </button>
                            <button
                              className='btn btn-sm btn-danger'
                              onClick={() => onExcluir(recebimento)}
                              title='Excluir recebimento'
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
            ) : (
              <p className='text-muted text-center'>
                Nenhum recebimento registrado para esta conta
              </p>
            )}
          </div>
          <div className='modal-footer'>
            <button type='button' className='btn btn-secondary' onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
