"use client";

import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../../components/MainLayout";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface UsuarioSistema {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  telefone: string;
  perfil_nome: string;
  ativo: number;
  dt_criacao: string;
  dt_ultimo_acesso: string | null;
}

interface UsuarioModalProps {
  usuario: UsuarioSistema | null;
  onClose: () => void;
  onSave: () => void;
}

function UsuarioModal({ usuario, onClose, onSave }: UsuarioModalProps) {
  const [formData, setFormData] = useState({
    nome: usuario?.nome || "",
    usuario: usuario?.usuario || "",
    email: usuario?.email || "",
    telefone: usuario?.telefone || "",
    senha: "",
    confirmarSenha: "",
    id_perfil: usuario
      ? usuario.perfil_nome === "ADMINISTRADOR"
        ? "1"
        : "2"
      : "2",
    ativo: usuario ? usuario.ativo.toString() : "1",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.usuario.trim()) newErrors.usuario = "Usuário é obrigatório";
    if (!usuario && !formData.senha) newErrors.senha = "Senha é obrigatória";
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

      const url = usuario
        ? `/api/funcionarios-cantina/${usuario.id}`
        : "/api/funcionarios-cantina";
      const method = usuario ? "PUT" : "POST";

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
          usuario
            ? "Usuário atualizado com sucesso!"
            : "Usuário criado com sucesso!"
        );
        onSave();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert("Erro interno do servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block modal-user"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {usuario ? "Editar Usuário" : "Novo Usuário"}
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
                    Senha {usuario ? "(deixe em branco para manter)" : "*"}
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
                    {usuario ? "(deixe em branco para manter)" : "*"}
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
                {loading ? "Salvando..." : usuario ? "Atualizar" : "Criar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UsuariosSistemaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [perfilFilter, setPerfilFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioSistema | null>(
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

  const loadUsuarios = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (perfilFilter) params.append("perfil", perfilFilter);
      if (statusFilter) params.append("ativo", statusFilter);

      const res = await fetch(`/api/funcionarios-cantina?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsuarios(data.data);
      } else {
        console.error("Erro ao carregar usuários:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }, [searchTerm, perfilFilter, statusFilter]);

  useEffect(() => {
    if (user) {
      loadUsuarios();
    }
  }, [user, loadUsuarios]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja desativar este usuário?")) {
      return;
    }

    try {
      const res = await fetch(`/api/funcionarios-cantina/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Usuário desativado com sucesso!");
        loadUsuarios();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      alert("Erro interno do servidor");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus ? 0 : 1;
    const action = newStatus ? "ativar" : "desativar";

    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) {
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
        alert(`Usuário ${action}do com sucesso!`);
        loadUsuarios();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao alterar status do usuário:", error);
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
        {/* Header */}
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">👥 Administração de Usuários</h4>
              <p className="text-muted mb-0">
                Gerencie os usuários do sistema da cantina
              </p>
            </div>
            <button
              className="btn btn-light btn-lg"
              onClick={() => setShowModal(true)}
            >
              <span className="me-2">➕</span>
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="filters-section">
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
              <button className="btn btn-primary w-100" onClick={loadUsuarios}>
                🔍 Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card stats-card">
              <div className="card-body text-center">
                <div className="stats-icon text-primary">👥</div>
                <h5 className="card-title">{usuarios.length}</h5>
                <p className="text-muted mb-0">Total de Usuários</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card">
              <div className="card-body text-center">
                <div className="stats-icon text-success">✅</div>
                <h5 className="card-title">
                  {usuarios.filter((u) => u.ativo === 1).length}
                </h5>
                <p className="text-muted mb-0">Usuários Ativos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card">
              <div className="card-body text-center">
                <div className="stats-icon text-danger">👑</div>
                <h5 className="card-title">
                  {
                    usuarios.filter((u) => u.perfil_nome === "ADMINISTRADOR")
                      .length
                  }
                </h5>
                <p className="text-muted mb-0">Administradores</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card">
              <div className="card-body text-center">
                <div className="stats-icon text-info">👨‍💼</div>
                <h5 className="card-title">
                  {usuarios.filter((u) => u.perfil_nome === "OPERADOR").length}
                </h5>
                <p className="text-muted mb-0">Operadores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h6 className="mb-0">Lista de Usuários</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive table-responsive-custom">
              <table className="table table-users">
                <thead className="table-light">
                  <tr>
                    <th>Nome</th>
                    <th>Usuário</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Último Acesso</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <div className="empty-state">
                          <div className="empty-state-icon">👥</div>
                          <p className="text-muted">
                            Nenhum usuário encontrado
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>{usuario.nome}</td>
                        <td>{usuario.usuario}</td>
                        <td>{usuario.email || "-"}</td>
                        <td>{usuario.telefone || "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              usuario.perfil_nome === "ADMINISTRADOR"
                                ? "bg-danger"
                                : "bg-info"
                            }`}
                          >
                            {usuario.perfil_nome}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              usuario.ativo ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {usuario.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          {usuario.dt_ultimo_acesso
                            ? new Date(
                                usuario.dt_ultimo_acesso
                              ).toLocaleDateString("pt-BR")
                            : "Nunca"}
                        </td>
                        <td>
                          {new Date(usuario.dt_criacao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setEditingUsuario(usuario);
                                setShowModal(true);
                              }}
                              title="Editar usuário"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() =>
                                handleToggleStatus(usuario.id, usuario.ativo)
                              }
                              disabled={usuario.id === 1} // Não permitir desativar admin padrão
                              title={
                                usuario.ativo
                                  ? "Desativar usuário"
                                  : "Ativar usuário"
                              }
                            >
                              {usuario.ativo ? "🚫" : "✅"}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(usuario.id)}
                              disabled={usuario.id === 1} // Não permitir excluir admin padrão
                              title="Excluir usuário"
                            >
                              🗑️
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

      {/* Modal para Criar/Editar Usuário */}
      {showModal && (
        <UsuarioModal
          usuario={editingUsuario}
          onClose={() => {
            setShowModal(false);
            setEditingUsuario(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingUsuario(null);
            loadUsuarios();
          }}
        />
      )}
    </MainLayout>
  );
}
