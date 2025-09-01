'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { FiEdit, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';

interface Restricao {
  id: number;
  aluno_ra: string;
  tipo: 'PRODUTO' | 'TIPO' | 'GERAL';
  referencia: string | null; // código do produto ou tipo quando aplicável
  motivo: string;
  ativo: number;
}

export default function RestricoesPage() {
  const [ra, setRa] = useState('');
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [loading, setLoading] = useState(false);
  const [novo, setNovo] = useState<Partial<Restricao> | null>(null);

  async function buscar() {
    if (!ra) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/alunos/restricoes?ra=${encodeURIComponent(ra)}`);
      if (res.ok) {
        const data = await res.json();
        setRestricoes(data.restricoes || []);
      } else {
        setRestricoes([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!ra || !novo) return;
    const payload = { ...novo, aluno_ra: ra };
    const res = await fetch('/api/alunos/restricoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNovo(null);
      buscar();
    }
  }

  async function remover(id: number) {
    if (!confirm('Inativar esta restrição?')) return;
    const res = await fetch(`/api/alunos/restricoes?id=${id}`, { method: 'DELETE' });
    if (res.ok) buscar();
  }

  useEffect(() => {
    // nada por enquanto
  }, []);

  return (
    <div className='space-y-4'>
      <h4 className='fw-bold'>Restrições de Alunos</h4>
      <Card>
        <CardHeader>
          <CardTitle>Buscar por RA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='d-flex gap-2 align-items-end'>
            <div style={{ minWidth: 160 }}>
              <Input label='RA' value={ra} onChange={(e) => setRa(e.target.value)} />
            </div>
            <Button variant='primary' icon={<FiSearch />} onClick={buscar} loading={loading}>
              Buscar
            </Button>
            <Button variant='success' onClick={() => setNovo({ tipo: 'GERAL', motivo: '' })}>
              <FiPlus /> Nova
            </Button>
          </div>
        </CardContent>
      </Card>

      {novo && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Restrição</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criar} className='vstack gap-2'>
              <label className='form-label'>Tipo</label>
              <select
                className='form-select'
                value={novo.tipo}
                onChange={(e) => setNovo({ ...novo, tipo: e.target.value as any })}
              >
                <option value='GERAL'>Geral</option>
                <option value='PRODUTO'>Produto</option>
                <option value='TIPO'>Tipo de Produto</option>
              </select>
              <Input
                label='Referência (opcional: código produto / tipo)'
                value={novo.referencia ?? ''}
                onChange={(e) => setNovo({ ...novo, referencia: e.target.value })}
              />
              <label className='form-label'>Motivo</label>
              <textarea
                className='form-control'
                value={novo.motivo ?? ''}
                onChange={(e) => setNovo({ ...novo, motivo: e.target.value })}
                rows={3}
              />
              <div className='d-flex gap-2'>
                <Button type='submit' variant='primary'>
                  Salvar
                </Button>
                <Button variant='outline' onClick={() => setNovo(null)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Restrições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='table-responsive'>
            <table className='table table-sm align-middle'>
              <thead className='table-light'>
                <tr>
                  <th>Tipo</th>
                  <th>Referência</th>
                  <th>Motivo</th>
                  <th>Ativo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {restricoes.map((r) => (
                  <tr key={r.id} className={r.ativo ? '' : 'text-muted'}>
                    <td>{r.tipo}</td>
                    <td>{r.referencia ?? '-'}</td>
                    <td className='small'>{r.motivo}</td>
                    <td>
                      <span className={'badge ' + (r.ativo ? 'bg-success' : 'bg-secondary')}>
                        {r.ativo ? 'SIM' : 'NÃO'}
                      </span>
                    </td>
                    <td>
                      <Button
                        size='small'
                        variant='outline'
                        icon={<FiEdit />}
                        onClick={() => alert('Editar não implementado no stub')}
                      />
                      <Button
                        size='small'
                        variant='danger'
                        icon={<FiTrash2 />}
                        onClick={() => remover(r.id)}
                        className='ms-2'
                      />
                    </td>
                  </tr>
                ))}
                {restricoes.length === 0 && (
                  <tr>
                    <td colSpan={5} className='text-center text-muted'>
                      Nenhuma restrição encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
