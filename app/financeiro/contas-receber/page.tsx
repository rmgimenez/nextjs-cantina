"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface ContaReceber {
  id: number;
  tipo_cliente: "FUNCIONARIO" | "ALUNO" | "TERCEIRO";
  codigo_funcionario: number;
  ra_aluno: number;
  nome_terceiro: string;
  nome_cliente: string;
  descricao: string;
  valor: number;
  dt_vencimento: string;
  dt_recebimento: string;
  valor_recebido: number;
  status: "PENDENTE" | "RECEBIDO" | "VENCIDO" | "PARCIAL";
  categoria: string;
  numero_documento: string;
  observacoes: string;
  dt_criacao: string;
  criado_por_nome: string;
}

export default function ContasReceberPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tipoClienteFilter, setTipoClienteFilter] = useState("");
  const [dtInicioFilter, setDtInicioFilter] = useState("");
  const [dtFimFilter, setDtFimFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaReceber | null>(null);

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
    }
  }, [
    user,
    searchTerm,
    statusFilter,
    tipoClienteFilter,
    dtInicioFilter,
    dtFimFilter,
  ]);

  const loadContas = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (tipoClienteFilter) params.append("tipo_cliente", tipoClienteFilter);
      if (dtInicioFilter) params.append("dt_inicio", dtInicioFilter);
      if (dtFimFilter) params.append("dt_fim", dtFimFilter);

      const res = await fetch(`/api/contas-receber?${params}`);
      const data = await res.json();

      if (data.success) {
        setContas(data.data);
      } else {
        console.error("Erro ao carregar contas a receber:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar contas a receber:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta conta a receber?")) {
      return;
    }

    try {
      const res = await fetch(`/api/contas-receber/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Conta a receber excluída com sucesso!");
        loadContas();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao excluir conta a receber:", error);
      alert("Erro interno do servidor");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDENTE: "bg-warning text-dark",
      RECEBIDO: "bg-success",
      VENCIDO: "bg-danger",
      PARCIAL: "bg-info",
    };
    return badges[status as keyof typeof badges] || "bg-secondary";
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDENTE: "Pendente",
      RECEBIDO: "Recebido",
      VENCIDO: "Vencido",
      PARCIAL: "Parcial",
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getTipoClienteText = (tipo: string) => {
    const texts = {
      FUNCIONARIO: "Funcionário",
      ALUNO: "Aluno",
      TERCEIRO: "Terceiro",
    };
    return texts[tipo as keyof typeof texts] || tipo;
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
            <h1 className="h3 mb-0">Contas a Receber</h1>
            <p className="text-muted">
              Gerencie as contas a receber da cantina
            </p>
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
                  placeholder="Buscar por descrição, cliente ou documento..."
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
                  <option value="RECEBIDO">Recebido</option>
                  <option value="VENCIDO">Vencido</option>
                  <option value="PARCIAL">Parcial</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={tipoClienteFilter}
                  onChange={(e) => setTipoClienteFilter(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="FUNCIONARIO">Funcionário</option>
                  <option value="ALUNO">Aluno</option>
                  <option value="TERCEIRO">Terceiro</option>
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
              <div className="col-md-3">
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Data fim"
                      value={dtFimFilter}
                      onChange={(e) => setDtFimFilter(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => setShowModal(true)}
                    >
                      Nova Conta
                    </button>
                  </div>
                </div>
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
                    .reduce((sum, c) => sum + c.valor, 0)
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
                    .reduce((sum, c) => sum + c.valor, 0)
                    .toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-muted">Total Recebido</h6>
                <h4 className="text-success mb-0">
                  R${" "}
                  {contas
                    .filter((c) => c.status === "RECEBIDO")
                    .reduce((sum, c) => sum + c.valor, 0)
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
                  R$ {contas.reduce((sum, c) => sum + c.valor, 0).toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Contas a Receber */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive table-responsive-custom">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
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
                      <td colSpan={9} className="text-center py-4">
                        <div className="empty-state">
                          <div className="empty-state-icon">💰</div>
                          <p className="text-muted">
                            Nenhuma conta a receber encontrada
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    contas.map((conta) => (
                      <tr key={conta.id}>
                        <td>
                          <div className="fw-bold">{conta.nome_cliente}</div>
                          {conta.tipo_cliente === "FUNCIONARIO" &&
                            conta.codigo_funcionario && (
                              <small className="text-muted">
                                Código: {conta.codigo_funcionario}
                              </small>
                            )}
                          {conta.tipo_cliente === "ALUNO" && conta.ra_aluno && (
                            <small className="text-muted">
                              RA: {conta.ra_aluno}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className={`badge bg-light text-dark`}>
                            {getTipoClienteText(conta.tipo_cliente)}
                          </span>
                        </td>
                        <td>{conta.descricao}</td>
                        <td className="fw-bold">R$ {conta.valor.toFixed(2)}</td>
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

      {/* Modal para Criar/Editar Conta a Receber */}
      {showModal && (
        <ContaReceberModal
          conta={editingConta}
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

// Componente Modal para Conta a Receber
interface ContaReceberModalProps {
  conta: ContaReceber | null;
  onClose: () => void;
  onSave: () => void;
}

function ContaReceberModal({ conta, onClose, onSave }: ContaReceberModalProps) {
  const [formData, setFormData] = useState({
    tipo_cliente: conta?.tipo_cliente || "FUNCIONARIO",
    codigo_funcionario: conta?.codigo_funcionario?.toString() || "",
    ra_aluno: conta?.ra_aluno?.toString() || "",
    nome_terceiro: conta?.nome_terceiro || "",
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

    if (!formData.tipo_cliente)
      newErrors.tipo_cliente = "Tipo de cliente é obrigatório";
    if (!formData.descricao.trim())
      newErrors.descricao = "Descrição é obrigatória";
    if (!formData.valor || parseFloat(formData.valor) <= 0)
      newErrors.valor = "Valor deve ser maior que zero";
    if (!formData.dt_vencimento)
      newErrors.dt_vencimento = "Data de vencimento é obrigatória";

    // Validações específicas por tipo de cliente
    if (
      formData.tipo_cliente === "FUNCIONARIO" &&
      !formData.codigo_funcionario
    ) {
      newErrors.codigo_funcionario = "Código do funcionário é obrigatório";
    }
    if (formData.tipo_cliente === "ALUNO" && !formData.ra_aluno) {
      newErrors.ra_aluno = "RA do aluno é obrigatório";
    }
    if (
      formData.tipo_cliente === "TERCEIRO" &&
      !formData.nome_terceiro.trim()
    ) {
      newErrors.nome_terceiro = "Nome do terceiro é obrigatório";
    }

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
        codigo_funcionario:
          formData.tipo_cliente === "FUNCIONARIO"
            ? parseInt(formData.codigo_funcionario)
            : undefined,
        ra_aluno:
          formData.tipo_cliente === "ALUNO"
            ? parseInt(formData.ra_aluno)
            : undefined,
        nome_terceiro:
          formData.tipo_cliente === "TERCEIRO"
            ? formData.nome_terceiro
            : undefined,
      };

      const url = conta
        ? `/api/contas-receber/${conta.id}`
        : "/api/contas-receber";
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
            ? "Conta a receber atualizada com sucesso!"
            : "Conta a receber criada com sucesso!"
        );
        onSave();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao salvar conta a receber:", error);
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
              {conta ? "Editar Conta a Receber" : "Nova Conta a Receber"}
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
                  <label className="form-label">Tipo de Cliente *</label>
                  <select
                    className={`form-select ${
                      errors.tipo_cliente ? "is-invalid" : ""
                    }`}
                    value={formData.tipo_cliente}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        tipo_cliente: e.target.value as
                          | "FUNCIONARIO"
                          | "ALUNO"
                          | "TERCEIRO",
                        codigo_funcionario: "",
                        ra_aluno: "",
                        nome_terceiro: "",
                      });
                    }}
                  >
                    <option value="FUNCIONARIO">Funcionário</option>
                    <option value="ALUNO">Aluno</option>
                    <option value="TERCEIRO">Terceiro</option>
                  </select>
                  {errors.tipo_cliente && (
                    <div className="invalid-feedback">
                      {errors.tipo_cliente}
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

                {/* Campos específicos por tipo de cliente */}
                {formData.tipo_cliente === "FUNCIONARIO" && (
                  <div className="col-md-6">
                    <label className="form-label">
                      Código do Funcionário *
                    </label>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.codigo_funcionario ? "is-invalid" : ""
                      }`}
                      value={formData.codigo_funcionario}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigo_funcionario: e.target.value,
                        })
                      }
                    />
                    {errors.codigo_funcionario && (
                      <div className="invalid-feedback">
                        {errors.codigo_funcionario}
                      </div>
                    )}
                  </div>
                )}

                {formData.tipo_cliente === "ALUNO" && (
                  <div className="col-md-6">
                    <label className="form-label">RA do Aluno *</label>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.ra_aluno ? "is-invalid" : ""
                      }`}
                      value={formData.ra_aluno}
                      onChange={(e) =>
                        setFormData({ ...formData, ra_aluno: e.target.value })
                      }
                    />
                    {errors.ra_aluno && (
                      <div className="invalid-feedback">{errors.ra_aluno}</div>
                    )}
                  </div>
                )}

                {formData.tipo_cliente === "TERCEIRO" && (
                  <div className="col-md-6">
                    <label className="form-label">Nome do Terceiro *</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.nome_terceiro ? "is-invalid" : ""
                      }`}
                      value={formData.nome_terceiro}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nome_terceiro: e.target.value,
                        })
                      }
                    />
                    {errors.nome_terceiro && (
                      <div className="invalid-feedback">
                        {errors.nome_terceiro}
                      </div>
                    )}
                  </div>
                )}

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
                    placeholder="Ex: Faturas, Serviços..."
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

                <div className="col-12">
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
