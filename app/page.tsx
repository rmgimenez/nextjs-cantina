"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";

type UltimaVenda = {
  id: number;
  valor_total: number;
  dt_venda: string;
  tipo_cliente: "ALUNO" | "FUNCIONARIO" | "GERAL";
  nome_cliente: string;
};

type AlertaEstoque = {
  id: number;
  produto_nome: string;
  tipo_produto: string;
  quantidade_atual: number;
  quantidade_minima: number;
  status_estoque: "CRITICO" | "BAIXO" | "OK";
};

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [vendasHoje, setVendasHoje] = useState({ total: 0, quantidade: 0 });
  const [produtosAtivos, setProdutosAtivos] = useState(0);
  const [alunosAtivos, setAlunosAtivos] = useState(0);
  const [alertas, setAlertas] = useState(0);
  const [ultimasVendas, setUltimasVendas] = useState<UltimaVenda[]>([]);
  const [estoqueBaixo, setEstoqueBaixo] = useState<AlertaEstoque[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/geral", { cache: "no-store" });
        const data = await res.json();
        if (!data.success) {
          const errorMsg = data.details
            ? `${data.error}: ${data.details}`
            : data.error || "Erro ao carregar dashboard";
          throw new Error(errorMsg);
        }
        setVendasHoje(data.data.vendasHoje);
        setProdutosAtivos(data.data.produtosAtivos);
        setAlunosAtivos(data.data.alunosAtivos);
        setAlertas(data.data.alertasEstoque);
        setUltimasVendas(data.data.ultimasVendas);
        setEstoqueBaixo(data.data.estoqueBaixo);
      } catch (e: unknown) {
        console.error("Erro ao carregar dashboard:", e);
        setErro(e instanceof Error ? e.message : "Falha ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <MainLayout>
      <div className="container-fluid">
        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        )}
        {erro && (
          <div className="alert alert-danger" role="alert">
            <h5 className="alert-heading">❌ Erro ao carregar dashboard</h5>
            <p className="mb-2">{erro}</p>
            <hr />
            <div className="mb-0">
              <p className="mb-2">
                <strong>Possíveis soluções:</strong>
              </p>
              <ol className="mb-3">
                <li>Verifique se o MySQL está rodando</li>
                <li>
                  Confirme as credenciais no arquivo <code>.env.local</code>
                </li>
                <li>
                  Execute o script SQL:{" "}
                  <code>mysql -u root -p sant31br &lt; bancodados.sql</code>
                </li>
              </ol>
              <a href="/diagnostico" className="btn btn-sm btn-outline-danger">
                🔍 Abrir Diagnóstico do Sistema
              </a>
            </div>
          </div>
        )}
        {/* Cards de Estatísticas */}
        <div className="row mb-4">
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm card-dashboard">
              <div className="card-body text-center">
                <div className="text-primary mb-2" style={{ fontSize: "2rem" }}>
                  📊
                </div>
                <h5 className="card-title">Vendas Hoje</h5>
                <h3 className="text-success">
                  {vendasHoje.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h3>
                <small className="text-muted">
                  {vendasHoje.quantidade} vendas realizadas
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm card-dashboard">
              <div className="card-body text-center">
                <div className="text-warning mb-2" style={{ fontSize: "2rem" }}>
                  📦
                </div>
                <h5 className="card-title">Produtos em Estoque</h5>
                <h3 className="text-info">{produtosAtivos}</h3>
                <small className="text-muted">produtos cadastrados</small>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm card-dashboard">
              <div className="card-body text-center">
                <div className="text-success mb-2" style={{ fontSize: "2rem" }}>
                  👥
                </div>
                <h5 className="card-title">Alunos Ativos</h5>
                <h3 className="text-primary">{alunosAtivos}</h3>
                <small className="text-muted">com contas ativas</small>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm card-dashboard">
              <div className="card-body text-center">
                <div className="text-danger mb-2" style={{ fontSize: "2rem" }}>
                  ⚠️
                </div>
                <h5 className="card-title">Alertas</h5>
                <h3 className="text-warning">{alertas}</h3>
                <small className="text-muted">itens com estoque baixo</small>
              </div>
            </div>
          </div>
        </div>

        {/* Menu de Ações Rápidas */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">Ações Rápidas</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-primary w-100 p-3 btn-action"
                      onClick={() => router.push("/vendas/pdv")}
                    >
                      <div className="text-center">
                        <div
                          style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                        >
                          💰
                        </div>
                        <div>Nova Venda</div>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-success w-100 p-3 btn-action"
                      onClick={() => router.push("/alunos/contas")}
                    >
                      <div className="text-center">
                        <div
                          style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                        >
                          👨‍🎓
                        </div>
                        <div>Buscar Aluno</div>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-warning w-100 p-3 btn-action"
                      onClick={() => router.push("/estoque")}
                    >
                      <div className="text-center">
                        <div
                          style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                        >
                          📦
                        </div>
                        <div>Estoque</div>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-info w-100 p-3 btn-action"
                      onClick={() => router.push("/relatorios/vendas")}
                    >
                      <div className="text-center">
                        <div
                          style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                        >
                          📊
                        </div>
                        <div>Relatórios</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="row">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Últimas Vendas</h6>
              </div>
              <div className="card-body">
                {ultimasVendas.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p className="text-muted">Nenhuma venda registrada</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Cliente</th>
                          <th>Tipo</th>
                          <th>Data</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimasVendas.map((v) => (
                          <tr key={v.id}>
                            <td>{v.id}</td>
                            <td>{v.nome_cliente}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {v.tipo_cliente}
                              </span>
                            </td>
                            <td>
                              {new Date(v.dt_venda).toLocaleString("pt-BR")}
                            </td>
                            <td className="text-end">
                              {v.valor_total.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Produtos com Estoque Baixo</h6>
              </div>
              <div className="card-body">
                {estoqueBaixo.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <p className="text-muted">
                      Todos os produtos com estoque adequado
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Produto</th>
                          <th>Tipo</th>
                          <th className="text-end">Qtd</th>
                          <th className="text-end">Mín</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estoqueBaixo.map((e) => (
                          <tr key={e.id}>
                            <td>{e.produto_nome}</td>
                            <td>{e.tipo_produto}</td>
                            <td className="text-end">
                              {Number(e.quantidade_atual).toFixed(3)}
                            </td>
                            <td className="text-end">
                              {Number(e.quantidade_minima).toFixed(3)}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  e.status_estoque === "CRITICO"
                                    ? "bg-danger"
                                    : e.status_estoque === "BAIXO"
                                    ? "bg-warning text-dark"
                                    : "bg-success"
                                }`}
                              >
                                {e.status_estoque}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
