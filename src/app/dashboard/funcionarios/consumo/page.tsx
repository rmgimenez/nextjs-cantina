'use client';
import { useEffect, useState } from 'react';

interface Agregado {
  funcionario_id: number;
  funcionario_nome: string;
  qtde_vendas: number;
  total: number;
}
interface Detalhe {
  id: number;
  created_at: string;
  funcionario_id: number;
  funcionario_nome: string;
  forma_pagamento: string;
  valor_venda: number;
  itens: number;
}

export default function ConsumoContaPage() {
  const hoje = new Date();
  const defaultInicio = new Date();
  defaultInicio.setDate(hoje.getDate() - 30);
  const [inicio, setInicio] = useState<string>(defaultInicio.toISOString().slice(0, 10));
  const [fim, setFim] = useState<string>(hoje.toISOString().slice(0, 10));
  const [funcionarioId, setFuncionarioId] = useState<string>('');
  const [agregados, setAgregados] = useState<Agregado[]>([]);
  const [detalhes, setDetalhes] = useState<Detalhe[]>([]);
  const [totalPeriodo, setTotalPeriodo] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const carregar = async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      qp.set('inicio', inicio);
      qp.set('fim', fim);
      if (funcionarioId.trim() !== '') qp.set('funcionarioId', funcionarioId.trim());
      const res = await fetch(`/api/relatorios/funcionarios/consumo?${qp.toString()}`);
      if (!res.ok) throw new Error('Erro ao carregar');
      const j = await res.json();
      setAgregados(j.agregados || []);
      setDetalhes(j.detalhes || []);
      setTotalPeriodo(j.totalPeriodo || 0);
    } catch (err) {
      console.error('Erro carregando relatório', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar(); /* eslint-disable-next-line */
  }, []);

  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Consumo marcado na conta (Funcionários)</h1>
        <p className='text-muted mb-0'>
          Relatório de todas as compras marcadas na conta dos funcionários
        </p>
      </div>

      <div className='card mb-3'>
        <div className='card-body row g-3 align-items-end'>
          <div className='col-auto'>
            <label className='form-label mb-1'>Início</label>
            <input
              type='date'
              className='form-control'
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div className='col-auto'>
            <label className='form-label mb-1'>Fim</label>
            <input
              type='date'
              className='form-control'
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
          <div className='col-auto'>
            <label className='form-label mb-1'>Código Funcionário (opcional)</label>
            <input
              type='text'
              className='form-control'
              value={funcionarioId}
              onChange={(e) => setFuncionarioId(e.target.value)}
              placeholder='Ex: 123'
            />
          </div>
          <div className='col-auto d-flex gap-2'>
            <button className='btn btn-primary' disabled={loading} onClick={carregar}>
              {loading ? 'Carregando...' : 'Carregar'}
            </button>
          </div>
        </div>
      </div>

      <div className='row g-3'>
        <div className='col-md-5'>
          <div className='card mb-3'>
            <div className='card-header'>
              <strong>Totais por Funcionário</strong>
            </div>
            <div className='table-responsive'>
              <table className='table table-sm mb-0'>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Funcionário</th>
                    <th className='text-end'>Total</th>
                    <th className='text-end'># Vendas</th>
                  </tr>
                </thead>
                <tbody>
                  {agregados.map((a) => (
                    <tr key={a.funcionario_id}>
                      <td>{a.funcionario_id}</td>
                      <td>{a.funcionario_nome}</td>
                      <td className='text-end'>{fmt(Number(a.total))}</td>
                      <td className='text-end'>{a.qtde_vendas}</td>
                    </tr>
                  ))}
                  {agregados.length === 0 && (
                    <tr>
                      <td colSpan={4} className='text-center text-muted'>
                        Nenhum registro
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>
                      <strong>Total período</strong>
                    </td>
                    <td className='text-end'>
                      <strong>{fmt(Number(totalPeriodo))}</strong>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className='col-md-7'>
          <div className='card'>
            <div className='card-header'>
              <strong>Detalhes (até 1000 registros)</strong>
            </div>
            <div className='table-responsive'>
              <table className='table table-sm mb-0'>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>ID Venda</th>
                    <th>Funcionário</th>
                    <th>Forma</th>
                    <th className='text-end'>Valor</th>
                    <th className='text-end'>Itens</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhes.map((d) => (
                    <tr key={d.id}>
                      <td>{new Date(d.created_at).toLocaleString()}</td>
                      <td>{d.id}</td>
                      <td>
                        {d.funcionario_nome} ({d.funcionario_id})
                      </td>
                      <td>{d.forma_pagamento}</td>
                      <td className='text-end'>{fmt(Number(d.valor_venda))}</td>
                      <td className='text-end'>{d.itens}</td>
                    </tr>
                  ))}
                  {detalhes.length === 0 && (
                    <tr>
                      <td colSpan={6} className='text-center text-muted'>
                        Nenhum registro
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
