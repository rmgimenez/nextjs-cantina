'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoriaFinanceira, ContaPagar, FormDataConta } from '../types';

interface ModalEditarContaProps {
  show: boolean;
  onClose: () => void;
  conta: ContaPagar | null;
  editData: FormDataConta;
  setEditData: (data: FormDataConta) => void;
  categorias: CategoriaFinanceira[];
  onSubmit: (e: React.FormEvent) => void;
}

export default function ModalEditarConta({
  show,
  onClose,
  conta,
  editData,
  setEditData,
  categorias,
  onSubmit,
}: ModalEditarContaProps) {
  if (!show || !conta) return null;

  return (
    <div
      className='modal show d-block'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className='modal-dialog modal-lg modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Editar Conta a Pagar</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className='modal-body'>
              <div className='row'>
                <div className='col-md-6'>
                  <div className='mb-3'>
                    <label className='form-label'>Categoria *</label>
                    <select
                      className='form-select'
                      value={editData.categoria_id}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          categoria_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value=''>Selecione uma categoria</option>
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
                    <label className='form-label'>Descrição *</label>
                    <Input
                      type='text'
                      value={editData.descricao}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          descricao: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className='row'>
                <div className='col-md-6'>
                  <div className='mb-3'>
                    <label className='form-label'>Fornecedor</label>
                    <Input
                      type='text'
                      value={editData.fornecedor}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          fornecedor: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='mb-3'>
                    <label className='form-label'>Número do Documento</label>
                    <Input
                      type='text'
                      value={editData.numero_documento}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          numero_documento: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className='row'>
                <div className='col-md-4'>
                  <div className='mb-3'>
                    <label className='form-label'>Valor Original *</label>
                    <Input
                      type='number'
                      step='0.01'
                      value={editData.valor_original}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          valor_original: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className='mb-3'>
                    <label className='form-label'>Data de Emissão *</label>
                    <Input
                      type='date'
                      value={editData.data_emissao}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          data_emissao: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className='mb-3'>
                    <label className='form-label'>Data de Vencimento *</label>
                    <Input
                      type='date'
                      value={editData.data_vencimento}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          data_vencimento: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className='mb-3'>
                <label className='form-label'>Observações</label>
                <textarea
                  className='form-control'
                  rows={3}
                  value={editData.observacoes}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
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
