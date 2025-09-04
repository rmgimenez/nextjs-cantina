"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FiActivity,
  FiAlertCircle,
  FiBox,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
  FiUserCheck,
} from "react-icons/fi";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  color?: string;
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  color = "#253287",
}: StatCardProps) {
  const changeColor = {
    positive: "text-success",
    negative: "text-danger",
    neutral: "text-secondary",
  } as const;

  // tenta extrair um número percentual (ex: '+12%') para mostrar barra de tendência pequena
  const parsePercent = (txt?: string) => {
    if (!txt) return 0;
    const m = txt.match(/([+-]?[0-9]+(?:\.[0-9]+)?)/);
    if (!m) return 0;
    const n = Number(m[1]);
    if (isNaN(n)) return 0;
    return Math.max(-100, Math.min(100, n));
  };

  const percent = parsePercent(change);

  return (
    <Card className="kpi-card border-0 shadow-sm h-100">
      <CardContent className="p-3">
        <div className="d-flex align-items-center">
          {/* Ícone à esquerda com círculo de destaque usando cores da identidade */}
          <div
            className="me-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, ${color}33 0%, ${color}66 100%)`,
              flex: "0 0 56px",
            }}
            aria-hidden
          >
            <div className="text-white" style={{ fontSize: 20 }}>
              {icon}
            </div>
          </div>

          <div className="flex-grow-1">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <p className="mb-1 text-muted small" style={{ opacity: 0.9 }}>
                  {title}
                </p>
                <h3 className="mb-1" style={{ margin: 0 }}>
                  {value}
                </h3>
              </div>

              <div className="text-end">
                <span
                  className={`badge bg-transparent border ${
                    changeType === "positive"
                      ? "border-success"
                      : changeType === "negative"
                      ? "border-danger"
                      : "border-secondary"
                  } ${
                    changeType === "positive"
                      ? "text-success"
                      : changeType === "negative"
                      ? "text-danger"
                      : "text-secondary"
                  }`}
                  style={{ fontWeight: 600 }}
                  aria-label={`Variação ${change}`}
                >
                  {change}
                </span>
              </div>
            </div>

            {/* Barra pequena de tendência — discreta e informativa */}
            <div className="mt-2" aria-hidden>
              <div
                className="progress"
                style={{ height: 6, backgroundColor: "#f1f3f5" }}
              >
                <div
                  className={`progress-bar ${
                    changeType === "positive"
                      ? "bg-success"
                      : changeType === "negative"
                      ? "bg-danger"
                      : "bg-secondary"
                  }`}
                  role="progressbar"
                  style={{ width: `${Math.abs(percent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  userRole: string;
  vendasData: any;
  estoqueData: any;
  financeiroData: any;
  alunosData: any;
}

export default function DashboardStats({
  userRole,
  vendasData = {},
  estoqueData = {},
  financeiroData = {},
  alunosData = {},
}: DashboardStatsProps) {
  const generateStatsByRole = () => {
    const role = userRole.toUpperCase();

    if (role === "ADMIN") {
      return [
        {
          title: "Receita Hoje",
          value: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(financeiroData.receitaDiaria || 0),
          change: "+12%",
          changeType: "positive" as const,
          icon: <FiDollarSign className="w-8 h-8" />,
          color: "#253287",
        },
        {
          title: "Vendas Hoje",
          value: String(vendasData.totalVendas || 0),
          change: "+8%",
          changeType: "positive" as const,
          icon: <FiShoppingCart className="w-8 h-8" />,
          color: "#FEA800",
        },
        {
          title: "Produtos Críticos",
          value: String(estoqueData.produtosCriticos || 0),
          change: estoqueData.produtosCriticos > 0 ? "Atenção" : "OK",
          changeType:
            estoqueData.produtosCriticos > 0
              ? ("negative" as const)
              : ("positive" as const),
          icon: <FiAlertCircle className="w-8 h-8" />,
          color: "#B20000",
        },
        {
          title: "Contas a Pagar",
          value: String(financeiroData.contasPagar?.total || 0),
          change:
            financeiroData.contasPagar?.vencendo > 0
              ? `${financeiroData.contasPagar.vencendo} vencendo`
              : "Em dia",
          changeType:
            financeiroData.contasPagar?.vencendo > 0
              ? ("negative" as const)
              : ("positive" as const),
          icon: <FiCreditCard className="w-8 h-8" />,
          color: "#333333",
        },
      ];
    } else if (role === "ESTOQUISTA") {
      return [
        {
          title: "Itens em Falta",
          value: String(estoqueData.produtosCriticos || 0),
          change: estoqueData.produtosCriticos > 0 ? "Crítico" : "OK",
          changeType:
            estoqueData.produtosCriticos > 0
              ? ("negative" as const)
              : ("positive" as const),
          icon: <FiAlertCircle className="w-8 h-8" />,
          color: "#B20000",
        },
        {
          title: "Estoque Baixo",
          value: String(estoqueData.produtosBaixo || 0),
          change: estoqueData.produtosBaixo > 0 ? "Atenção" : "OK",
          changeType:
            estoqueData.produtosBaixo > 0
              ? ("neutral" as const)
              : ("positive" as const),
          icon: <FiPackage className="w-8 h-8" />,
          color: "#FEA800",
        },
        {
          title: "Movimentações Hoje",
          value: String(estoqueData.movimentacoesHoje || 0),
          change: "+15%",
          changeType: "positive" as const,
          icon: <FiActivity className="w-8 h-8" />,
          color: "#253287",
        },
        {
          title: "Valor em Estoque",
          value: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(estoqueData.valorEstoque || 0),
          change: "+2%",
          changeType: "positive" as const,
          icon: <FiBox className="w-8 h-8" />,
          color: "#333333",
        },
      ];
    } else {
      // Atendente
      return [
        {
          title: "Vendas Hoje",
          value: String(vendasData.totalVendas || 0),
          change: "+15%",
          changeType: "positive" as const,
          icon: <FiShoppingCart className="w-8 h-8" />,
          color: "#253287",
        },
        {
          title: "Receita Hoje",
          value: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(financeiroData.receitaDiaria || 0),
          change: "+8%",
          changeType: "positive" as const,
          icon: <FiDollarSign className="w-8 h-8" />,
          color: "#FEA800",
        },
        {
          title: "Clientes Atendidos",
          value: String(alunosData.alunosAtendidos || 0),
          change: "+12%",
          changeType: "positive" as const,
          icon: <FiUserCheck className="w-8 h-8" />,
          color: "#333333",
        },
        {
          title: "Ticket Médio",
          value:
            vendasData.totalVendas > 0
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  (financeiroData.receitaDiaria || 0) / vendasData.totalVendas
                )
              : "R$ 0,00",
          change: "+5%",
          changeType: "positive" as const,
          icon: <FiTarget className="w-8 h-8" />,
          color: "#B20000",
        },
      ];
    }
  };

  const stats = generateStatsByRole();

  return (
    <div className="row g-4 mb-5">
      {stats.map((stat, index) => (
        <div key={index} className="col-12 col-sm-6 col-lg-3">
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
}
