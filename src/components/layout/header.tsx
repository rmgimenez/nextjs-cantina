"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiUser,
} from "react-icons/fi";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  onToggle?: () => void; // toggle da sidebar (mantido)
}

export default function Header({
  userName = "Usuário",
  userRole = "Administrador",
  onLogout,
  onToggle,
}: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [name, setName] = useState(userName);
  const [role, setRole] = useState(userRole);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function loadSession() {
      try {
        const res = await fetch("/api/session", {
          method: "GET",
          credentials: "include",
        });
        if (!mounted) return;
        if (res.ok) {
          const body = await res.json();
          // API returns { authenticated: true, user: { id, nome, tipo } }
          if (body && body.user) {
            setName(body.user.nome || body.user.usuario || userName);
            setRole(body.user.tipo || userRole);
          }
        } else {
          // keep fallbacks when not authenticated
          setName(userName);
          setRole(userRole);
        }
      } catch (err) {
        console.error("Erro ao carregar sessão:", err);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    loadSession();
    return () => {
      mounted = false;
    };
  }, [userName, userRole]);

  const notifications = [
    {
      id: 1,
      message: "Estoque baixo: Refrigerante Coca-Cola",
      type: "warning",
      time: "5 min",
    },
    {
      id: 2,
      message: "Nova venda registrada: R$ 25,50",
      type: "success",
      time: "10 min",
    },
    {
      id: 3,
      message: "Caixa aberto por João Silva",
      type: "info",
      time: "15 min",
    },
  ];
  return (
    <header
      className="app-header position-sticky top-0 w-100"
      style={{ zIndex: 1050 }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between py-2">
        <div className="d-flex align-items-center gap-3">
          {onToggle && (
            <button
              onClick={onToggle}
              className="btn btn-outline-light btn-sm d-md-none"
              title="Abrir/Fechar menu"
              aria-label="Abrir menu"
            >
              ☰
            </button>
          )}
          <div className="d-flex flex-column">
            <span className="fw-semibold text-white">Sistema Cantina</span>
            <small className="text-brand-accent">Gestão Operacional</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Notificações */}
          <button className="btn btn-outline-light btn-sm rounded-circle position-relative">
            <FiBell />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark border border-light shadow-sm">
              {notifications.length}
            </span>
          </button>
          <div className="d-none d-md-flex align-items-center badge status-chip px-3 py-2">
            <span className="status-dot bg-success me-2" />
            <small className="mb-0 text-uppercase fw-semibold">
              Caixa Aberto
            </small>
          </div>
          <div className="dropdown">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="btn btn-light d-flex align-items-center gap-2 profile-btn"
              id="profileDropdown"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="rounded-circle brand-avatar text-white d-flex align-items-center justify-content-center shadow-sm border border-white border-opacity-25">
                <strong>
                  {(name && name.length > 0
                    ? name.charAt(0)
                    : "?"
                  ).toUpperCase()}
                </strong>
              </div>
              <div className="d-none d-md-block text-start">
                <div className="fw-semibold text-dark lh-sm">{name}</div>
                <small className="text-muted text-uppercase">{role}</small>
              </div>
              <FiChevronDown
                className={clsx("text-muted transition-fast", {
                  "rotate-180": isProfileMenuOpen,
                })}
              />
            </button>
            {isProfileMenuOpen && (
              <ul
                className="dropdown-menu dropdown-menu-end show shadow-sm border-0 rounded-3 overflow-hidden"
                aria-labelledby="profileDropdown"
              >
                <li className="px-3 py-3 brand-surface">
                  <div className="fw-semibold text-dark">{name}</div>
                  <small className="text-muted">{role}</small>
                </li>
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <FiUser /> Meu Perfil
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <FiSettings /> Configurações
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger d-flex align-items-center gap-2"
                    onClick={handleLogout}
                  >
                    <FiLogOut /> Sair
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
        {isProfileMenuOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            onClick={() => setIsProfileMenuOpen(false)}
          />
        )}
      </div>
      <div className="header-accent-bar" />
    </header>
  );
}
