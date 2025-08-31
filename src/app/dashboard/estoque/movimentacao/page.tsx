"use client";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiRefreshCw, FiPlus } from "react-icons/fi";

interface Movimentacao {
  id: number;
  produto_id: number;
  produto_nome: string;
  tipo_mov: string;
  quantidade: number;
  referencia?: string;
  observacao?: string;
  created_at: string;
}
interface ProdutoOpt {
  id: number;
  nome: string;
}

export default function MovimentacaoEstoquePage() {
  const [movs, setMovs] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<ProdutoOpt[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([
        fetch("/api/estoque/movimentacoes"),
        fetch("/api/produtos?q="),
      ]);
      if (mRes.ok) {
        const j = await mRes.json();
        setMovs(j.movimentacoes || []);
      }
      if (pRes.ok) {
        const j = await pRes.json();
        setProdutos(
          (j.produtos || []).map((p: any) => ({ id: p.id, nome: p.nome }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  async function registrar(form: FormData) {
    const produtoId = Number(form.get("produtoId"));
    const tipo_mov = form.get("tipo_mov")?.toString();
    const quantidade = Number(form.get("quantidade"));
    const observacao = form.get("observacao")?.toString();
    if (!produtoId || !tipo_mov || !quantidade) return;
    const res = await fetch("/api/estoque/movimentacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produtoId,
        tipoMov: tipo_mov,
        quantidade,
        observacao,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      carregar();
    }
  }

  return (
    <DashboardLayout
      title="Movimentação de Estoque"
      subtitle="Entradas, saídas e ajustes"
    >
      <div className="d-flex gap-2 mb-3">
        <Button
          variant="primary"
          icon={<FiPlus />}
          onClick={() => setShowForm(true)}
        >
          Nova Movimentação
        </Button>
        <Button
          variant="outline"
          icon={<FiRefreshCw />}
          loading={loading}
          onClick={carregar}
        >
          Atualizar
        </Button>
      </div>
      <div className="card">
        <div className="card-header">Últimas Movimentações</div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-striped mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Referência</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {movs.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{new Date(m.created_at).toLocaleString("pt-BR")}</td>
                    <td>{m.produto_nome}</td>
                    <td>{m.tipo_mov}</td>
                    <td>{m.quantidade}</td>
                    <td>{m.referencia || "-"}</td>
                    <td>{m.observacao || "-"}</td>
                  </tr>
                ))}
                {movs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      Nenhuma movimentação
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form action={registrar}>
                <div className="modal-header">
                  <h5 className="modal-title">Registrar Movimentação</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowForm(false)}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label">Produto</label>
                  <select
                    name="produtoId"
                    className="form-select mb-3"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                  <label className="form-label">Tipo</label>
                  <select
                    name="tipo_mov"
                    className="form-select mb-3"
                    required
                    defaultValue="ENTRADA"
                  >
                    <option value="ENTRADA">Entrada</option>
                    <option value="SAIDA">Saída</option>
                    <option value="AJUSTE_POSITIVO">Ajuste +</option>
                    <option value="AJUSTE_NEGATIVO">Ajuste -</option>
                  </select>
                  <Input
                    name="quantidade"
                    type="number"
                    step="0.001"
                    label="Quantidade"
                    required
                  />
                  <Input name="observacao" label="Observação" />
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Lançar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
