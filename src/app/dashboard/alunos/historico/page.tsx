'use client';
import { useState } from 'react';
// import DashboardLayout from "@/components/layout/dashboard-layout";

interface VendaAluno {
  id: number;
  created_at: string;
  valor_liquido: number;
  itens: number;
  produtos: string;
  forma_pagamento?: string;
}

interface ProdutoAgregado {
  produto_id: number;
  nome: string;
  quantidade_total: number;
  valor_total: number;
}

export default function HistoricoAlunoPage() {
  const hoje = new Date().toISOString().slice(0, 10);
  const inicioDefault = new Date();
  inicioDefault.setDate(inicioDefault.getDate() - 15);
  const [alunoRa, setAlunoRa] = useState('');
  const [alunoTerm, setAlunoTerm] = useState('');
  const [suggestions, setSuggestions] = useState<
    { ra: number; nome: string; curso?: string; serie?: any; turma?: any; fotoUrl?: string }[]
  >([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<(typeof suggestions)[0] | null>(null);
  const [inicio, setInicio] = useState(inicioDefault.toISOString().slice(0, 10));
  const [fim, setFim] = useState(hoje);
  const [vendas, setVendas] = useState<VendaAluno[]>([]);
  const [total, setTotal] = useState(0);
  const [produtos, setProdutos] = useState<ProdutoAgregado[]>([]);
  const [totaisPorForma, setTotaisPorForma] = useState<{ forma: string; total: number }[]>([]);
  const [saldoAtual, setSaldoAtual] = useState<number | null>(null);
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
        setProdutos(j.produtos || []);
        setTotaisPorForma(
          (j.totaisPorForma || []).map((t: any) => ({
            forma: t.forma_pagamento,
            total: Number(t.total),
          }))
        );
        setSaldoAtual(typeof j.saldoAtual !== 'undefined' ? Number(j.saldoAtual) : null);
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
          <div style={{ minWidth: 220 }}>
            <label className='form-label mb-1'>Aluno (RA ou nome)</label>
            <input
              className='form-control'
              value={alunoTerm}
              onChange={async (e) => {
                const v = e.target.value;
                setAlunoTerm(v);
                setAlunoSelecionado(null);
                setAlunoRa('');
                if (v && v.length >= 2) {
                  try {
                    const res = await fetch(`/api/alunos?q=${encodeURIComponent(v)}`);
                    if (res.ok) {
                      const j = await res.json();
                      setSuggestions(j.alunos || []);
                    }
                  } catch (err) {
                    setSuggestions([]);
                  }
                } else {
                  setSuggestions([]);
                }
              }}
              placeholder='Digite RA ou parte do nome'
            />
            {suggestions.length > 0 && (
              <div className='list-group mt-1' style={{ maxHeight: 220, overflow: 'auto' }}>
                {suggestions.map((s) => (
                  <button
                    key={s.ra}
                    type='button'
                    className='list-group-item list-group-item-action'
                    onClick={() => {
                      setAlunoSelecionado(s);
                      setAlunoTerm(`${s.nome} (${s.ra})`);
                      setAlunoRa(String(s.ra));
                      setSuggestions([]);
                    }}
                  >
                    <div className='d-flex justify-content-between'>
                      <div>{s.nome}</div>
                      <small className='text-muted'>RA {s.ra}</small>
                    </div>
                    <div className='small text-muted'>
                      {s.curso} {s.serie ? `- ${s.serie}` : ''} {s.turma ? `/ ${s.turma}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
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
          <div className='ms-2'>
            <button
              className='btn btn-outline-secondary'
              onClick={() => {
                // limpar seleção
                setAlunoSelecionado(null);
                setAlunoTerm('');
                setAlunoRa('');
                setSuggestions([]);
                setVendas([]);
                setProdutos([]);
                setTotaisPorForma([]);
                setSaldoAtual(null);
                setTotal(0);
              }}
            >
              Limpar
            </button>
          </div>
          {total > 0 && <div className='ms-auto fw-bold'>Total: {fmt(total)}</div>}
        </div>
      </div>
      {alunoSelecionado && (
        <div className='card mb-3'>
          <div className='card-body d-flex gap-3 align-items-center'>
            <img
              src={alunoSelecionado.fotoUrl}
              alt='foto'
              width={96}
              height={96}
              className='rounded'
            />
            <div>
              <h5 className='mb-0'>{alunoSelecionado.nome}</h5>
              <div className='small text-muted'>RA {alunoSelecionado.ra}</div>
              <div className='small'>
                {alunoSelecionado.curso}{' '}
                {alunoSelecionado.serie ? `- ${alunoSelecionado.serie}` : ''}{' '}
                {alunoSelecionado.turma ? `/ ${alunoSelecionado.turma}` : ''}
              </div>
            </div>
          </div>
        </div>
      )}
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
                <th>Forma</th>
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
                  <td>{v.forma_pagamento || '-'}</td>
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
      <div className='row mt-3'>
        <div className='col-md-6'>
          <div className='card'>
            <div className='card-header'>Totais por forma de pagamento</div>
            <div className='card-body'>
              {totaisPorForma.length === 0 && <div className='text-muted'>Nenhum registro</div>}
              {totaisPorForma.map((t) => (
                <div key={t.forma} className='d-flex justify-content-between'>
                  <div>{t.forma}</div>
                  <div className='fw-bold'>{fmt(t.total)}</div>
                </div>
              ))}
              <div className='d-flex justify-content-between mt-2'>
                <div>Total</div>
                <div className='fw-bold'>{fmt(total)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-md-6'>
          <div className='card'>
            <div className='card-header'>Saldo do aluno</div>
            <div className='card-body'>
              <h5>{saldoAtual !== null ? fmt(saldoAtual) : '—'}</h5>
              <small className='text-muted'>Saldo atual consultado no sistema</small>
            </div>
          </div>
          <div className='card mt-3'>
            <div className='card-header'>Produtos comprados (agregado)</div>
            <div className='card-body'>
              {produtos.length === 0 && <div className='text-muted'>Nenhum produto</div>}
              {produtos.map((p) => (
                <div key={p.produto_id} className='d-flex justify-content-between'>
                  <div>
                    {p.nome} <small className='text-muted'>x{p.quantidade_total}</small>
                  </div>
                  <div className='fw-bold'>{fmt(Number(p.valor_total || 0))}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
