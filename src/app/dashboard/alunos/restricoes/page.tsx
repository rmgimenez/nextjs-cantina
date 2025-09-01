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
  referencia: string | null; // id do produto ou id do tipo quando aplicável
  referencia_text?: string | null; // texto amigável para exibição
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
    const payload = { ...novo, aluno_ra: ra } as any;
    // se estiver editando (tem id) usar PUT
    if (novo.id) {
      const res = await fetch('/api/alunos/restricoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNovo(null);
        buscar();
      }
      return;
    }

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
              {/* Referência: mostra campo condicional para PRODUTO ou TIPO */}
              {novo.tipo === 'PRODUTO' && (
                <div>
                  <label className='form-label'>Produto (pesquisar por nome ou código)</label>
                  <div className='d-flex gap-2'>
                    <Input
                      value={novo.referencia_text ?? ''}
                      onChange={(e) => setNovo({ ...novo, referencia_text: e.target.value })}
                      placeholder='Digite e pressione Buscar'
                    />
                    <Button
                      variant='outline'
                      onClick={async () => {
                        const q = novo.referencia_text || '';
                        const res = await fetch(`/api/produtos?q=${encodeURIComponent(q)}`);
                        if (!res.ok) return;
                        const data = await res.json();
                        const p = data.produtos && data.produtos[0];
                        if (p) {
                          setNovo({
                            ...novo,
                            referencia: String(p.id),
                            referencia_text: `${p.id} - ${p.nome}`,
                          });
                        }
                      }}
                    >
                      Buscar
                    </Button>
                  </div>
                  <small className='text-muted'>
                    Ao encontrar, pressione Buscar para selecionar o primeiro resultado.
                  </small>
                </div>
              )}

              {novo.tipo === 'TIPO' && (
                <div>
                  <label className='form-label'>Tipo de Produto (pesquisar)</label>
                  <div className='d-flex gap-2'>
                    <Input
                      value={novo.referencia_text ?? ''}
                      onChange={(e) => setNovo({ ...novo, referencia_text: e.target.value })}
                      placeholder='Digite e pressione Buscar'
                    />
                    <Button
                      variant='outline'
                      onClick={async () => {
                        const q = novo.referencia_text || '';
                        const res = await fetch(`/api/produtos/tipos?q=${encodeURIComponent(q)}`);
                        if (!res.ok) return;
                        const data = await res.json();
                        const t = data.tipos && data.tipos[0];
                        if (t) {
                          setNovo({
                            ...novo,
                            referencia: String(t.id),
                            referencia_text: `${t.id} - ${t.descricao}`,
                          });
                        }
                      }}
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
              )}
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
                    <td>{r.referencia_text ?? r.referencia ?? '-'}</td>
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
                        onClick={() => {
                          // popular o formulário para edição
                          setNovo({
                            id: r.id,
                            aluno_ra: r.aluno_ra,
                            tipo: r.tipo as any,
                            referencia: r.referencia ?? null,
                            referencia_text:
                              r.referencia_text ?? (r.referencia ? String(r.referencia) : ''),
                            motivo: r.motivo,
                            ativo: r.ativo,
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
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
