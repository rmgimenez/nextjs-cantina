"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        router.push("/login");
        return;
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecionamento será feito pelo useEffect
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <header
        className="bg-primary text-white py-3 mb-4"
        style={{ backgroundColor: "#253287" }}
      >
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h4 mb-0">
                Sistema de Controle de Cantina Escolar
              </h1>
              <small>Bem-vindo, {user.nome}!</small>
            </div>
            <div>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container">
        <div className="row">
          {/* Cards de Estatísticas */}
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm">
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
            <div className="card border-0 shadow-sm">
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
            <div className="card border-0 shadow-sm">
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
            <div className="card border-0 shadow-sm">
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
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">Ações Rápidas</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-primary w-100 p-3"
                      onClick={() => router.push("/funcionarios-cantina")}
                    >
                      <div className="text-center">
                        <div
                          style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                        >
                          �
                        </div>
                        <div>Funcionários</div>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-outline-success w-100 p-3">
                      <div className="text-center">
                        <div
                          style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                        >
                          �
                        </div>
                        <div>Nova Venda</div>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-outline-warning w-100 p-3">
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
                    <button className="btn btn-outline-info w-100 p-3">
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
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Últimas Vendas</h6>
              </div>
              <div className="card-body">
                <div className="text-center text-muted py-4">
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    📋
                  </div>
                  <p>Nenhuma venda realizada hoje</p>
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
                <div className="text-center text-muted py-4">
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    ✅
                  </div>
                  <p>Todos os produtos com estoque adequado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-5 py-3 bg-light text-center">
        <div className="container">
          <small className="text-muted">
            Sistema de Controle de Cantina Escolar - {new Date().getFullYear()}
          </small>
        </div>
      </footer>
    </div>
  );
}
