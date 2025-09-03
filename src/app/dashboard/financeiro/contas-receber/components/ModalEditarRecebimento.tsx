'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormDataRecebimento, Recebimento } from '../types';

interface ModalEditarRecebimentoProps {
  show: boolean;
  onClose: () => void;
  recebimento: Recebimento | null;
  recebimentoData: FormDataRecebimento;
  setRecebimentoData: (data: FormDataRecebimento) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ModalEditarRecebimento({
  show,
  onClose,
  recebimento,
  recebimentoData,
  setRecebimentoData,
  onSubmit,
}: ModalEditarRecebimentoProps) {
  if (!show || !recebimento) return null;

  return (
    <div
      className='modal show d-block'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Editar Recebimento</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className='modal-body'>
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
                    <label className='form-label'>Data do Recebimento *</label>
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
                        setRecebimentoData({
                          ...recebimentoData,
                          valor_juros: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className='mb-3'>
                    <label className='form-label'>Forma de Recebimento *</label>
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
                  value={recebimentoData.observacoes}
                  onChange={(e) =>
                    setRecebimentoData({
                      ...recebimentoData,
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
              <Button type='submit'>Salvar</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
