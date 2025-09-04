"use client";

import {
  FiAlertCircle,
  FiBarChart,
  FiBox,
  FiCreditCard,
  FiPackage,
  FiShoppingCart,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import React from "react";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  description?: string;
}

interface GroupedActions {
  titulo: string;
  items: QuickAction[];
}

interface QuickActionsProps {
  userRole: string;
}

// Paleta auxiliar para surface gradiente / sombras consistentes
const buildIconStyle = (color: string): React.CSSProperties => ({
  background: `linear-gradient(145deg, ${color}15 0%, ${color}08 100%)`,
  border: `1px solid ${color}33`,
  boxShadow: `0 4px 12px ${color}25`,
});

export default function QuickActions({ userRole }: QuickActionsProps) {
  const role = userRole.toUpperCase();

  const base: QuickAction[] = [];
  let groups: GroupedActions[] = [];

  if (role === "ADMIN") {
    groups = [
      {
        titulo: "Administração",
        items: [
          {
            icon: <FiUsers size={24} />,
            label: "Usuários",
            href: "/dashboard/usuarios",
            color: "#253287",
            description: "Gerenciar acessos e perfis",
          },
          {
            icon: <FiPackage size={24} />,
            label: "Estoque",
            href: "/dashboard/estoque",
            color: "#B20000",
            description: "Movimentações e alertas",
          },
        ],
      },
      {
        titulo: "Análises",
        items: [
          {
            icon: <FiBarChart size={24} />,
            label: "Relatórios",
            href: "/dashboard/relatorios",
            color: "#FEA800",
            description: "Indicadores e rankings",
          },
          {
            icon: <FiCreditCard size={24} />,
            label: "Financeiro",
            href: "/dashboard/financeiro",
            color: "#333333",
            description: "Contas e faturas",
          },
        ],
      },
    ];
  } else if (role === "ESTOQUISTA") {
    groups = [
      {
        titulo: "Operações de Estoque",
        items: [
          {
            icon: <FiPackage size={24} />,
            label: "Movimentar",
            href: "/dashboard/estoque/movimentacao",
            color: "#253287",
            description: "Entrada / saída / ajustes",
          },
          {
            icon: <FiBox size={24} />,
            label: "Produtos",
            href: "/dashboard/produtos",
            color: "#FEA800",
            description: "Cadastro e gestão",
          },
        ],
      },
      {
        titulo: "Visão",
        items: [
          {
            icon: <FiBarChart size={24} />,
            label: "Relatórios",
            href: "/dashboard/estoque/relatorios",
            color: "#333333",
            description: "Consumo e giro",
          },
          {
            icon: <FiAlertCircle size={24} />,
            label: "Alertas",
            href: "/dashboard/estoque",
            color: "#B20000",
            description: "Baixo nível / ruptura",
          },
        ],
      },
    ];
  } else {
    groups = [
      {
        titulo: "Atendimento",
        items: [
          {
            icon: <FiShoppingCart size={24} />,
            label: "Nova Venda",
            href: "/dashboard/pdv",
            color: "#253287",
            description: "Abrir PDV",
          },
          {
            icon: <FiUserCheck size={24} />,
            label: "Alunos",
            href: "/dashboard/alunos",
            color: "#FEA800",
            description: "Consulta rápida",
          },
        ],
      },
      {
        titulo: "Controle",
        items: [
          {
            icon: <FiCreditCard size={24} />,
            label: "Caixa",
            href: "/dashboard/pdv",
            color: "#333333",
            description: "Abertura / fechamento",
          },
          {
            icon: <FiBarChart size={24} />,
            label: "Relatórios",
            href: "/dashboard/relatorios",
            color: "#B20000",
            description: "Resumo do dia",
          },
        ],
      },
    ];
  }

  return (
    <div className="quick-actions-wrapper">
      <div className="row g-4">
        {groups.map((group, gi) => (
          <div className="col-12 col-lg-6" key={gi}>
            <div className="quick-actions-group h-100 p-3 p-md-4">
              <div className="d-flex align-items-center mb-3">
                <div className="flex-grow-1">
                  <h6 className="mb-0 text-uppercase small fw-bold text-muted tracking-wide">
                    {group.titulo}
                  </h6>
                </div>
                <div className="divider-dot" aria-hidden="true" />
              </div>
              <div className="row g-3 g-md-4">
                {group.items.map((action) => (
                  <div className="col-6" key={action.href}>
                    <a
                      href={action.href}
                      className="quick-action-card text-decoration-none"
                      aria-label={action.label}
                    >
                      <div className="d-flex flex-column align-items-center text-center">
                        <div
                          className="qa-icon-wrapper mb-3"
                          style={buildIconStyle(action.color)}
                        >
                          <span style={{ color: action.color }}>
                            {action.icon}
                          </span>
                        </div>
                        <span
                          className="qa-label fw-semibold"
                          style={{ color: "#253287" }}
                        >
                          {action.label}
                        </span>
                        {action.description && (
                          <small className="qa-desc text-muted">
                            {action.description}
                          </small>
                        )}
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-end mt-3 mt-md-4">
        <small className="text-muted fst-italic">
          Dica: atalhos exibidos conforme seu perfil ({role}).
        </small>
      </div>
    </div>
  );
}
