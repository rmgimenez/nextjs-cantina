"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface ContaInadimplente {
  id: number;
  tipo: "PAGAR" | "RECEBER";
  nome_cliente_fornecedor: string;
  descricao: string;
  valor: number;
  dt_vencimento: string;
  dias_atraso: number;
  categoria: string;
  numero_documento: string;
  status: string;
}

export default function RelatoriosInadimplenciaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contasInadimplentes, setContasInadimplentes] = useState<
    ContaInadimplente[]
  >([]);
  const [tipoFilter, setTipoFilter] = useState("");
  const [diasAtrasoFilter, setDiasAtrasoFilter] = useState("");

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
      loadRelatorioInadimplencia();
    }
  }, [user, tipoFilter, diasAtrasoFilter]);

  const loadRelatorioInadimplencia = async () => {
    try {
      const params = new URLSearchParams();
      if (tipoFilter) params.append("tipo", tipoFilter);
      if (diasAtrasoFilter) params.append("dias_atraso", diasAtrasoFilter);

      const res = await fetch(`/api/relatorios/inadimplencia?${params}`);
      const data = await res.json();

      if (data.success) {
        setContasInadimplentes(data.data);
      } else {
        console.error("Erro ao carregar relatório:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    }
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "PAGAR" ? "bg-danger" : "bg-warning";
  };

  const getTipoText = (tipo: string) => {
    return tipo === "PAGAR" ? "Conta a Pagar" : "Conta a Receber";
  };

  const getCategoriaAtraso = (dias: number) => {
    if (dias <= 30)
      return { categoria: "1-30 dias", classe: "bg-warning text-dark" };
    if (dias <= 60) return { categoria: "31-60 dias", classe: "bg-danger" };
    if (dias <= 90) return { categoria: "61-90 dias", classe: "bg-danger" };
    return { categoria: "90+ dias", classe: "bg-dark" };
  };

  const calcularTotais = () => {
    const hoje = new Date();
    const totais = {
      totalValor: 0,
      totalContas: contasInadimplentes.length,
      porCategoria: {
        "1-30": { valor: 0, quantidade: 0 },
        "31-60": { valor: 0, quantidade: 0 },
        "61-90": { valor: 0, quantidade: 0 },
        "90+": { valor: 0, quantidade: 0 },
      },
      porTipo: {
        PAGAR: { valor: 0, quantidade: 0 },
        RECEBER: { valor: 0, quantidade: 0 },
      },
    };

    contasInadimplentes.forEach((conta) => {
      totais.totalValor += conta.valor;

      const categoria = getCategoriaAtraso(conta.dias_atraso);
      const catKey = categoria.categoria as keyof typeof totais.porCategoria;
      totais.porCategoria[catKey].valor += conta.valor;
      totais.porCategoria[catKey].quantidade += 1;

      totais.porTipo[conta.tipo].valor += conta.valor;
      totais.porTipo[conta.tipo].quantidade += 1;
    });

    return totais;
  };

  const exportarRelatorio = () => {
    const csvContent = [
      [
        "Tipo",
        "Cliente/Fornecedor",
        "Descrição",
        "Valor",
        "Vencimento",
        "Dias de Atraso",
        "Categoria",
        "Documento",
        "Status",
      ].join(","),
      ...contasInadimplentes.map((conta) =>
        [
          getTipoText(conta.tipo),
          conta.nome_cliente_fornecedor,
          conta.descricao,
          conta.valor.toFixed(2),
          new Date(conta.dt_vencimento).toLocaleDateString("pt-BR"),
          conta.dias_atraso,
          getCategoriaAtraso(conta.dias_atraso).categoria,
          conta.numero_documento || "",
          conta.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `relatorio-inadimplencia-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const totais = calcularTotais();

  return (
    <MainLayout>
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0">Relatório de Inadimplência</h1>
            <p className="text-muted">Contas vencidas e em atraso</p>
          </div>
          <button
            className="btn btn-success"
            onClick={exportarRelatorio}
            disabled={contasInadimplentes.length === 0}
          >
            <i className="bi bi-download me-2"></i>
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Tipo de Conta</label>
                <select
                  className="form-select"
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                >
                  <option value="">Todas as contas</option>
                  <option value="PAGAR">Contas a Pagar</option>
                  <option value="RECEBER">Contas a Receber</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Período de Atraso</label>
                <select
                  className="form-select"
                  value={diasAtrasoFilter}
                  onChange={(e) => setDiasAtrasoFilter(e.target.value)}
                >
                  <option value="">Todos os períodos</option>
                  <option value="30">Até 30 dias</option>
                  <option value="60">Até 60 dias</option>
                  <option value="90">Até 90 dias</option>
                  <option value="91">Mais de 90 dias</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">&nbsp;</label>
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => {
                    setTipoFilter("");
                    setDiasAtrasoFilter("");
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Total de Contas</h6>
                <h4 className="text-primary mb-0">{totais.totalContas}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Valor Total</h6>
                <h4 className="text-danger mb-0">
                  R$ {totais.totalValor.toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Contas a Pagar</h6>
                <h4 className="text-danger mb-0">
                  {totais.porTipo.PAGAR.quantidade}
                </h4>
                <small className="text-muted">
                  R$ {totais.porTipo.PAGAR.valor.toFixed(2)}
                </small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Contas a Receber</h6>
                <h4 className="text-warning mb-0">
                  {totais.porTipo.RECEBER.quantidade}
                </h4>
                <small className="text-muted">
                  R$ {totais.porTipo.RECEBER.valor.toFixed(2)}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Análise por Período de Atraso */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Análise por Período de Atraso</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {Object.entries(totais.porCategoria).map(
                    ([categoria, dados]) => (
                      <div key={categoria} className="col-md-3">
                        <div className="text-center">
                          <h6 className="text-muted">{categoria}</h6>
                          <h5 className="mb-1">{dados.quantidade} contas</h5>
                          <p className="text-danger mb-0">
                            R$ {dados.valor.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Contas Inadimplentes */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive table-responsive-custom">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Tipo</th>
                    <th>Cliente/Fornecedor</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Dias de Atraso</th>
                    <th>Categoria</th>
                    <th>Documento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contasInadimplentes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <div className="empty-state">
                          <div className="empty-state-icon">✅</div>
                          <p className="text-muted">
                            Nenhuma conta inadimplente encontrada
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    contasInadimplentes.map((conta) => {
                      const categoriaAtraso = getCategoriaAtraso(
                        conta.dias_atraso
                      );
                      return (
                        <tr key={`${conta.tipo}-${conta.id}`}>
                          <td>
                            <span
                              className={`badge ${getTipoBadge(conta.tipo)}`}
                            >
                              {getTipoText(conta.tipo)}
                            </span>
                          </td>
                          <td className="fw-bold">
                            {conta.nome_cliente_fornecedor}
                          </td>
                          <td>{conta.descricao}</td>
                          <td className="fw-bold text-danger">
                            R$ {conta.valor.toFixed(2)}
                          </td>
                          <td>
                            {new Date(conta.dt_vencimento).toLocaleDateString(
                              "pt-BR"
                            )}
                          </td>
                          <td>
                            <span className={`badge ${categoriaAtraso.classe}`}>
                              {conta.dias_atraso} dias
                            </span>
                          </td>
                          <td>{conta.categoria || "-"}</td>
                          <td>{conta.numero_documento || "-"}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {conta.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
