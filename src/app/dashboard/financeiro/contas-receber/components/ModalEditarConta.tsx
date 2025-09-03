'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoriaFinanceira, FormDataConta } from '../types';

interface ModalEditarContaProps {
  show: boolean;
  onClose: () => void;
  formData: FormDataConta;
  setFormData: (data: FormDataConta) => void;
  categorias: CategoriaFinanceira[];
  onSubmit: (e: React.FormEvent) => void;
}

export default function ModalEditarConta({
  show,
  onClose,
  formData,
  setFormData,
  categorias,
  onSubmit,
}: ModalEditarContaProps) {
  if (!show) return null;

  return (
    <div
      className='modal show d-block'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className='modal-dialog modal-lg'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Editar Conta a Receber</h5>
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
                      value={formData.categoria_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                    <label className='form-label'>Cliente</label>
                    <Input
                      type='text'
                      value={formData.cliente}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: e.target.value,
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
                      value={formData.numero_documento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                      value={formData.valor_original}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                      value={formData.data_emissao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                      value={formData.data_vencimento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
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
