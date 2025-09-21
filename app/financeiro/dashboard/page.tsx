"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface DashboardData {
  resumo: {
    totalReceber: number;
    totalPagar: number;
    saldoLiquido: number;
    inadimplencia: number;
  };
  porStatus: {
    receber: {
      PENDENTE: number;
      RECEBIDO: number;
      VENCIDO: number;
      PARCIAL: number;
    };
    pagar: { PENDENTE: number; PAGO: number; VENCIDO: number; PARCIAL: number };
  };
  ultimasTransacoes: Array<{
    tipo: "RECEBER" | "PAGAR";
    descricao: string;
    valor: number;
    dt_operacao: string;
    status: string;
  }>;
  fluxoMensal: Array<{
    mes: string;
    receber: number;
    pagar: number;
    saldo: number;
  }>;
}

export default function DashboardFinanceiroPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
          window.location.href = "/login";
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        window.location.href = "/login";
        return;
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/financeiro");
      const data = await res.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.error("Erro ao carregar dados do dashboard:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDENTE: "warning",
      RECEBIDO: "success",
      PAGO: "success",
      VENCIDO: "danger",
      PARCIAL: "info",
    };
    return colors[status as keyof typeof colors] || "secondary";
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDENTE: "Pendente",
      RECEBIDO: "Recebido",
      PAGO: "Pago",
      VENCIDO: "Vencido",
      PARCIAL: "Parcial",
    };
    return texts[status as keyof typeof texts] || status;
  };

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
    return null;
  }

  if (!dashboardData) {
    return (
      <MainLayout>
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando dados...</span>
            </div>
            <p className="mt-3 text-muted">Carregando dados do dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0">Dashboard Financeiro</h1>
            <p className="text-muted">
              Visão geral da saúde financeira da cantina
            </p>
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={loadDashboardData}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <i className="bi bi-cash-coin text-success fs-4 me-2"></i>
                  <h6 className="mb-0">Total a Receber</h6>
                </div>
                <h4 className="text-success mb-0">
                  R$ {dashboardData.resumo.totalReceber.toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <i className="bi bi-receipt text-danger fs-4 me-2"></i>
                  <h6 className="mb-0">Total a Pagar</h6>
                </div>
                <h4 className="text-danger mb-0">
                  R$ {dashboardData.resumo.totalPagar.toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <i className="bi bi-graph-up text-primary fs-4 me-2"></i>
                  <h6 className="mb-0">Saldo Líquido</h6>
                </div>
                <h4
                  className={`mb-0 ${
                    dashboardData.resumo.saldoLiquido >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  R$ {dashboardData.resumo.saldoLiquido.toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <i className="bi bi-exclamation-triangle text-warning fs-4 me-2"></i>
                  <h6 className="mb-0">Inadimplência</h6>
                </div>
                <h4 className="text-warning mb-0">
                  R$ {dashboardData.resumo.inadimplencia.toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos de Status */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Contas a Receber por Status</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  {Object.entries(dashboardData.porStatus.receber).map(
                    ([status, valor]) => (
                      <div key={status} className="col-6 mb-3">
                        <div
                          className={`badge bg-${getStatusColor(
                            status
                          )} fs-6 p-2`}
                        >
                          {getStatusText(status)}
                        </div>
                        <div className="mt-2">
                          <strong>R$ {valor.toFixed(2)}</strong>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Contas a Pagar por Status</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  {Object.entries(dashboardData.porStatus.pagar).map(
                    ([status, valor]) => (
                      <div key={status} className="col-6 mb-3">
                        <div
                          className={`badge bg-${getStatusColor(
                            status
                          )} fs-6 p-2`}
                        >
                          {getStatusText(status)}
                        </div>
                        <div className="mt-2">
                          <strong>R$ {valor.toFixed(2)}</strong>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fluxo de Caixa Mensal */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Fluxo de Caixa - Últimos 6 Meses</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Mês</th>
                        <th>Recebimentos</th>
                        <th>Pagamentos</th>
                        <th>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.fluxoMensal.map((mes, index) => (
                        <tr key={mes.mes}>
                          <td className="fw-bold">{mes.mes}</td>
                          <td className="text-success">
                            R$ {mes.receber.toFixed(2)}
                          </td>
                          <td className="text-danger">
                            R$ {mes.pagar.toFixed(2)}
                          </td>
                          <td
                            className={`fw-bold ${
                              mes.saldo >= 0 ? "text-success" : "text-danger"
                            }`}
                          >
                            R$ {mes.saldo.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Últimas Transações</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ultimasTransacoes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            <div className="empty-state">
                              <div className="empty-state-icon">📊</div>
                              <p className="text-muted">
                                Nenhuma transação recente
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        dashboardData.ultimasTransacoes.map(
                          (transacao, index) => (
                            <tr key={index}>
                              <td>
                                <span
                                  className={`badge ${
                                    transacao.tipo === "RECEBER"
                                      ? "bg-success"
                                      : "bg-danger"
                                  }`}
                                >
                                  {transacao.tipo === "RECEBER"
                                    ? "Recebimento"
                                    : "Pagamento"}
                                </span>
                              </td>
                              <td>{transacao.descricao}</td>
                              <td
                                className={`fw-bold ${
                                  transacao.tipo === "RECEBER"
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                R$ {transacao.valor.toFixed(2)}
                              </td>
                              <td>
                                {new Date(
                                  transacao.dt_operacao
                                ).toLocaleDateString("pt-BR")}
                              </td>
                              <td>
                                <span
                                  className={`badge bg-${getStatusColor(
                                    transacao.status
                                  )}`}
                                >
                                  {getStatusText(transacao.status)}
                                </span>
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
