'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContaPagar, FormDataPagamento } from '../types';

interface ModalPagamentoProps {
  show: boolean;
  onClose: () => void;
  conta: ContaPagar | null;
  pagamentoData: FormDataPagamento;
  setPagamentoData: (data: FormDataPagamento) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ModalPagamento({
  show,
  onClose,
  conta,
  pagamentoData,
  setPagamentoData,
  onSubmit,
}: ModalPagamentoProps) {
  if (!show || !conta) return null;

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div
      className='modal show d-block'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Registrar Pagamento</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className='modal-body'>
              <div className='mb-3'>
                <strong>Conta:</strong> {conta.descricao}
                <br />
                <strong>Valor Pendente:</strong> {formatarMoeda(conta.valor_pendente)}
              </div>

              <div className='row'>
                <div className='col-md-6'>
                  <div className='mb-3'>
                    <label className='form-label'>Valor Pago *</label>
                    <Input
                      type='number'
                      step='0.01'
                      value={pagamentoData.valor_pago}
                      onChange={(e) =>
                        setPagamentoData({
                          ...pagamentoData,
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
                      value={pagamentoData.data_pagamento}
                      onChange={(e) =>
                        setPagamentoData({
                          ...pagamentoData,
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
                      value={pagamentoData.valor_desconto}
                      onChange={(e) =>
                        setPagamentoData({
                          ...pagamentoData,
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
                      value={pagamentoData.valor_juros}
                      onChange={(e) =>
                        setPagamentoData({
                          ...pagamentoData,
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
                      value={pagamentoData.forma_pagamento}
                      onChange={(e) =>
                        setPagamentoData({
                          ...pagamentoData,
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
                  value={pagamentoData.observacoes}
                  onChange={(e) =>
                    setPagamentoData({
                      ...pagamentoData,
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
              <Button type='submit'>Registrar Pagamento</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
