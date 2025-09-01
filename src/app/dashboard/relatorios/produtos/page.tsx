'use client';
import { useEffect, useState } from 'react';
// import DashboardLayout from "@/components/layout/dashboard-layout";

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  valor_total: number;
}

export default function RelatorioProdutosPage() {
  const hoje = new Date().toISOString().slice(0, 10);
  const inicioDefault = new Date();
  inicioDefault.setDate(inicioDefault.getDate() - 30);
  const [inicio, setInicio] = useState(inicioDefault.toISOString().slice(0, 10));
  const [fim, setFim] = useState(hoje);
  const [dados, setDados] = useState<{
    totalValor: number;
    produtos: Produto[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/relatorios/gerenciais/produtos?inicio=${inicio}&fim=${fim}`);
      if (res.ok) {
        const j = await res.json();
        setDados({ totalValor: j.totalValor, produtos: j.produtos });
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    carregar(); // eslint-disable-next-line
  }, []);
  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Relatório de Produtos</h1>
        <p className='text-muted mb-0'>Produtos mais vendidos no período</p>
      </div>

      <div className='card mb-3'>
        <div className='card-body d-flex flex-wrap gap-2 align-items-end'>
          {' '}
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
          <button className='btn btn-primary' disabled={loading} onClick={carregar}>
            {loading ? 'Carregando...' : 'Aplicar'}
          </button>
          {dados && (
            <div className='ms-auto fw-bold'>Total: {formatCurrency(dados.totalValor)}</div>
          )}
        </div>
      </div>
      <div className='card'>
        <div className='card-header'>
          <strong>Ranking</strong>
        </div>
        <div className='table-responsive'>
          <table className='table table-sm mb-0'>
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th className='text-end'>Qtd</th>
                <th className='text-end'>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dados?.produtos.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>{p.nome}</td>
                  <td className='text-end'>{p.quantidade}</td>
                  <td className='text-end'>{formatCurrency(p.valor_total)}</td>
                </tr>
              ))}
              {(!dados || dados.produtos.length === 0) && (
                <tr>
                  <td colSpan={4} className='text-center text-muted'>
                    Sem dados
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
