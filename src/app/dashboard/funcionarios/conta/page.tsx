'use client';
import { useState } from 'react';

interface Lancamento {
  id: number;
  funcionario_id: number;
  venda_id: number | null;
  mes: number;
  ano: number;
  valor: number;
  created_at: string;
}

export default function ContaFuncionarioPage() {
  const now = new Date();
  const [q, setQ] = useState('');
  const [funcionario, setFuncionario] = useState<any | null>(null);
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [total, setTotal] = useState(0);
  const [valor, setValor] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const buscarFuncionario = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/funcionarios?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const j = await res.json();
        if (j.funcionarios && j.funcionarios.length > 0) {
          setFuncionario(j.funcionarios[0]);
        } else {
          setFuncionario(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const carregarLancamentos = async (funcId?: number) => {
    if (!funcionario && !funcId) return;
    const id = funcId ?? funcionario.id;
    setLoading(true);
    try {
      const res = await fetch(`/api/funcionarios/conta?funcionarioId=${id}&mes=${mes}&ano=${ano}`);
      if (res.ok) {
        const j = await res.json();
        setLancamentos(j.lancamentos || []);
        setTotal(j.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const adicionarLancamento = async () => {
    if (!funcionario || valor === '') return;
    setSaving(true);
    try {
      const res = await fetch(`/api/funcionarios/conta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcionarioId: funcionario.id, mes, ano, valor: Number(valor) }),
      });
      if (res.ok) {
        setValor('');
        await carregarLancamentos(funcionario.id);
      }
    } finally {
      setSaving(false);
    }
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Conta Mensal - Funcionários</h1>
        <p className='text-muted mb-0'>
          Registre lançamentos e consulte o que será faturado ao departamento pessoal
        </p>
      </div>

      <div className='card mb-3'>
        <div className='card-body row g-3 align-items-end'>
          <div className='col-md-4'>
            <label className='form-label mb-1'>Buscar Funcionário (código ou nome)</label>
            <div className='input-group'>
              <input
                type='text'
                className='form-control'
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                className='btn btn-outline-secondary'
                onClick={buscarFuncionario}
                disabled={loading}
              >
                Buscar
              </button>
            </div>
          </div>

          <div className='col-auto'>
            <label className='form-label mb-1'>Mês</label>
            <select
              className='form-select'
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className='col-auto'>
            <label className='form-label mb-1'>Ano</label>
            <input
              type='number'
              className='form-control'
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
            />
          </div>

          <div className='col-auto d-flex gap-2'>
            <button
              className='btn btn-primary'
              onClick={() => carregarLancamentos()}
              disabled={!funcionario || loading}
            >
              Carregar
            </button>
          </div>
        </div>
      </div>

      {funcionario && (
        <div className='card mb-3'>
          <div className='card-body'>
            <div className='d-flex justify-content-between align-items-start'>
              <div>
                <h5 className='mb-0'>{funcionario.nome}</h5>
                <small className='text-muted'>Cargo: {funcionario.cargo}</small>
              </div>
              <div className='text-end'>
                <div>
                  Total: <strong>{fmt(total)}</strong>
                </div>
              </div>
            </div>

            <hr />

            <div className='row g-2 align-items-end'>
              <div className='col-auto'>
                <label className='form-label mb-1'>Valor</label>
                <input
                  type='number'
                  step='0.01'
                  className='form-control'
                  value={valor as any}
                  onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div className='col-auto'>
                <button className='btn btn-success' disabled={saving} onClick={adicionarLancamento}>
                  {saving ? 'Salvando...' : 'Adicionar Lançamento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='card'>
        <div className='card-header'>Lançamentos</div>
        <div className='table-responsive'>
          <table className='table table-sm mb-0'>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th className='text-end'>Valor</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                  <td>{l.venda_id ? `Venda #${l.venda_id}` : 'Lançamento Manual'}</td>
                  <td className='text-end'>{fmt(Number(l.valor))}</td>
                </tr>
              ))}
              {lancamentos.length === 0 && (
                <tr>
                  <td colSpan={3} className='text-center text-muted'>
                    Sem lançamentos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
