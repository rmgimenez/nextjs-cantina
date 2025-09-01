'use client';
import { useState } from 'react';
// import DashboardLayout from "@/components/layout/dashboard-layout";

interface VendaAluno {
  id: number;
  created_at: string;
  valor_liquido: number;
  itens: number;
  produtos: string;
}

export default function HistoricoAlunoPage() {
  const hoje = new Date().toISOString().slice(0, 10);
  const inicioDefault = new Date();
  inicioDefault.setDate(inicioDefault.getDate() - 15);
  const [alunoRa, setAlunoRa] = useState('');
  const [inicio, setInicio] = useState(inicioDefault.toISOString().slice(0, 10));
  const [fim, setFim] = useState(hoje);
  const [vendas, setVendas] = useState<VendaAluno[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    if (!alunoRa) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/relatorios/alunos/historico?alunoRa=${alunoRa}&inicio=${inicio}&fim=${fim}`
      );
      if (res.ok) {
        const j = await res.json();
        setVendas(j.vendas);
        setTotal(j.total);
      }
    } finally {
      setLoading(false);
    }
  };
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Histórico de Compras do Aluno</h1>
        <p className='text-muted mb-0'>Consultar vendas por RA</p>
      </div>

      <div className='card mb-3'>
        <div className='card-body d-flex flex-wrap gap-2 align-items-end'>
          {' '}
          <div>
            <label className='form-label mb-1'>RA Aluno</label>
            <input
              className='form-control'
              value={alunoRa}
              onChange={(e) => setAlunoRa(e.target.value)}
              placeholder='RA'
            />
          </div>
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
          <button className='btn btn-primary' disabled={loading || !alunoRa} onClick={carregar}>
            {loading ? 'Carregando...' : 'Buscar'}
          </button>
          {total > 0 && <div className='ms-auto fw-bold'>Total: {fmt(total)}</div>}
        </div>
      </div>
      <div className='card'>
        <div className='card-header'>
          <strong>Vendas</strong>
        </div>
        <div className='table-responsive'>
          <table className='table table-sm mb-0'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th className='text-end'>Valor</th>
                <th className='text-end'>Itens</th>
                <th>Produtos</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                  <td className='text-end'>{fmt(v.valor_liquido)}</td>
                  <td className='text-end'>{v.itens}</td>
                  <td style={{ maxWidth: 260 }}>
                    <small>{v.produtos}</small>
                  </td>
                </tr>
              ))}
              {vendas.length === 0 && (
                <tr>
                  <td colSpan={5} className='text-center text-muted'>
                    Nenhuma venda
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
