'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi';

interface Movimento {
  id: number;
  tipo: string;
  valor: number;
  origem: string;
  referencia: string;
  observacao?: string;
  created_at: string;
}

export default function SaldoAlunoPage() {
  const [ra, setRa] = useState('');
  const [nome, setNome] = useState('');
  const [saldo, setSaldo] = useState<number | null>(null);
  const [ultimos, setUltimos] = useState<Movimento[]>([]);
  const [searchResults, setSearchResults] = useState<
    {
      ra: number;
      nome: string;
      fotoUrl: string;
    }[]
  >([]);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [valorRecarga, setValorRecarga] = useState('');
  const [observacao, setObservacao] = useState('');
  const [showMovimentos, setShowMovimentos] = useState(false);
  const [alunoInfo, setAlunoInfo] = useState<{
    ra: number;
    nome: string;
    fotoUrl: string;
  } | null>(null);

  // Normaliza valores numéricos recebidos da API (pode vir como string)
  const toNumber = (v: any) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    const s = String(v).replace('.', '.').replace(',', '.');
    const n = Number(s);
    return Number.isNaN(n) ? 0 : n;
  };

  async function carregarSaldoForRa(targetRa: string | number) {
    if (!targetRa) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/alunos/saldo?ra=${targetRa}`);
      if (res.ok) {
        const data = await res.json();
        setSaldo(toNumber(data.saldo));
        setUltimos(
          (data.ultimos || []).map((m: any) => ({
            ...m,
            valor: toNumber(m.valor),
          }))
        );
      }
      // Carregar info do aluno (nome/foto)
      const resAluno = await fetch(`/api/alunos?q=${targetRa}`);
      if (resAluno.ok) {
        const dataAluno = await resAluno.json();
        if (dataAluno.alunos && dataAluno.alunos.length > 0) {
          setAlunoInfo(dataAluno.alunos[0]);
        } else {
          setAlunoInfo(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function carregarSaldo() {
    if (!ra) return;
    await carregarSaldoForRa(ra);
  }

  async function buscarAlunos(term: string) {
    if (!term) return setSearchResults([]);
    setLoading(true);
    try {
      const res = await fetch(`/api/alunos?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.alunos || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function carregarMovimentos() {
    if (!ra) return;
    setShowMovimentos(true);
    const res = await fetch(`/api/alunos/saldo/mov?ra=${ra}&limit=200`);
    if (res.ok) {
      const data = await res.json();
      setMovimentos(
        (data.movimentos || []).map((m: any) => ({
          ...m,
          valor: toNumber(m.valor),
        }))
      );
    }
  }

  async function recarregar(e: React.FormEvent) {
    e.preventDefault();
    if (!ra || !valorRecarga) return;
    const valor = parseFloat(valorRecarga);
    if (!valor || valor <= 0) return;
    const res = await fetch('/api/alunos/saldo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ra, valor, observacao }),
    });
    if (res.ok) {
      setValorRecarga('');
      setObservacao('');
      carregarSaldo();
    }
  }

  return (
    <div className='space-y-4'>
      <h4 className='fw-bold'>Saldo e Recargas de Aluno</h4>
      <Card>
        <CardHeader>
          <CardTitle>Buscar Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='d-flex gap-2 flex-wrap align-items-end'>
            <div style={{ minWidth: 160 }}>
              <Input label='RA' value={ra} onChange={(e) => setRa(e.target.value)} />
            </div>
            <div style={{ minWidth: 260 }}>
              <Input
                label='Nome'
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder='Pesquisar por nome (ex: Maria)'
              />
            </div>
            <Button
              variant='primary'
              icon={<FiSearch />}
              onClick={async () => {
                // Prioriza RA quando preenchido; caso contrário, busca por nome
                if (ra) {
                  await carregarSaldo();
                } else if (nome) {
                  await buscarAlunos(nome);
                }
              }}
              loading={loading}
            >
              Buscar
            </Button>
            <Button
              variant='outline'
              icon={<FiRefreshCw />}
              onClick={() => {
                if (ra) carregarSaldo();
              }}
            />
            {saldo !== null && (
              <div className='ms-auto'>
                <span className='text-muted me-2'>Saldo Atual:</span>
                <strong className={saldo < 0 ? 'text-danger' : 'text-success'}>
                  R$ {saldo.toFixed(2)}
                </strong>
              </div>
            )}
          </div>
          {alunoInfo && (
            <div className='d-flex align-items-center gap-3 mt-3 border rounded p-2 bg-light'>
              <img
                src={alunoInfo.fotoUrl}
                alt={alunoInfo.nome}
                style={{
                  width: 72,
                  height: 72,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://via.placeholder.com/72x72?text=Aluno';
                }}
              />
              <div className='flex-grow-1'>
                <div className='fw-semibold'>{alunoInfo.nome}</div>
                <div className='text-muted small'>RA: {alunoInfo.ra}</div>
              </div>
              {saldo !== null && (
                <div className='text-end d-none d-md-block'>
                  <div className='text-muted small'>Saldo</div>
                  <div className={'fw-bold ' + (saldo < 0 ? 'text-danger' : 'text-success')}>
                    R$ {saldo.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Lista de resultados ao buscar por nome */}
          {searchResults.length > 0 && (
            <div className='mt-3'>
              <div className='fw-semibold mb-2'>Resultados</div>
              <div className='list-group'>
                {searchResults.map((a) => (
                  <button
                    key={a.ra}
                    type='button'
                    className='list-group-item list-group-item-action d-flex align-items-center'
                    onClick={async () => {
                      setSearchResults([]);
                      setRa(String(a.ra));
                      setAlunoInfo(a);
                      await carregarSaldoForRa(a.ra);
                    }}
                  >
                    <img
                      src={a.fotoUrl}
                      alt={a.nome}
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://via.placeholder.com/40x40?text=Aluno';
                      }}
                      className='me-2'
                    />
                    <div className='flex-grow-1 text-start'>
                      <div className='fw-semibold'>{a.nome}</div>
                      <div className='small text-muted'>RA: {a.ra}</div>
                    </div>
                    <div className='text-end small text-primary'>Selecionar</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {saldo !== null && (
        <div className='row g-3'>
          <div className='col-md-4'>
            <Card>
              <CardHeader>
                <CardTitle>Recarga de Saldo</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={recarregar} className='vstack gap-2'>
                  <Input
                    type='number'
                    step='0.01'
                    label='Valor (R$)'
                    value={valorRecarga}
                    onChange={(e) => setValorRecarga(e.target.value)}
                    required
                  />
                  <label className='form-label'>Observação</label>
                  <textarea
                    className='form-control'
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={2}
                  />
                  <Button type='submit' variant='success' icon={<FiPlus />}>
                    Creditar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className='col-md-8'>
            <Card>
              <CardHeader>
                <CardTitle>Últimos Movimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='table-responsive'>
                  <table className='table table-sm'>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Origem</th>
                        <th>Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimos.map((m) => (
                        <tr key={m.id}>
                          <td>{new Date(m.created_at).toLocaleString()}</td>
                          <td>
                            <span
                              className={
                                'badge ' + (m.tipo === 'CREDITO' ? 'bg-success' : 'bg-danger')
                              }
                            >
                              {m.tipo}
                            </span>
                          </td>
                          <td>
                            {m.tipo === 'DEBITO' ? '-' : ''}R$ {m.valor.toFixed(2)}
                          </td>
                          <td>{m.origem}</td>
                          <td>{m.referencia}</td>
                        </tr>
                      ))}
                      {ultimos.length === 0 && (
                        <tr>
                          <td colSpan={5} className='text-center text-muted'>
                            Sem movimentos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Button
                  variant='outline'
                  size='small'
                  onClick={carregarMovimentos}
                  className='mt-2'
                >
                  Ver histórico completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {showMovimentos && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='table-responsive' style={{ maxHeight: 400 }}>
              <table className='table table-sm table-hover'>
                <thead className='table-light'>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Origem</th>
                    <th>Ref</th>
                    <th>Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.map((m) => (
                    <tr key={m.id}>
                      <td>{new Date(m.created_at).toLocaleString()}</td>
                      <td>{m.tipo}</td>
                      <td className={m.tipo === 'DEBITO' ? 'text-danger' : 'text-success'}>
                        {m.tipo === 'DEBITO' ? '-' : ''}R$ {m.valor.toFixed(2)}
                      </td>
                      <td>{m.origem}</td>
                      <td>{m.referencia}</td>
                      <td className='small'>{m.observacao}</td>
                    </tr>
                  ))}
                  {movimentos.length === 0 && (
                    <tr>
                      <td colSpan={6} className='text-center text-muted'>
                        Sem registros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
