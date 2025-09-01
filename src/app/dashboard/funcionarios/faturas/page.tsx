'use client';
import { useEffect, useState } from 'react';

interface Fatura {
  id: number;
  funcionario_id: number;
  funcionario_nome: string;
  mes: number;
  ano: number;
  valor_total: number;
  status: string;
  data_geracao: string;
}

export default function FaturasFuncionariosPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/relatorios/funcionarios/faturas?ano=${ano}&mes=${mes}`);
      if (res.ok) {
        const j = await res.json();
        setFaturas(j.faturas);
      }
    } finally {
      setLoading(false);
    }
  };
  const gerar = async () => {
    setGerando(true);
    try {
      const res = await fetch(`/api/relatorios/funcionarios/faturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ano, mes }),
      });
      if (res.ok) {
        await carregar();
      }
    } finally {
      setGerando(false);
    }
  };
  useEffect(() => {
    carregar(); // eslint-disable-next-line
  }, []);
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Faturas Funcionários</h1>
        <p className='text-muted mb-0'>Fechamento mensal de consumo</p>
      </div>

      <div className='card mb-3'>
        <div className='card-body row g-3 align-items-end'>
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
            <button className='btn btn-primary' disabled={loading} onClick={carregar}>
              {loading ? 'Carregando...' : 'Carregar'}
            </button>
            <button className='btn btn-success' disabled={gerando} onClick={gerar}>
              {gerando ? 'Gerando...' : 'Gerar Faturas'}
            </button>
          </div>
        </div>
      </div>
      <div className='card'>
        <div className='card-header'>
          <strong>
            Faturas {mes}/{ano}
          </strong>
        </div>
        <div className='table-responsive'>
          <table className='table table-sm mb-0'>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th className='text-end'>Valor</th>
                <th>Status</th>
                <th>Gerada em</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map((f) => (
                <tr key={f.id}>
                  <td>{f.funcionario_nome}</td>
                  <td className='text-end'>{fmt(f.valor_total)}</td>
                  <td>{f.status}</td>
                  <td>{new Date(f.data_geracao).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {faturas.length === 0 && (
                <tr>
                  <td colSpan={4} className='text-center text-muted'>
                    Sem faturas
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
