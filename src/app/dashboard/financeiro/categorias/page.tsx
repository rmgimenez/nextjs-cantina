'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface CategoriaFinanceira {
  id: number;
  nome: string;
  tipo: 'RECEITA' | 'DESPESA';
  descricao?: string;
  ativo: boolean;
  created_at: string;
}

export default function CategoriasFinanceirasPage() {
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'DESPESA' as 'RECEITA' | 'DESPESA',
    descricao: '',
  });
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  useEffect(() => {
    carregarCategorias();
  }, [filtroTipo]);

  const carregarCategorias = async () => {
    try {
      const url = filtroTipo
        ? `/api/financeiro/categorias?tipo=${filtroTipo}`
        : '/api/financeiro/categorias';
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/financeiro/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await carregarCategorias();
        setShowForm(false);
        setFormData({ nome: '', tipo: 'DESPESA', descricao: '' });
        alert('Categoria criada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar categoria');
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
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
        <h1 className='h2 mb-0'>Categorias Financeiras</h1>
        <div className='d-flex gap-2'>
          <a href='/dashboard/financeiro' className='btn btn-outline-secondary'>
            ← Voltar
          </a>
          <Button onClick={() => setShowForm(true)}>Nova Categoria</Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className='mb-4'>
        <div className='card-body'>
          <div className='row'>
            <div className='col-md-3'>
              <label className='form-label'>Tipo</label>
              <select
                className='form-select'
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value=''>Todos</option>
                <option value='RECEITA'>Receita</option>
                <option value='DESPESA'>Despesa</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Nova Categoria */}
      {showForm && (
        <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Nova Categoria</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className='modal-body'>
                  <div className='mb-3'>
                    <label className='form-label'>Nome *</label>
                    <Input
                      type='text'
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className='mb-3'>
                    <label className='form-label'>Tipo *</label>
                    <select
                      className='form-select'
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value as 'RECEITA' | 'DESPESA' })
                      }
                      required
                    >
                      <option value='DESPESA'>Despesa</option>
                      <option value='RECEITA'>Receita</option>
                    </select>
                  </div>

                  <div className='mb-3'>
                    <label className='form-label'>Descrição</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <Button type='submit'>Salvar</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Categorias */}
      <div className='row'>
        <div className='col-md-6'>
          <Card>
            <div className='card-header'>
              <h5 className='mb-0 text-danger'>Despesas</h5>
            </div>
            <div className='card-body'>
              {categorias.filter((c) => c.tipo === 'DESPESA').length > 0 ? (
                <div className='list-group list-group-flush'>
                  {categorias
                    .filter((c) => c.tipo === 'DESPESA')
                    .map((categoria) => (
                      <div key={categoria.id} className='list-group-item px-0'>
                        <div className='d-flex justify-content-between align-items-start'>
                          <div>
                            <h6 className='mb-1'>{categoria.nome}</h6>
                            {categoria.descricao && (
                              <p className='mb-1 text-muted small'>{categoria.descricao}</p>
                            )}
                            <small className='text-muted'>
                              Criada em {formatarData(categoria.created_at)}
                            </small>
                          </div>
                          <span className='badge bg-danger'>Despesa</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className='text-muted'>Nenhuma categoria de despesa encontrada</p>
              )}
            </div>
          </Card>
        </div>

        <div className='col-md-6'>
          <Card>
            <div className='card-header'>
              <h5 className='mb-0 text-success'>Receitas</h5>
            </div>
            <div className='card-body'>
              {categorias.filter((c) => c.tipo === 'RECEITA').length > 0 ? (
                <div className='list-group list-group-flush'>
                  {categorias
                    .filter((c) => c.tipo === 'RECEITA')
                    .map((categoria) => (
                      <div key={categoria.id} className='list-group-item px-0'>
                        <div className='d-flex justify-content-between align-items-start'>
                          <div>
                            <h6 className='mb-1'>{categoria.nome}</h6>
                            {categoria.descricao && (
                              <p className='mb-1 text-muted small'>{categoria.descricao}</p>
                            )}
                            <small className='text-muted'>
                              Criada em {formatarData(categoria.created_at)}
                            </small>
                          </div>
                          <span className='badge bg-success'>Receita</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className='text-muted'>Nenhuma categoria de receita encontrada</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
