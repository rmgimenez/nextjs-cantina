"use client";

import {
  AlertsAndStock,
  DashboardHeader,
  DashboardStats,
  QuickActions,
  RecentSales,
  SalesTrendChart,
  TopProducts,
} from "@/components";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiDollarSign,
  FiPackage,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

interface DashboardData {
  vendas: any;
  estoque: any;
  financeiro: any;
  alunos: any;
  recentSales: any[];
  lowStockProducts: any[];
  topProducts: any[];
  alerts: any[];
  trend: { data: string; vendas: number; total: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("ATENDENTE");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Buscar sessão primeiro para identificar o perfil
        try {
          const sessionRes = await fetch("/api/session", {
            method: "GET",
            credentials: "include",
          });
          if (sessionRes.ok) {
            const sessionBody = await sessionRes.json();
            setUserRole(
              (sessionBody?.user?.tipo || "ATENDENTE").toString().toUpperCase()
            );
            setUserName(sessionBody?.user?.nome || "");
          }
        } catch (e) {
          console.log("Falha ao buscar sessão - usando valores padrão");
        }

        // Buscar todas as APIs em paralelo
        const [
          statsRes,
          salesRes,
          stockRes,
          productsRes,
          alertsRes,
          financeiroRes,
          estoqueRes,
          trendRes,
        ] = await Promise.all([
          fetch("/api/dashboard/stats").catch(() => null),
          fetch("/api/dashboard/recent-sales").catch(() => null),
          fetch("/api/dashboard/low-stock").catch(() => null),
          fetch("/api/dashboard/top-products").catch(() => null),
          fetch("/api/dashboard/alerts").catch(() => null),
          fetch("/api/dashboard/financeiro").catch(() => null),
          fetch("/api/dashboard/estoque").catch(() => null),
          fetch("/api/dashboard/trend").catch(() => null),
        ]);

        // Processar respostas
        const [
          stats,
          recentSales,
          lowStockProducts,
          topProducts,
          alerts,
          financeiro,
          estoque,
          trendBody,
        ] = await Promise.all([
          statsRes?.ok ? statsRes.json().catch(() => ({})) : {},
          salesRes?.ok ? salesRes.json().catch(() => []) : [],
          stockRes?.ok ? stockRes.json().catch(() => []) : [],
          productsRes?.ok ? productsRes.json().catch(() => []) : [],
          alertsRes?.ok ? alertsRes.json().catch(() => []) : [],
          financeiroRes?.ok ? financeiroRes.json().catch(() => ({})) : {},
          estoqueRes?.ok ? estoqueRes.json().catch(() => ({})) : {},
          trendRes?.ok ? trendRes.json().catch(() => ({})) : {},
        ]);

        // Processar dados de vendas
        const vendasData = {
          totalVendas: recentSales.length || 0,
          receitaTotal: (stats as any)?.vendasHoje || 0,
        };

        // Processar dados de alunos
        const alunosData = {
          alunosAtendidos: (stats as any)?.alunosHoje || 0,
        };

        const trendDias = (trendBody as any)?.dias || [];
        setData({
          vendas: vendasData,
          estoque,
          financeiro,
          alunos: alunosData,
          recentSales,
          lowStockProducts,
          topProducts,
          alerts,
          trend: trendDias,
        });
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <>
        <DashboardHeader userRole="ATENDENTE" />
        <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="container-fluid px-4 py-5">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ minHeight: "60vh" }}
            >
              <div className="text-center">
                <div
                  className="spinner-border text-primary mb-4"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <h4 className="text-muted mb-3">Carregando Dashboard</h4>
                <p className="text-secondary">
                  Aguarde enquanto carregamos os dados...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <DashboardHeader userRole="ATENDENTE" />
        <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="container-fluid px-4 py-5">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ minHeight: "60vh" }}
            >
              <div className="text-center">
                <FiAlertCircle
                  className="text-danger mb-4"
                  style={{ fontSize: "4rem" }}
                />
                <h4 className="text-danger mb-3">Erro ao Carregar Dashboard</h4>
                <p className="text-muted mb-4">
                  {error || "Erro desconhecido"}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary btn-lg px-4 py-2"
                  style={{ backgroundColor: "#253287", borderColor: "#253287" }}
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader userRole={userRole} userName={userName} />

      {/* Background com gradiente sutil */}
      <div
        className="min-vh-100 dashboard-bg dashboard-fade-in"
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          paddingBottom: "2rem",
        }}
      >
        <div className="container-fluid px-4 py-4 dashboard-content">
          {/* KPIs Section - Destaque no topo */}
          <div className="row g-3 mb-5">
            <div className="col-12">
              <DashboardStats
                userRole={userRole}
                vendasData={data.vendas}
                estoqueData={data.estoque}
                financeiroData={data.financeiro}
                alunosData={data.alunos}
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="row g-4 mb-4">
            {/* Gráfico Principal - Ocupa 8 colunas */}
            <div className="col-12 col-xl-8">
              <div
                className="card dashboard-card h-100"
                style={{
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(37,50,135,0.06)",
                }}
              >
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FiTrendingUp
                      className="me-2"
                      style={{ color: "#253287" }}
                    />
                    <h5
                      className="mb-0"
                      style={{ color: "#253287", fontWeight: "600" }}
                    >
                      Tendência de Vendas
                    </h5>
                  </div>
                </div>
                <div
                  className="card-body p-4"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <div className="chart-container">
                    <SalesTrendChart points={data.trend} />
                  </div>
                </div>
              </div>
            </div>

            {/* Painel Lateral - Alertas e Estoque */}
            <div className="col-12 col-xl-4">
              <div
                className="card dashboard-card mb-4"
                style={{
                  borderRadius: 10,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FiAlertCircle
                      className="me-2"
                      style={{ color: "#B20000" }}
                    />
                    <h6
                      className="mb-0"
                      style={{ color: "#333333", fontWeight: "600" }}
                    >
                      Alertas e Estoque
                    </h6>
                  </div>
                </div>
                <div
                  className="card-body p-3"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <AlertsAndStock
                    alerts={data.alerts}
                    lowStockProducts={data.lowStockProducts}
                  />
                </div>
              </div>

              {/* Top Produtos - Card compacto */}
              <div
                className="card dashboard-card"
                style={{
                  borderRadius: 10,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FiPackage className="me-2" style={{ color: "#FEA800" }} />
                    <h6
                      className="mb-0"
                      style={{ color: "#333333", fontWeight: "600" }}
                    >
                      Produtos Mais Vendidos
                    </h6>
                  </div>
                </div>
                <div
                  className="card-body p-3"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <TopProducts products={data.topProducts} />
                </div>
              </div>
            </div>
          </div>

          {/* Vendas Recentes - Largura total */}
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div
                className="card dashboard-card"
                style={{
                  borderRadius: 10,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FiDollarSign
                      className="me-2"
                      style={{ color: "#253287" }}
                    />
                    <h5
                      className="mb-0"
                      style={{ color: "#253287", fontWeight: "600" }}
                    >
                      Vendas Recentes
                    </h5>
                  </div>
                </div>
                <div
                  className="card-body p-4"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <RecentSales sales={data.recentSales} />
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas - Destaque no final */}
          <div className="row g-4">
            <div className="col-12">
              {/* Card com header em azul da identidade e corpo branco com sombra */}
              <div
                className="card dashboard-card"
                style={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  boxShadow: "0 6px 18px rgba(37,50,135,0.10)",
                  borderRadius: 12,
                }}
              >
                <div
                  className="card-header py-3"
                  style={{
                    backgroundColor: "#253287",
                    borderRadius: "12px 12px 0 0",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FiUsers className="me-2" style={{ color: "#ffffff" }} />
                    <h5
                      className="mb-0"
                      style={{ fontWeight: "600", color: "#ffffff" }}
                    >
                      Ações Rápidas
                    </h5>
                  </div>
                </div>
                <div
                  className="card-body p-4"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <QuickActions userRole={userRole} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
