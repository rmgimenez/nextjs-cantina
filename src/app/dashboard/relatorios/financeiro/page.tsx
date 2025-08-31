"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";

interface Performance {
  id: number;
  nome: string;
  vendas: number;
  total: number;
}

export default function RelatorioFinanceiroPage() {
  const hoje = new Date().toISOString().slice(0, 10);
  const inicioDefault = new Date();
  inicioDefault.setDate(inicioDefault.getDate() - 30);
  const [inicio, setInicio] = useState(
    inicioDefault.toISOString().slice(0, 10)
  );
  const [fim, setFim] = useState(hoje);
  const [perf, setPerf] = useState<Performance[]>([]);
  const [sum, setSum] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/relatorios/gerenciais/performance?inicio=${inicio}&fim=${fim}`
      );
      if (res.ok) {
        const j = await res.json();
        setPerf(j.performance);
        setSum(j.totalGeral);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    carregar(); // eslint-disable-next-line
  }, []);
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <DashboardLayout
      title="Relatório Financeiro"
      subtitle="Performance por atendente"
    >
      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap gap-2 align-items-end">
          {" "}
          <div>
            <label className="form-label mb-1">Início</label>
            <input
              type="date"
              className="form-control"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label mb-1">Fim</label>
            <input
              type="date"
              className="form-control"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={carregar}
          >
            {loading ? "Carregando..." : "Aplicar"}
          </button>
          {sum > 0 && <div className="ms-auto fw-bold">Total: {fmt(sum)}</div>}
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <strong>Performance de Vendedores</strong>
        </div>
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuário</th>
                <th className="text-end">Vendas</th>
                <th className="text-end">Total</th>
                <th className="text-end">Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              {perf.map((p, i) => {
                const ticket = p.total / (p.vendas || 1);
                return (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.nome}</td>
                    <td className="text-end">{p.vendas}</td>
                    <td className="text-end">{fmt(p.total)}</td>
                    <td className="text-end">{fmt(ticket)}</td>
                  </tr>
                );
              })}
              {perf.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    Sem dados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
