'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';

type Usuario = { id: number; usuario: string; nome: string; tipo: string; ativo: number };

export default function UsuariosClient() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<null | Usuario>(null);
  const [form, setForm] = useState({ usuario: '', nome: '', tipo: 'ATENDENTE', senha: '' });

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/usuarios');
      if (!res.ok) throw new Error('fetch_error');
      const body = await res.json();
      setUsuarios(body.usuarios || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let errBody = null;
        try {
          errBody = await res.json();
        } catch (_) {
          try {
            errBody = await res.text();
          } catch (_) {
            errBody = '<no body>';
          }
        }
        console.error('create failed', res.status, errBody);
        throw new Error('create_failed');
      }
      await fetchUsuarios();
      setForm({ usuario: '', nome: '', tipo: 'ATENDENTE', senha: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (u: Usuario) => {
    setEditing(u);
    setForm({ usuario: u.usuario, nome: u.nome, tipo: u.tipo, senha: '' });
  };

  const handleUpdate = async () => {
    try {
      const payload: any = {
        id: editing?.id,
        nome: form.nome,
        tipo: form.tipo,
        ativo: editing?.ativo,
      };
      const res = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errBody = null;
        try {
          errBody = await res.json();
        } catch (_) {
          errBody = await res.text().catch(() => '<no body>');
        }
        console.error('update failed', res.status, errBody);
        throw new Error('update_failed');
      }
      setEditing(null);
      await fetchUsuarios();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Desativar usuário?')) return;
    try {
      const res = await fetch('/api/usuarios', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        let errBody = null;
        try {
          errBody = await res.json();
        } catch (_) {
          errBody = await res.text().catch(() => '<no body>');
        }
        console.error('delete failed', res.status, errBody);
        throw new Error('delete_failed');
      }
      await fetchUsuarios();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Card className='mb-3'>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='row g-2 align-items-end'>
            <div className='col-md-3'>
              <Input
                label='Usuário'
                value={form.usuario}
                onChange={(e) => handleChange('usuario', e.target.value)}
              />
            </div>
            <div className='col-md-4'>
              <Input
                label='Nome'
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
              />
            </div>
            <div className='col-md-3'>
              <label className='form-label'>Perfil</label>
              <select
                className='form-select'
                value={form.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
              >
                <option value='ADMIN'>ADMIN</option>
                <option value='ATENDENTE'>ATENDENTE</option>
                <option value='ESTOQUISTA'>ESTOQUISTA</option>
              </select>

              {/* Senha apenas ao criar usuário */}
              {!editing && (
                <div className='mt-2'>
                  <Input
                    label='Senha'
                    type='password'
                    value={form.senha}
                    onChange={(e) => handleChange('senha', e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className='col-md-2'>
              {editing ? (
                <>
                  <Button variant='primary' onClick={handleUpdate} className='me-2'>
                    Salvar
                  </Button>
                  <Button variant='secondary' onClick={() => setEditing(null)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button variant='success' onClick={handleCreate}>
                  Criar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='table-responsive'>
            <table className='table table-sm'>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Nome</th>
                  <th>Perfil</th>
                  <th>Ativo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.usuario}</td>
                    <td>{u.nome}</td>
                    <td>{u.tipo}</td>
                    <td>{u.ativo ? 'Sim' : 'Não'}</td>
                    <td>
                      <Button variant='primary' className='me-2' onClick={() => handleEdit(u)}>
                        Editar
                      </Button>
                      <Button variant='danger' onClick={() => handleDelete(u.id)}>
                        Desativar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
