"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface ContaPagar {
  id: number;
  id_fornecedor: number;
  fornecedor_nome: string;
  fornecedor_razao_social: string;
  descricao: string;
  valor: number;
  dt_vencimento: string;
  dt_pagamento: string;
  valor_pago: number;
  status: "PENDENTE" | "PAGO" | "VENCIDO" | "PARCIAL";
  categoria: string;
  numero_documento: string;
  observacoes: string;
  dt_criacao: string;
  criado_por_nome: string;
}

interface Fornecedor {
  id: number;
  nome: string;
  razao_social: string;
}

export default function ContasPagarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fornecedorFilter, setFornecedorFilter] = useState("");
  const [dtInicioFilter, setDtInicioFilter] = useState("");
  const [dtFimFilter, setDtFimFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaPagar | null>(null);

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
      loadContas();
      loadFornecedores();
    }
  }, [
    user,
    searchTerm,
    statusFilter,
    fornecedorFilter,
    dtInicioFilter,
    dtFimFilter,
  ]);

  const loadContas = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (fornecedorFilter) params.append("fornecedor", fornecedorFilter);
      if (dtInicioFilter) params.append("dt_inicio", dtInicioFilter);
      if (dtFimFilter) params.append("dt_fim", dtFimFilter);

      const res = await fetch(`/api/contas-pagar?${params}`);
      const data = await res.json();

      if (data.success) {
        setContas(data.data);
      } else {
        console.error("Erro ao carregar contas a pagar:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar contas a pagar:", error);
    }
  };

  const loadFornecedores = async () => {
    try {
      const res = await fetch("/api/fornecedores?ativo=1");
      const data = await res.json();

      if (data.success) {
        setFornecedores(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta conta a pagar?")) {
      return;
    }

    try {
      const res = await fetch(`/api/contas-pagar/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Conta a pagar excluída com sucesso!");
        loadContas();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao excluir conta a pagar:", error);
      alert("Erro interno do servidor");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDENTE: "bg-warning text-dark",
      PAGO: "bg-success",
      VENCIDO: "bg-danger",
      PARCIAL: "bg-info",
    };
    return badges[status as keyof typeof badges] || "bg-secondary";
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDENTE: "Pendente",
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

  return (
    <MainLayout>
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0">Contas a Pagar</h1>
            <p className="text-muted">Gerencie as contas a pagar da cantina</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por descrição ou documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="VENCIDO">Vencido</option>
                  <option value="PARCIAL">Parcial</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={fornecedorFilter}
                  onChange={(e) => setFornecedorFilter(e.target.value)}
                >
                  <option value="">Todos os fornecedores</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  placeholder="Data início"
                  value={dtInicioFilter}
                  onChange={(e) => setDtInicioFilter(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowModal(true)}
                >
                  Nova Conta
                </button>
              </div>
            </div>
            <div className="row g-3 mt-2">
              <div className="col-md-2 offset-md-8">
                <input
                  type="date"
                  className="form-control"
                  placeholder="Data fim"
                  value={dtFimFilter}
                  onChange={(e) => setDtFimFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Total Pendente</h6>
                <h4 className="text-warning mb-0">
                  R${" "}
                  {contas
                    .filter((c) => c.status === "PENDENTE")
                    .reduce((sum, c) => sum + (Number(c.valor) || 0), 0)
                    .toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Total Vencido</h6>
                <h4 className="text-danger mb-0">
                  R${" "}
                  {contas
                    .filter((c) => c.status === "VENCIDO")
                    .reduce((sum, c) => sum + (Number(c.valor) || 0), 0)
                    .toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Total Pago</h6>
                <h4 className="text-success mb-0">
                  R${" "}
                  {contas
                    .filter((c) => c.status === "PAGO")
                    .reduce((sum, c) => sum + (Number(c.valor) || 0), 0)
                    .toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Total Geral</h6>
                <h4 className="text-primary mb-0">
                  R${" "}
                  {contas
                    .reduce((sum, c) => sum + (Number(c.valor) || 0), 0)
                    .toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Contas a Pagar */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive table-responsive-custom">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Fornecedor</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                    <th>Categoria</th>
                    <th>Documento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        <div className="empty-state">
                          <div className="empty-state-icon">💰</div>
                          <p className="text-muted">
                            Nenhuma conta a pagar encontrada
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    contas.map((conta) => (
                      <tr key={conta.id}>
                        <td>
                          <div>
                            <div className="fw-bold">
                              {conta.fornecedor_nome}
                            </div>
                            {conta.fornecedor_razao_social && (
                              <small className="text-muted">
                                {conta.fornecedor_razao_social}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>{conta.descricao}</td>
                        <td className="fw-bold">
                          R$ {(Number(conta.valor) || 0).toFixed(2)}
                        </td>
                        <td>
                          {new Date(conta.dt_vencimento).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${getStatusBadge(conta.status)}`}
                          >
                            {getStatusText(conta.status)}
                          </span>
                        </td>
                        <td>{conta.categoria || "-"}</td>
                        <td>{conta.numero_documento || "-"}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setEditingConta(conta);
                                setShowModal(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(conta.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Criar/Editar Conta a Pagar */}
      {showModal && (
        <ContaPagarModal
          conta={editingConta}
          fornecedores={fornecedores}
          onClose={() => {
            setShowModal(false);
            setEditingConta(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingConta(null);
            loadContas();
          }}
        />
      )}
    </MainLayout>
  );
}

// Componente Modal para Conta a Pagar
interface ContaPagarModalProps {
  conta: ContaPagar | null;
  fornecedores: Fornecedor[];
  onClose: () => void;
  onSave: () => void;
}

function ContaPagarModal({
  conta,
  fornecedores,
  onClose,
  onSave,
}: ContaPagarModalProps) {
  const [formData, setFormData] = useState({
    id_fornecedor: conta?.id_fornecedor.toString() || "",
    descricao: conta?.descricao || "",
    valor: conta?.valor.toString() || "",
    dt_vencimento: conta ? conta.dt_vencimento.split("T")[0] : "",
    categoria: conta?.categoria || "",
    numero_documento: conta?.numero_documento || "",
    observacoes: conta?.observacoes || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.id_fornecedor)
      newErrors.id_fornecedor = "Fornecedor é obrigatório";
    if (!formData.descricao.trim())
      newErrors.descricao = "Descrição é obrigatória";
    if (!formData.valor || parseFloat(formData.valor) <= 0)
      newErrors.valor = "Valor deve ser maior que zero";
    if (!formData.dt_vencimento)
      newErrors.dt_vencimento = "Data de vencimento é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        valor: parseFloat(formData.valor),
      };

      const url = conta ? `/api/contas-pagar/${conta.id}` : "/api/contas-pagar";
      const method = conta ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          conta
            ? "Conta a pagar atualizada com sucesso!"
            : "Conta a pagar criada com sucesso!"
        );
        onSave();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao salvar conta a pagar:", error);
      alert("Erro interno do servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {conta ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Fornecedor *</label>
                  <select
                    className={`form-select ${
                      errors.id_fornecedor ? "is-invalid" : ""
                    }`}
                    value={formData.id_fornecedor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        id_fornecedor: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </option>
                    ))}
                  </select>
                  {errors.id_fornecedor && (
                    <div className="invalid-feedback">
                      {errors.id_fornecedor}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Valor *</label>
                  <div className="input-group">
                    <span className="input-group-text">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-control ${
                        errors.valor ? "is-invalid" : ""
                      }`}
                      value={formData.valor}
                      onChange={(e) =>
                        setFormData({ ...formData, valor: e.target.value })
                      }
                    />
                    {errors.valor && (
                      <div className="invalid-feedback">{errors.valor}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Data de Vencimento *</label>
                  <input
                    type="date"
                    className={`form-control ${
                      errors.dt_vencimento ? "is-invalid" : ""
                    }`}
                    value={formData.dt_vencimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dt_vencimento: e.target.value,
                      })
                    }
                  />
                  {errors.dt_vencimento && (
                    <div className="invalid-feedback">
                      {errors.dt_vencimento}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Categoria</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    placeholder="Ex: Material de limpeza, Alimentos..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Número do Documento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.numero_documento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numero_documento: e.target.value,
                      })
                    }
                    placeholder="NF, Recibo, etc."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Descrição *</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.descricao ? "is-invalid" : ""
                    }`}
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                  />
                  {errors.descricao && (
                    <div className="invalid-feedback">{errors.descricao}</div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Salvando..." : conta ? "Atualizar" : "Criar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
