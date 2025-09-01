'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface TipoProduto {
  id: number;
  descricao: string;
  codigo: string;
  exige_peso: number;
  ativo: number;
  created_at: string;
}

export default function TiposProdutosPage() {
  const [tipos, setTipos] = useState<TipoProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ descricao: '', codigo: '', exigePeso: false, ativo: true });

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/produtos/tipos');
      if (!res.ok) return setTipos([]);
      const data = await res.json();
      setTipos(data.tipos || []);
    } catch (e) {
      console.error(e);
      setTipos([]);
    } finally {
      setLoading(false);
    }
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Enviar PUT para atualizar (API espera campos: id, descricao, exige_peso, ativo)
        const res = await fetch('/api/produtos/tipos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            descricao: form.descricao,
            exige_peso: form.exigePeso ? 1 : 0,
            ativo: form.ativo ? 1 : 0,
          }),
        });
        if (res.ok) {
          await carregar();
          setShowForm(false);
          setEditingId(null);
          setForm({ descricao: '', codigo: '', exigePeso: false, ativo: true });
          return;
        }
        const err = await res.json();
        alert(err.error || 'Erro ao atualizar');
        return;
      }

      // Criação (POST) - API espera campo camelCase exigePeso
      const res = await fetch('/api/produtos/tipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: form.descricao,
          codigo: form.codigo,
          exigePeso: form.exigePeso,
        }),
      });
      if (res.ok) {
        await carregar();
        setShowForm(false);
        setForm({ descricao: '', codigo: '', exigePeso: false, ativo: true });
        return;
      }
      const err = await res.json();
      alert(err.error || 'Erro');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar');
    }
  };

  const handleEdit = (t: TipoProduto) => {
    setEditingId(t.id);
    setForm({
      descricao: t.descricao || '',
      codigo: t.codigo || '',
      exigePeso: !!t.exige_peso,
      ativo: !!t.ativo,
    });
    setShowForm(true);
  };

  if (loading) return <div className='p-4'>Carregando...</div>;

  return (
    <div className='container p-4'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <div>
          <h1 className='h4 mb-0'>Tipos de Produto</h1>
          <p className='text-muted mb-0'>Categorias e tipos de produtos</p>
        </div>
        <div className='d-flex gap-2'>
          <a href='/dashboard/produtos' className='btn btn-outline-secondary'>
            ← Voltar
          </a>
          <Button onClick={() => setShowForm(true)}>Novo Tipo</Button>
        </div>
      </div>

      <Card className='mb-3'>
        <div className='card-body'>
          {tipos.length === 0 ? (
            <p className='text-muted'>Nenhum tipo encontrado</p>
          ) : (
            <div className='list-group'>
              {tipos.map((t) => (
                <div
                  key={t.id}
                  className='list-group-item d-flex justify-content-between align-items-center'
                >
                  <div>
                    <strong>{t.descricao}</strong>
                    <div className='small text-muted'>
                      Código: {t.codigo} • {t.exige_peso ? 'Refeição (kg)' : 'Item'}
                    </div>
                  </div>
                  <div className='d-flex gap-2 align-items-center'>
                    <button
                      className='btn btn-sm btn-outline-primary'
                      onClick={() => handleEdit(t)}
                    >
                      Editar
                    </button>
                    <span className={`badge ${t.ativo ? 'bg-success' : 'bg-secondary'}`}>
                      {t.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {showForm && (
        <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Novo Tipo</h5>
                <button className='btn-close' onClick={() => setShowForm(false)} />
              </div>
              <form onSubmit={salvar}>
                <div className='modal-body'>
                  <div className='mb-3'>
                    <label className='form-label'>Descrição *</label>
                    <Input
                      value={form.descricao}
                      onChange={(e) =>
                        setForm({ ...form, descricao: (e.target as HTMLInputElement).value })
                      }
                      required
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Código *</label>
                    <Input
                      value={form.codigo}
                      onChange={(e) =>
                        setForm({ ...form, codigo: (e.target as HTMLInputElement).value })
                      }
                      required
                    />
                  </div>
                  <div className='form-check mb-2'>
                    <input
                      id='exigePeso'
                      className='form-check-input'
                      type='checkbox'
                      checked={form.exigePeso}
                      onChange={(e) =>
                        setForm({ ...form, exigePeso: (e.target as HTMLInputElement).checked })
                      }
                    />
                    <label htmlFor='exigePeso' className='form-check-label'>
                      Venda por peso (refeição)
                    </label>
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
    </div>
  );
}
