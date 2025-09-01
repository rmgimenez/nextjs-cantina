'use client';
import { useEffect, useState } from 'react';

interface VendaDiaria {
  data: string;
  vendas: number;
  total: number;
}

export default function RelatorioVendasPage() {
  const hoje = new Date().toISOString().slice(0, 10);
  const inicioDefault = new Date();
  inicioDefault.setDate(inicioDefault.getDate() - 7);
  const [inicio, setInicio] = useState(inicioDefault.toISOString().slice(0, 10));
  const [fim, setFim] = useState(hoje);
  const [carregando, setCarregando] = useState(false);
  const [dados, setDados] = useState<{
    sumario: { vendas: number; total: number };
    diarios: VendaDiaria[];
  } | null>(null);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await fetch(`/api/relatorios/gerenciais/vendas?inicio=${inicio}&fim=${fim}`);
      if (res.ok) {
        const json = await res.json();
        setDados({ sumario: json.sumario, diarios: json.diarios });
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar(); // eslint-disable-next-line
  }, []);

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      {/* Cabeçalho local (o layout pai já renderiza o header/sidebar) */}
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Relatório de Vendas</h1>
        <p className='text-muted mb-0'>Resumo de vendas por dia</p>
      </div>

      <div className='card mb-3'>
        <div className='card-body d-flex flex-wrap gap-2 align-items-end'>
          <div>
            <label className='form-label mb-1'>Início</label>
            <input
              type='date'
              className='form-control'
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div>
            <label className='form-label mb-1'>Fim</label>
            <input
              type='date'
              className='form-control'
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
          <button className='btn btn-primary' disabled={carregando} onClick={carregar}>
            {carregando ? 'Carregando...' : 'Aplicar'}
          </button>
          {dados && (
            <div className='ms-auto text-end'>
              <div className='fw-bold'>Total: {formatCurrency(dados.sumario.total)}</div>
              <small>{dados.sumario.vendas} vendas</small>
            </div>
          )}
        </div>
      </div>

      <div className='card'>
        <div className='card-header'>
          <strong>Vendas por Dia</strong>
        </div>
        <div className='table-responsive'>
          <table className='table table-sm mb-0'>
            <thead>
              <tr>
                <th>Data</th>
                <th className='text-end'>Vendas</th>
                <th className='text-end'>Total</th>
              </tr>
            </thead>
            <tbody>
              {dados?.diarios.map((d) => (
                <tr key={d.data}>
                  <td>{new Date(d.data).toLocaleDateString('pt-BR')}</td>
                  <td className='text-end'>{d.vendas}</td>
                  <td className='text-end'>{formatCurrency(d.total)}</td>
                </tr>
              ))}
              {(!dados || dados.diarios.length === 0) && (
                <tr>
                  <td colSpan={3} className='text-center text-muted'>
                    Sem dados no período
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
