"use client";

import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../../components/MainLayout";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface TipoProduto {
  id: number;
  nome: string;
  descricao: string;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
  criado_por_nome: string;
}

export default function TiposProdutosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tiposProdutos, setTiposProdutos] = useState<TipoProduto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoProduto | null>(null);

  const loadTiposProdutos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("ativo", statusFilter);

      const res = await fetch(`/api/tipos-produtos?${params}`);
      const data = await res.json();

      if (data.success) {
        setTiposProdutos(data.data);
      } else {
        console.error("Erro ao carregar tipos de produtos:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar tipos de produtos:", error);
    }
  }, [searchTerm, statusFilter]);

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
      loadTiposProdutos();
    }
  }, [user, loadTiposProdutos]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja desativar este tipo de produto?")) {
      return;
    }

    try {
      const res = await fetch(`/api/tipos-produtos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Tipo de produto desativado com sucesso!");
        loadTiposProdutos();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao desativar tipo de produto:", error);
      alert("Erro interno do servidor");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus ? 0 : 1;
    const action = newStatus ? "ativar" : "desativar";

    if (!confirm(`Tem certeza que deseja ${action} este tipo de produto?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tipos-produtos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ativo: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Tipo de produto ${action}do com sucesso!`);
        loadTiposProdutos();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao alterar status do tipo de produto:", error);
      alert("Erro interno do servidor");
    }
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
        {/* Filtros e Busca */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowModal(true)}
                >
                  Novo Tipo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Tipos de Produtos */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive table-responsive-custom">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Criado por</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tiposProdutos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <div className="empty-state">
                          <div className="empty-state-icon">📦</div>
                          <p className="text-muted">
                            Nenhum tipo de produto encontrado
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tiposProdutos.map((tipo) => (
                      <tr key={tipo.id}>
                        <td>{tipo.nome}</td>
                        <td>{tipo.descricao || "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              tipo.ativo ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {tipo.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          {new Date(tipo.dt_criacao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td>{tipo.criado_por_nome || "-"}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setEditingTipo(tipo);
                                setShowModal(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() =>
                                handleToggleStatus(tipo.id, tipo.ativo)
                              }
                            >
                              {tipo.ativo ? "Desativar" : "Ativar"}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(tipo.id)}
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

      {/* Modal para Criar/Editar Tipo de Produto */}
      {showModal && (
        <TipoProdutoModal
          tipo={editingTipo}
          onClose={() => {
            setShowModal(false);
            setEditingTipo(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingTipo(null);
            loadTiposProdutos();
          }}
        />
      )}
    </MainLayout>
  );
}

// Componente Modal para Tipo de Produto
interface TipoProdutoModalProps {
  tipo: TipoProduto | null;
  onClose: () => void;
  onSave: () => void;
}

function TipoProdutoModal({ tipo, onClose, onSave }: TipoProdutoModalProps) {
  const [formData, setFormData] = useState({
    nome: tipo?.nome || "",
    descricao: tipo?.descricao || "",
    ativo: tipo ? tipo.ativo.toString() : "1",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";

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
        ativo: parseInt(formData.ativo),
      };

      const url = tipo
        ? `/api/tipos-produtos/${tipo.id}`
        : "/api/tipos-produtos";
      const method = tipo ? "PUT" : "POST";

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
          tipo
            ? "Tipo de produto atualizado com sucesso!"
            : "Tipo de produto criado com sucesso!"
        );
        onSave();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao salvar tipo de produto:", error);
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
              {tipo ? "Editar Tipo de Produto" : "Novo Tipo de Produto"}
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
                <div className="col-md-8">
                  <label className="form-label">Nome *</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.nome ? "is-invalid" : ""
                    }`}
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex: Salgados, Doces, Bebidas..."
                  />
                  {errors.nome && (
                    <div className="invalid-feedback">{errors.nome}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.ativo}
                    onChange={(e) =>
                      setFormData({ ...formData, ativo: e.target.value })
                    }
                  >
                    <option value="1">Ativo</option>
                    <option value="0">Inativo</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    placeholder="Descrição opcional do tipo de produto..."
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
                {loading ? "Salvando..." : tipo ? "Atualizar" : "Criar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
