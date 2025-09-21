"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface FuncionarioCantina {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  telefone: string;
  perfil_nome: string;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
}

export default function FuncionariosCantinaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState<FuncionarioCantina[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [perfilFilter, setPerfilFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] =
    useState<FuncionarioCantina | null>(null);

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
      loadFuncionarios();
    }
  }, [user, searchTerm, perfilFilter, statusFilter]);

  const loadFuncionarios = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (perfilFilter) params.append("perfil", perfilFilter);
      if (statusFilter) params.append("ativo", statusFilter);

      const res = await fetch(`/api/funcionarios-cantina?${params}`);
      const data = await res.json();

      if (data.success) {
        setFuncionarios(data.data);
      } else {
        console.error("Erro ao carregar funcionários:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja desativar este funcionário?")) {
      return;
    }

    try {
      const res = await fetch(`/api/funcionarios-cantina/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Funcionário desativado com sucesso!");
        loadFuncionarios();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao desativar funcionário:", error);
      alert("Erro interno do servidor");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus ? 0 : 1;
    const action = newStatus ? "ativar" : "desativar";

    if (!confirm(`Tem certeza que deseja ${action} este funcionário?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/funcionarios-cantina/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ativo: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Funcionário ${action}do com sucesso!`);
        loadFuncionarios();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao alterar status do funcionário:", error);
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
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nome, usuário ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={perfilFilter}
                  onChange={(e) => setPerfilFilter(e.target.value)}
                >
                  <option value="">Todos os perfis</option>
                  <option value="1">Administrador</option>
                  <option value="2">Operador</option>
                </select>
              </div>
              <div className="col-md-3">
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
                  Novo Funcionário
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Funcionários */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive table-responsive-custom">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nome</th>
                    <th>Usuário</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        <div className="empty-state">
                          <div className="empty-state-icon">👥</div>
                          <p className="text-muted">
                            Nenhum funcionário encontrado
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    funcionarios.map((funcionario) => (
                      <tr key={funcionario.id}>
                        <td>{funcionario.nome}</td>
                        <td>{funcionario.usuario}</td>
                        <td>{funcionario.email || "-"}</td>
                        <td>{funcionario.telefone || "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              funcionario.perfil_nome === "ADMINISTRADOR"
                                ? "bg-danger"
                                : "bg-info"
                            }`}
                          >
                            {funcionario.perfil_nome}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              funcionario.ativo ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {funcionario.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          {new Date(funcionario.dt_criacao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setEditingFuncionario(funcionario);
                                setShowModal(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() =>
                                handleToggleStatus(
                                  funcionario.id,
                                  funcionario.ativo
                                )
                              }
                              disabled={funcionario.id === 1} // Não permitir desativar admin padrão
                            >
                              {funcionario.ativo ? "Desativar" : "Ativar"}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(funcionario.id)}
                              disabled={funcionario.id === 1} // Não permitir excluir admin padrão
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

      {/* Modal para Criar/Editar Funcionário */}
      {showModal && (
        <FuncionarioModal
          funcionario={editingFuncionario}
          onClose={() => {
            setShowModal(false);
            setEditingFuncionario(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingFuncionario(null);
            loadFuncionarios();
          }}
        />
      )}
    </MainLayout>
  );
}

// Componente Modal para Funcionário
interface FuncionarioModalProps {
  funcionario: FuncionarioCantina | null;
  onClose: () => void;
  onSave: () => void;
}

function FuncionarioModal({
  funcionario,
  onClose,
  onSave,
}: FuncionarioModalProps) {
  const [formData, setFormData] = useState({
    nome: funcionario?.nome || "",
    usuario: funcionario?.usuario || "",
    email: funcionario?.email || "",
    telefone: funcionario?.telefone || "",
    senha: "",
    confirmarSenha: "",
    id_perfil: funcionario
      ? funcionario.perfil_nome === "ADMINISTRADOR"
        ? "1"
        : "2"
      : "2",
    ativo: funcionario ? funcionario.ativo.toString() : "1",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.usuario.trim()) newErrors.usuario = "Usuário é obrigatório";
    if (!funcionario && !formData.senha)
      newErrors.senha = "Senha é obrigatória";
    if (formData.senha && formData.senha.length < 6)
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    if (formData.senha !== formData.confirmarSenha)
      newErrors.confirmarSenha = "Senhas não coincidem";

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

      // Preparar dados para envio (remover campos de senha se vazios)
      const dataToSend = submitData.senha
        ? submitData
        : {
            nome: submitData.nome,
            usuario: submitData.usuario,
            email: submitData.email,
            telefone: submitData.telefone,
            id_perfil: submitData.id_perfil,
            ativo: submitData.ativo,
          };

      const url = funcionario
        ? `/api/funcionarios-cantina/${funcionario.id}`
        : "/api/funcionarios-cantina";
      const method = funcionario ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          funcionario
            ? "Funcionário atualizado com sucesso!"
            : "Funcionário criado com sucesso!"
        );
        onSave();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
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
              {funcionario ? "Editar Funcionário" : "Novo Funcionário"}
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
                  />
                  {errors.nome && (
                    <div className="invalid-feedback">{errors.nome}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Usuário *</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.usuario ? "is-invalid" : ""
                    }`}
                    value={formData.usuario}
                    onChange={(e) =>
                      setFormData({ ...formData, usuario: e.target.value })
                    }
                  />
                  {errors.usuario && (
                    <div className="invalid-feedback">{errors.usuario}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Perfil *</label>
                  <select
                    className="form-select"
                    value={formData.id_perfil}
                    onChange={(e) =>
                      setFormData({ ...formData, id_perfil: e.target.value })
                    }
                  >
                    <option value="2">Operador</option>
                    <option value="1">Administrador</option>
                  </select>
                </div>
                <div className="col-md-6">
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
                <div className="col-md-6">
                  <label className="form-label">
                    Senha {funcionario ? "(deixe em branco para manter)" : "*"}
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.senha ? "is-invalid" : ""
                    }`}
                    value={formData.senha}
                    onChange={(e) =>
                      setFormData({ ...formData, senha: e.target.value })
                    }
                  />
                  {errors.senha && (
                    <div className="invalid-feedback">{errors.senha}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Confirmar Senha{" "}
                    {funcionario ? "(deixe em branco para manter)" : "*"}
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.confirmarSenha ? "is-invalid" : ""
                    }`}
                    value={formData.confirmarSenha}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmarSenha: e.target.value,
                      })
                    }
                  />
                  {errors.confirmarSenha && (
                    <div className="invalid-feedback">
                      {errors.confirmarSenha}
                    </div>
                  )}
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
                {loading ? "Salvando..." : funcionario ? "Atualizar" : "Criar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
