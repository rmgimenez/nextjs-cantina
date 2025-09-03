'use client';

import { ContaPagar, Pagamento } from '../types';

interface ModalPagamentosProps {
  show: boolean;
  onClose: () => void;
  conta: ContaPagar | null;
  pagamentos: Pagamento[];
  onEditar: (pagamento: Pagamento) => void;
  onExcluir: (pagamento: Pagamento) => void;
}

export default function ModalPagamentos({
  show,
  onClose,
  conta,
  pagamentos,
  onEditar,
  onExcluir,
}: ModalPagamentosProps) {
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
            <h5 className='modal-title'>Pagamentos - {conta.descricao}</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            <div className='mb-3'>
              <strong>Valor Original:</strong> {formatarMoeda(conta.valor_original)}
              <br />
              <strong>Valor Pago:</strong> {formatarMoeda(conta.valor_pago)}
              <br />
              <strong>Valor Pendente:</strong>{' '}
              <span className={conta.valor_pendente > 0 ? 'text-danger' : 'text-success'}>
                {formatarMoeda(conta.valor_pendente)}
              </span>
            </div>

            {pagamentos.length > 0 ? (
              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Valor Pago</th>
                      <th>Desconto</th>
                      <th>Juros</th>
                      <th>Forma</th>
                      <th>Usuário</th>
                      <th>Observações</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentos.map((pagamento) => (
                      <tr key={pagamento.id}>
                        <td>{formatarData(pagamento.data_pagamento)}</td>
                        <td>{formatarMoeda(pagamento.valor_pago)}</td>
                        <td>{formatarMoeda(pagamento.valor_desconto)}</td>
                        <td>{formatarMoeda(pagamento.valor_juros)}</td>
                        <td>{pagamento.forma_pagamento}</td>
                        <td>{pagamento.usuario_nome}</td>
                        <td>{pagamento.observacoes || '-'}</td>
                        <td>
                          <div className='d-flex gap-1'>
                            <button
                              className='btn btn-sm btn-warning'
                              onClick={() => onEditar(pagamento)}
                              title='Editar pagamento'
                            >
                              Editar
                            </button>
                            <button
                              className='btn btn-sm btn-danger'
                              onClick={() => onExcluir(pagamento)}
                              title='Excluir pagamento'
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
              <p className='text-muted text-center'>Nenhum pagamento registrado para esta conta</p>
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
