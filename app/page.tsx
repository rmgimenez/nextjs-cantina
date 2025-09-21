"use client";

import { useRouter } from "next/navigation";
import MainLayout from "../components/MainLayout";

export default function HomePage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="container-fluid">
        {/* Cards de Estatísticas */}
        <div className="row mb-4">
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm card-dashboard">
              <div className="card-body text-center">
                <div className="text-primary mb-2" style={{ fontSize: "2rem" }}>
                  📊
                </div>
                <h5 className="card-title">Vendas Hoje</h5>
                <h3 className="text-success">R$ 0,00</h3>
                <small className="text-muted">0 vendas realizadas</small>
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
                <h3 className="text-info">0</h3>
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
                <h3 className="text-primary">0</h3>
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
                <h3 className="text-warning">0</h3>
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
                      onClick={() => router.push("/estoque/controle")}
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
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <p className="text-muted">Nenhuma venda realizada hoje</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Produtos com Estoque Baixo</h6>
              </div>
              <div className="card-body">
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <p className="text-muted">Todos os produtos com estoque adequado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}