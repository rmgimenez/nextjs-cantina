"use client";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FiRefreshCw } from "react-icons/fi";

interface ProdutoSaldo {
  id: number;
  nome: string;
  saldo: number;
  estoque_minimo: number;
  preco_unitario: number;
}
interface Mov {
  id: number;
  produto_id: number;
  produto_nome: string;
  tipo_mov: string;
  quantidade: number;
  created_at: string;
  referencia?: string;
  observacao?: string;
}
interface Ranking {
  id: number;
  nome: string;
  quantidade: number;
  valor_total: number;
}

export default function RelatoriosEstoquePage() {
  const [diasTop, setDiasTop] = useState(30);
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/estoque/relatorios?diasTop=${diasTop}`);
      if (res.ok) {
        const j = await res.json();
        setDados(j);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <DashboardLayout
      title="Relatórios de Estoque"
      subtitle="Análises operacionais do estoque"
    >
      <div className="d-flex gap-2 align-items-end mb-3 flex-wrap">
        <div style={{ maxWidth: 160 }}>
          <label className="form-label mb-1">Dias Ranking</label>
          <select
            className="form-select"
            value={diasTop}
            onChange={(e) => setDiasTop(Number(e.target.value))}
          >
            <option value={7}>7 dias</option>
            <option value={15}>15 dias</option>
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
          </select>
        </div>
        <Button
          variant="outline"
          icon={<FiRefreshCw />}
          loading={loading}
          onClick={carregar}
        >
          Atualizar
        </Button>
      </div>

      {dados && (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-md-3">
            <div className="card">
              <div className="card-body">
                <p className="text-muted mb-1">Produtos</p>
                <h5>{dados.resumo.totalProdutos}</h5>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card">
              <div className="card-body">
                <p className="text-muted mb-1">Sem Estoque</p>
                <h5>{dados.resumo.outOfStock}</h5>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card">
              <div className="card-body">
                <p className="text-muted mb-1">Baixo Estoque</p>
                <h5>{dados.resumo.lowStock}</h5>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card">
              <div className="card-body">
                <p className="text-muted mb-1">Ranking (Top)</p>
                <h5>{dados.produtosMaisVendidos.length}</h5>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">Produtos em Falta</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Saldo</th>
                      <th>Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados?.outOfStock?.map((p: ProdutoSaldo) => (
                      <tr key={p.id}>
                        <td>{p.nome}</td>
                        <td>{p.saldo}</td>
                        <td>{p.estoque_minimo ?? "-"}</td>
                      </tr>
                    ))}
                    {dados?.outOfStock?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          Nenhum
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">Produtos com Baixo Estoque</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Saldo</th>
                      <th>Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados?.lowStock?.map((p: ProdutoSaldo) => (
                      <tr key={p.id} className="table-warning">
                        <td>{p.nome}</td>
                        <td>{p.saldo}</td>
                        <td>{p.estoque_minimo ?? "-"}</td>
                      </tr>
                    ))}
                    {dados?.lowStock?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          Nenhum
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header">Movimentações Recentes</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Prod.</th>
                      <th>Tipo</th>
                      <th>Qtd</th>
                      <th>Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados?.movimentacoesRecentes?.map((m: Mov) => (
                      <tr key={m.id}>
                        <td>
                          {new Date(m.created_at).toLocaleString("pt-BR")}
                        </td>
                        <td>{m.produto_nome}</td>
                        <td>{m.tipo_mov}</td>
                        <td>{m.quantidade}</td>
                        <td>{m.referencia || "-"}</td>
                      </tr>
                    ))}
                    {dados?.movimentacoesRecentes?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-3">
                          Nenhuma
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header">
              Produtos Mais Vendidos (últimos {diasTop} dias)
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Qtd</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados?.produtosMaisVendidos?.map((r: Ranking) => (
                      <tr key={r.id}>
                        <td>{r.nome}</td>
                        <td>{r.quantidade}</td>
                        <td>R$ {Number(r.valor_total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    {dados?.produtosMaisVendidos?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          Nenhum
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
