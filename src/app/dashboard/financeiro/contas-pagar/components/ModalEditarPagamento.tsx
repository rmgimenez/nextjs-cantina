'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormDataPagamento, Pagamento } from '../types';

interface ModalEditarPagamentoProps {
  show: boolean;
  onClose: () => void;
  pagamento: Pagamento | null;
  editPagamentoData: FormDataPagamento;
  setEditPagamentoData: (data: FormDataPagamento) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ModalEditarPagamento({
  show,
  onClose,
  pagamento,
  editPagamentoData,
  setEditPagamentoData,
  onSubmit,
}: ModalEditarPagamentoProps) {
  if (!show || !pagamento) return null;

  return (
    <div
      className='modal show d-block'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Editar Pagamento</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className='modal-body'>
              <div className='row'>
                <div className='col-md-6'>
                  <div className='mb-3'>
                    <label className='form-label'>Valor Pago *</label>
                    <Input
                      type='number'
                      step='0.01'
                      value={editPagamentoData.valor_pago}
                      onChange={(e) =>
                        setEditPagamentoData({
                          ...editPagamentoData,
                          valor_pago: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='mb-3'>
                    <label className='form-label'>Data do Pagamento *</label>
                    <Input
                      type='date'
                      value={editPagamentoData.data_pagamento}
                      onChange={(e) =>
                        setEditPagamentoData({
                          ...editPagamentoData,
                          data_pagamento: e.target.value,
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
                      value={editPagamentoData.valor_desconto}
                      onChange={(e) =>
                        setEditPagamentoData({
                          ...editPagamentoData,
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
                      value={editPagamentoData.valor_juros}
                      onChange={(e) =>
                        setEditPagamentoData({
                          ...editPagamentoData,
                          valor_juros: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className='mb-3'>
                    <label className='form-label'>Forma de Pagamento *</label>
                    <select
                      className='form-select'
                      value={editPagamentoData.forma_pagamento}
                      onChange={(e) =>
                        setEditPagamentoData({
                          ...editPagamentoData,
                          forma_pagamento: e.target.value,
                        })
                      }
                      required
                    >
                      <option value='DINHEIRO'>Dinheiro</option>
                      <option value='CHEQUE'>Cheque</option>
                      <option value='TRANSFERENCIA'>Transferência</option>
                      <option value='PIX'>PIX</option>
                      <option value='CARTAO_DEBITO'>Cartão de Débito</option>
                      <option value='CARTAO_CREDITO'>Cartão de Crédito</option>
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
                  value={editPagamentoData.observacoes}
                  onChange={(e) =>
                    setEditPagamentoData({
                      ...editPagamentoData,
                      observacoes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' onClick={onClose}>
                Cancelar
              </button>
              <Button type='submit'>Salvar Alterações</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
