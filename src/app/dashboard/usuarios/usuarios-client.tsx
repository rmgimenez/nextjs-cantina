'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';

type Usuario = { id: number; usuario: string; nome: string; tipo: string; ativo: number };
type Aluno = {
  ra: number;
  nome: string;
  curso: string;
  serie: string;
  turma: string;
  fotoUrl: string;
};
type Funcionario = { id: number; nome: string; cargo: string; valorRefeicao: number | null };
type PrecoCargo = {
  id: number;
  cargo: string;
  descricao: string;
  valor_refeicao: number;
  ativo: number;
};

export default function UsuariosClient() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [precosCargo, setPrecosCargo] = useState<PrecoCargo[]>([]);
  const [tab, setTab] = useState<'usuarios' | 'alunos' | 'funcionarios'>('usuarios');
  const [searchAluno, setSearchAluno] = useState('');
  const [searchFunc, setSearchFunc] = useState('');
  const [cargoForm, setCargoForm] = useState({ cargo: '', descricao: '', valor: '' });
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
    fetch('/api/funcionarios/preco-cargo')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setPrecosCargo(data.precos || []))
      .catch(() => {});
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

  const handleResetPassword = async (id: number) => {
    if (!confirm('Resetar senha do usuário para "senha123"?')) return;
    try {
      const res = await fetch('/api/usuarios', {
        method: 'PATCH',
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
        console.error('reset password failed', res.status, errBody);
        throw new Error('reset_failed');
      }
      alert('Senha resetada para: senha123');
      await fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert('Falha ao resetar senha');
    }
  };

  async function searchAlunos() {
    if (!searchAluno) return setAlunos([]);
    try {
      const res = await fetch('/api/alunos?q=' + encodeURIComponent(searchAluno));
      if (res.ok) {
        const data = await res.json();
        setAlunos(data.alunos || []);
      }
    } catch {}
  }

  async function searchFuncionarios() {
    if (!searchFunc) return setFuncionarios([]);
    try {
      const res = await fetch('/api/funcionarios?q=' + encodeURIComponent(searchFunc));
      if (res.ok) {
        const data = await res.json();
        setFuncionarios(data.funcionarios || []);
      }
    } catch {}
  }

  async function salvarPrecoCargo() {
    if (!cargoForm.cargo || !cargoForm.valor) return;
    const payload = {
      cargo: cargoForm.cargo,
      descricao: cargoForm.descricao || cargoForm.cargo,
      valor: parseFloat(cargoForm.valor.replace(',', '.')),
    };
    try {
      const res = await fetch('/api/funcionarios/preco-cargo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const lista = await fetch('/api/funcionarios/preco-cargo').then((r) => r.json());
        setPrecosCargo(lista.precos || []);
        setCargoForm({ cargo: '', descricao: '', valor: '' });
      }
    } catch {}
  }

  function renderUsuariosTab() {
    return (
      <>
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
                        <Button
                          variant='warning'
                          className='me-2'
                          onClick={() => handleResetPassword(u.id)}
                        >
                          Resetar senha
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
      </>
    );
  }

  function renderAlunosTab() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alunos (consulta)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='row g-2 mb-3'>
            <div className='col-md-6'>
              <Input
                label='Buscar por RA ou Nome'
                value={searchAluno}
                onChange={(e) => setSearchAluno(e.target.value)}
              />
            </div>
            <div className='col-md-2 d-flex align-items-end'>
              <Button variant='primary' onClick={searchAlunos}>
                Buscar
              </Button>
            </div>
          </div>
          <div className='table-responsive'>
            <table className='table table-sm'>
              <thead>
                <tr>
                  <th>RA</th>
                  <th>Nome</th>
                  <th>Curso</th>
                  <th>Série</th>
                  <th>Turma</th>
                  <th>Foto</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((a) => (
                  <tr key={a.ra}>
                    <td>{a.ra}</td>
                    <td>{a.nome}</td>
                    <td>{a.curso}</td>
                    <td>{a.serie}</td>
                    <td>{a.turma}</td>
                    <td>
                      <img src={a.fotoUrl} alt={a.nome} style={{ width: 40, height: 40 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderFuncionariosTab() {
    return (
      <>
        <Card className='mb-3'>
          <CardHeader>
            <CardTitle>Funcionários Escola</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='row g-2 mb-3'>
              <div className='col-md-6'>
                <Input
                  label='Buscar por Código, Nome ou Cargo'
                  value={searchFunc}
                  onChange={(e) => setSearchFunc(e.target.value)}
                />
              </div>
              <div className='col-md-2 d-flex align-items-end'>
                <Button variant='primary' onClick={searchFuncionarios}>
                  Buscar
                </Button>
              </div>
            </div>
            <div className='table-responsive mb-4'>
              <table className='table table-sm'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Valor Refeição</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((f) => (
                    <tr key={f.id}>
                      <td>{f.id}</td>
                      <td>{f.nome}</td>
                      <td>{f.cargo}</td>
                      <td>{f.valorRefeicao != null ? f.valorRefeicao.toFixed(2) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h6>Definir / Atualizar Preço por Cargo</h6>
            <div className='row g-2'>
              <div className='col-md-3'>
                <Input
                  label='Cargo'
                  value={cargoForm.cargo}
                  onChange={(e) => setCargoForm({ ...cargoForm, cargo: e.target.value })}
                />
              </div>
              <div className='col-md-4'>
                <Input
                  label='Descrição'
                  value={cargoForm.descricao}
                  onChange={(e) => setCargoForm({ ...cargoForm, descricao: e.target.value })}
                />
              </div>
              <div className='col-md-2'>
                <Input
                  label='Valor (R$)'
                  value={cargoForm.valor}
                  onChange={(e) => setCargoForm({ ...cargoForm, valor: e.target.value })}
                />
              </div>
              <div className='col-md-2 d-flex align-items-end'>
                <Button variant='success' onClick={salvarPrecoCargo}>
                  Salvar Preço
                </Button>
              </div>
            </div>
            <div className='table-responsive mt-3'>
              <table className='table table-sm'>
                <thead>
                  <tr>
                    <th>Cargo</th>
                    <th>Descrição</th>
                    <th>Valor Refeição</th>
                    <th>Ativo</th>
                  </tr>
                </thead>
                <tbody>
                  {precosCargo.map((p) => (
                    <tr key={p.id}>
                      <td>{p.cargo}</td>
                      <td>{p.descricao}</td>
                      <td>{p.valor_refeicao?.toFixed(2)}</td>
                      <td>{p.ativo ? 'Sim' : 'Não'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <div>
      <div className='mb-3'>
        <div className='btn-group'>
          <Button
            variant={tab === 'usuarios' ? 'primary' : 'outline'}
            onClick={() => setTab('usuarios')}
          >
            Usuários Cantina
          </Button>
          <Button
            variant={tab === 'alunos' ? 'primary' : 'outline'}
            onClick={() => setTab('alunos')}
          >
            Alunos
          </Button>
          <Button
            variant={tab === 'funcionarios' ? 'primary' : 'outline'}
            onClick={() => setTab('funcionarios')}
          >
            Funcionários Escola
          </Button>
        </div>
      </div>
      {tab === 'usuarios' && renderUsuariosTab()}
      {tab === 'alunos' && renderAlunosTab()}
      {tab === 'funcionarios' && renderFuncionariosTab()}
    </div>
  );
}
