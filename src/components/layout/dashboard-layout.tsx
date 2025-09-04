"use client";

import clsx from "clsx";
import React, { useEffect, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex min-vh-100 dashboard-bg app-shell">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        userRole="admin"
      />
      {/* Overlay para mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={toggleSidebar}
        />
      )}
      {/* Main Content */}
      <div
        className={clsx("flex-grow-1 d-flex flex-column app-main")}
        style={{ transition: "all 180ms ease" }}
      >
        {/* Header (sticky) */}
        <Header
          userName="Jo\u00e3o Silva"
          userRole="Administrador"
          onToggle={toggleSidebar}
        />
        {/* Page Content - container para centralizar e controlar larguras */}
        <main className="flex-grow-1 overflow-auto app-content">
          {(title || subtitle) && (
            <div className="page-head px-3 py-3">
              {title && <h1 className="h4 mb-1 text-dark">{title}</h1>}
              {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
            </div>
          )}

          <div className="container-fluid py-4 position-relative">
            <div className="px-0 page-body">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
