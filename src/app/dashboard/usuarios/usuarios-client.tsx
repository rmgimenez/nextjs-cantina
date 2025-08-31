"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ConfirmModal } from "../../../components/ui/modal";

type Usuario = {
  id: number;
  usuario: string;
  nome: string;
  tipo: string;
  ativo: number;
  ultimo_login?: string;
  created_at?: string;
};
type Aluno = {
  ra: number;
  nome: string;
  curso: string;
  serie: string;
  turma: string;
  fotoUrl: string;
};
type Funcionario = {
  id: number;
  nome: string;
  cargo: string;
  valorRefeicao: number | null;
};
type PrecoCargo = {
  id: number;
  cargo: string;
  descricao: string;
  valor_refeicao: number;
  ativo: number;
};

type FormErrors = {
  usuario?: string;
  nome?: string;
  senha?: string;
  tipo?: string;
};

type ToastMessage = {
  id: number;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

export default function UsuariosClient() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [precosCargo, setPrecosCargo] = useState<PrecoCargo[]>([]);
  const [tab, setTab] = useState<"usuarios" | "alunos" | "funcionarios">(
    "usuarios"
  );
  const [searchAluno, setSearchAluno] = useState("");
  const [searchFunc, setSearchFunc] = useState("");
  const [cargoForm, setCargoForm] = useState({
    cargo: "",
    descricao: "",
    valor: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<null | Usuario>(null);
  const [form, setForm] = useState({
    usuario: "",
    nome: "",
    tipo: "ATENDENTE",
    senha: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchUsuario, setSearchUsuario] = useState("");
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);

  // Estados para modais de confirmação
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    usuario?: Usuario;
  }>({ isOpen: false });
  const [resetModal, setResetModal] = useState<{
    isOpen: boolean;
    usuario?: Usuario;
  }>({ isOpen: false });

  // Sistema de Toast
  const addToast = (
    type: ToastMessage["type"],
    title: string,
    message: string
  ) => {
    const id = Date.now();
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!form.usuario.trim()) {
      errors.usuario = "Nome de usuário é obrigatório";
    } else if (form.usuario.length < 3) {
      errors.usuario = "Nome de usuário deve ter pelo menos 3 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.usuario)) {
      errors.usuario =
        "Nome de usuário deve conter apenas letras, números e sublinhado";
    }

    if (!form.nome.trim()) {
      errors.nome = "Nome completo é obrigatório";
    } else if (form.nome.length < 2) {
      errors.nome = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!editing && !form.senha.trim()) {
      errors.senha = "Senha é obrigatória";
    } else if (!editing && form.senha.length < 6) {
      errors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!form.tipo) {
      errors.tipo = "Perfil é obrigatório";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filtrar usuários
  useEffect(() => {
    let filtered = usuarios;

    if (!showInactiveUsers) {
      filtered = filtered.filter((u) => u.ativo === 1);
    }

    if (searchUsuario.trim()) {
      const search = searchUsuario.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.usuario.toLowerCase().includes(search) ||
          u.nome.toLowerCase().includes(search) ||
          u.tipo.toLowerCase().includes(search)
      );
    }

    setFilteredUsuarios(filtered);
  }, [usuarios, searchUsuario, showInactiveUsers]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error("fetch_error");
      const body = await res.json();
      setUsuarios(body.usuarios || []);
      addToast("success", "Sucesso", "Lista de usuários atualizada");
    } catch (err) {
      console.error(err);
      addToast("error", "Erro", "Falha ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetch("/api/funcionarios/preco-cargo")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setPrecosCargo(data.precos || []))
      .catch(() => {});
  }, []);

  const clearForm = () => {
    setForm({ usuario: "", nome: "", tipo: "ATENDENTE", senha: "" });
    setFormErrors({});
    setEditing(null);
  };

  const handleChange = (k: string, v: any) => {
    setForm((s) => ({ ...s, [k]: v }));
    // Limpar erro específico quando o campo for alterado
    if (formErrors[k as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      addToast("warning", "Atenção", "Verifique os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errBody = await res
          .json()
          .catch(() => ({ error: "Erro desconhecido" }));
        if (res.status === 409) {
          addToast("error", "Erro", "Nome de usuário já existe");
          setFormErrors({ usuario: "Nome de usuário já existe" });
        } else {
          addToast("error", "Erro", errBody.error || "Falha ao criar usuário");
        }
        return;
      }

      await fetchUsuarios();
      clearForm();
      addToast("success", "Sucesso", "Usuário criado com sucesso!");
    } catch (err) {
      console.error(err);
      addToast("error", "Erro", "Falha ao criar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (u: Usuario) => {
    setEditing(u);
    setForm({ usuario: u.usuario, nome: u.nome, tipo: u.tipo, senha: "" });
    setFormErrors({});
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      addToast("warning", "Atenção", "Verifique os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        id: editing?.id,
        nome: form.nome,
        tipo: form.tipo,
        ativo: editing?.ativo,
      };

      const res = await fetch("/api/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res
          .json()
          .catch(() => ({ error: "Erro desconhecido" }));
        addToast(
          "error",
          "Erro",
          errBody.error || "Falha ao atualizar usuário"
        );
        return;
      }

      clearForm();
      await fetchUsuarios();
      addToast("success", "Sucesso", "Usuário atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      addToast("error", "Erro", "Falha ao atualizar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    try {
      const res = await fetch("/api/usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errBody = await res
          .json()
          .catch(() => ({ error: "Erro desconhecido" }));
        addToast(
          "error",
          "Erro",
          errBody.error || "Falha ao alterar status do usuário"
        );
        return;
      }

      await fetchUsuarios();
      addToast(
        "success",
        "Sucesso",
        `Usuário ${usuario.ativo ? "desativado" : "ativado"} com sucesso!`
      );
    } catch (err) {
      console.error(err);
      addToast("error", "Erro", "Falha ao alterar status do usuário");
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      const res = await fetch("/api/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errBody = await res
          .json()
          .catch(() => ({ error: "Erro desconhecido" }));
        addToast("error", "Erro", errBody.error || "Falha ao resetar senha");
        return;
      }

      addToast("success", "Sucesso", "Senha resetada para: senha123");
      await fetchUsuarios();
    } catch (err) {
      console.error(err);
      addToast("error", "Erro", "Falha ao resetar senha");
    }
  };

  // Handlers para os modais
  const openDeleteModal = (usuario: Usuario) => {
    setDeleteModal({ isOpen: true, usuario });
  };

  const openResetModal = (usuario: Usuario) => {
    setResetModal({ isOpen: true, usuario });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false });
  };

  const closeResetModal = () => {
    setResetModal({ isOpen: false });
  };

  const confirmDelete = () => {
    if (deleteModal.usuario) {
      handleDelete(deleteModal.usuario.id);
    }
  };

  const confirmReset = () => {
    if (resetModal.usuario) {
      handleResetPassword(resetModal.usuario.id);
    }
  };

  async function searchAlunos() {
    if (!searchAluno || searchAluno.length < 3) {
      addToast(
        "warning",
        "Atenção",
        "Digite pelo menos 3 caracteres para buscar"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "/api/alunos?q=" + encodeURIComponent(searchAluno)
      );
      if (res.ok) {
        const data = await res.json();
        setAlunos(data.alunos || []);
        if (data.alunos && data.alunos.length > 0) {
          addToast(
            "success",
            "Sucesso",
            `Encontrados ${data.alunos.length} aluno(s)`
          );
        } else {
          addToast(
            "info",
            "Informação",
            "Nenhum aluno encontrado com os critérios informados"
          );
        }
      } else {
        addToast("error", "Erro", "Falha ao buscar alunos");
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Erro", "Falha ao buscar alunos");
    } finally {
      setLoading(false);
    }
  }

  async function searchFuncionarios() {
    if (!searchFunc || searchFunc.length < 3) {
      addToast(
        "warning",
        "Atenção",
        "Digite pelo menos 3 caracteres para buscar"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "/api/funcionarios?q=" + encodeURIComponent(searchFunc)
      );
      if (res.ok) {
        const data = await res.json();
        setFuncionarios(data.funcionarios || []);
        if (data.funcionarios && data.funcionarios.length > 0) {
          addToast(
            "success",
            "Sucesso",
            `Encontrados ${data.funcionarios.length} funcionário(s)`
          );
        } else {
          addToast(
            "info",
            "Informação",
            "Nenhum funcionário encontrado com os critérios informados"
          );
        }
      } else {
        addToast("error", "Erro", "Falha ao buscar funcionários");
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Erro", "Falha ao buscar funcionários");
    } finally {
      setLoading(false);
    }
  }

  async function salvarPrecoCargo() {
    if (!cargoForm.cargo || !cargoForm.valor) {
      addToast("warning", "Atenção", "Preencha o cargo e valor da refeição");
      return;
    }

    // Validar valor numérico
    const valorNumerico = parseFloat(cargoForm.valor.replace(",", "."));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      addToast("error", "Erro", "Valor deve ser um número positivo");
      return;
    }

    const payload = {
      cargo: cargoForm.cargo.trim(),
      descricao: cargoForm.descricao.trim() || cargoForm.cargo.trim(),
      valor: valorNumerico,
    };

    try {
      const res = await fetch("/api/funcionarios/preco-cargo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res
          .json()
          .catch(() => ({ error: "Erro desconhecido" }));
        addToast(
          "error",
          "Erro",
          errBody.error || "Falha ao salvar preço do cargo"
        );
        return;
      }

      const lista = await fetch("/api/funcionarios/preco-cargo").then((r) =>
        r.json()
      );
      setPrecosCargo(lista.precos || []);
      setCargoForm({ cargo: "", descricao: "", valor: "" });
      addToast(
        "success",
        "Sucesso",
        `Preço para cargo "${payload.cargo}" salvo com sucesso!`
      );
    } catch (err) {
      console.error(err);
      addToast("error", "Erro", "Falha ao salvar preço do cargo");
    }
  }

  function renderUsuariosTab() {
    return (
      <>
        {/* Formulário de Usuário */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="d-flex align-items-center">
              <i className="bi bi-person-plus me-2"></i>
              {editing ? "Editar Usuário" : "Novo Usuário"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="row g-3">
              <div className="col-md-3">
                <Input
                  label="Nome de Usuário"
                  value={form.usuario}
                  onChange={(e) => handleChange("usuario", e.target.value)}
                  error={formErrors.usuario}
                  disabled={editing !== null}
                  placeholder="Digite o nome de usuário"
                />
              </div>
              <div className="col-md-4">
                <Input
                  label="Nome Completo"
                  value={form.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  error={formErrors.nome}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Perfil de Acesso</label>
                <select
                  className={`form-select ${
                    formErrors.tipo ? "is-invalid" : ""
                  }`}
                  value={form.tipo}
                  onChange={(e) => handleChange("tipo", e.target.value)}
                >
                  <option value="ADMIN">👑 Administrador</option>
                  <option value="ATENDENTE">👥 Atendente</option>
                  <option value="ESTOQUISTA">📦 Estoquista</option>
                </select>
                {formErrors.tipo && (
                  <div className="invalid-feedback d-block">
                    {formErrors.tipo}
                  </div>
                )}
                <div className="form-text">
                  {form.tipo === "ADMIN" && "Acesso total ao sistema"}
                  {form.tipo === "ATENDENTE" && "Vendas e consulta de estoque"}
                  {form.tipo === "ESTOQUISTA" && "Gerenciamento de estoque"}
                </div>
              </div>
              <div className="col-md-2">
                {!editing && (
                  <Input
                    label="Senha"
                    type="password"
                    value={form.senha}
                    onChange={(e) => handleChange("senha", e.target.value)}
                    error={formErrors.senha}
                    placeholder="Mín. 6 caracteres"
                    helperText="Mínimo 6 caracteres"
                  />
                )}
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              {editing ? (
                <>
                  <Button
                    variant="primary"
                    onClick={handleUpdate}
                    loading={submitting}
                    disabled={submitting}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Salvar Alterações
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={clearForm}
                    disabled={submitting}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  variant="success"
                  onClick={handleCreate}
                  loading={submitting}
                  disabled={submitting}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Criar Usuário
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <CardTitle className="d-flex align-items-center">
                <i className="bi bi-people me-2"></i>
                Lista de Usuários ({filteredUsuarios.length})
              </CardTitle>
              <div className="d-flex gap-2">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showInactiveUsers"
                    checked={showInactiveUsers}
                    onChange={(e) => setShowInactiveUsers(e.target.checked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="showInactiveUsers"
                  >
                    Mostrar inativos
                  </label>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <Input
                  placeholder="Buscar por usuário, nome ou perfil..."
                  value={searchUsuario}
                  onChange={(e) => setSearchUsuario(e.target.value)}
                  icon={<i className="bi bi-search"></i>}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-2 text-muted">Carregando usuários...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Usuário</th>
                      <th>Nome Completo</th>
                      <th>Perfil</th>
                      <th>Status</th>
                      <th>Último Login</th>
                      <th>Criado em</th>
                      <th style={{ width: "200px" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          <i className="bi bi-inbox display-1 d-block mb-2"></i>
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredUsuarios.map((u) => (
                        <tr
                          key={u.id}
                          className={u.ativo ? "" : "table-secondary"}
                        >
                          <td>
                            <strong>{u.usuario}</strong>
                          </td>
                          <td>{u.nome}</td>
                          <td>
                            <span
                              className={`badge ${
                                u.tipo === "ADMIN"
                                  ? "bg-danger"
                                  : u.tipo === "ATENDENTE"
                                  ? "bg-primary"
                                  : "bg-secondary"
                              }`}
                            >
                              {u.tipo === "ADMIN" && "👑"}
                              {u.tipo === "ATENDENTE" && "👥"}
                              {u.tipo === "ESTOQUISTA" && "📦"} {u.tipo}
                            </span>
                          </td>
                          <td>
                            {u.ativo ? (
                              <span className="badge bg-success">Ativo</span>
                            ) : (
                              <span className="badge bg-danger">Inativo</span>
                            )}
                          </td>
                          <td>
                            {u.ultimo_login ? (
                              new Date(u.ultimo_login).toLocaleString("pt-BR")
                            ) : (
                              <span className="text-muted">Nunca</span>
                            )}
                          </td>
                          <td>
                            {u.created_at ? (
                              new Date(u.created_at).toLocaleDateString("pt-BR")
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Button
                                variant="primary"
                                size="small"
                                onClick={() => handleEdit(u)}
                                disabled={editing !== null}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                variant="warning"
                                size="small"
                                onClick={() => openResetModal(u)}
                                title="Resetar senha"
                              >
                                <i className="bi bi-key"></i>
                              </Button>
                              <Button
                                variant={u.ativo ? "danger" : "success"}
                                size="small"
                                onClick={() => openDeleteModal(u)}
                                title={u.ativo ? "Desativar" : "Ativar"}
                              >
                                <i
                                  className={`bi bi-${
                                    u.ativo ? "person-dash" : "person-check"
                                  }`}
                                ></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  function renderAlunosTab() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="d-flex align-items-center">
            <i className="bi bi-mortarboard me-2"></i>
            Consulta de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <Input
                label="Buscar Aluno"
                placeholder="Digite o RA ou nome do aluno..."
                value={searchAluno}
                onChange={(e) => setSearchAluno(e.target.value)}
                icon={<i className="bi bi-search"></i>}
                helperText="Digite pelo menos 3 caracteres para buscar"
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <Button
                variant="primary"
                onClick={searchAlunos}
                disabled={searchAluno.length < 3}
                className="w-100"
              >
                <i className="bi bi-search me-1"></i>
                Buscar Alunos
              </Button>
            </div>
          </div>

          {alunos.length > 0 && (
            <div className="alert alert-info d-flex align-items-center mb-3">
              <i className="bi bi-info-circle me-2"></i>
              Encontrados {alunos.length} aluno(s)
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>RA</th>
                  <th>Nome</th>
                  <th>Curso</th>
                  <th>Série</th>
                  <th>Turma</th>
                  <th>Foto</th>
                </tr>
              </thead>
              <tbody>
                {alunos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      <i className="bi bi-search display-1 d-block mb-2"></i>
                      {searchAluno.length < 3
                        ? "Digite pelo menos 3 caracteres para buscar alunos"
                        : "Nenhum aluno encontrado com os critérios informados"}
                    </td>
                  </tr>
                ) : (
                  alunos.map((a) => (
                    <tr key={a.ra}>
                      <td>
                        <strong>{a.ra}</strong>
                      </td>
                      <td>{a.nome}</td>
                      <td>
                        <span className="badge bg-secondary">{a.curso}</span>
                      </td>
                      <td>{a.serie}</td>
                      <td>{a.turma}</td>
                      <td>
                        <img
                          src={a.fotoUrl}
                          alt={a.nome}
                          className="rounded-circle border"
                          style={{ width: 50, height: 50, objectFit: "cover" }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.setAttribute(
                              "style",
                              "display: inline-flex"
                            );
                          }}
                        />
                        <div
                          className="rounded-circle bg-secondary d-none align-items-center justify-content-center"
                          style={{
                            width: 50,
                            height: 50,
                            fontSize: "12px",
                            color: "white",
                          }}
                        >
                          <i className="bi bi-person"></i>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderFuncionariosTab() {
    return (
      <>
        {/* Consulta de Funcionários */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="d-flex align-items-center">
              <i className="bi bi-briefcase me-2"></i>
              Funcionários da Escola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <Input
                  label="Buscar Funcionário"
                  placeholder="Digite o código, nome ou cargo..."
                  value={searchFunc}
                  onChange={(e) => setSearchFunc(e.target.value)}
                  icon={<i className="bi bi-search"></i>}
                  helperText="Digite pelo menos 3 caracteres para buscar"
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={searchFuncionarios}
                  disabled={searchFunc.length < 3}
                  className="w-100"
                >
                  <i className="bi bi-search me-1"></i>
                  Buscar Funcionários
                </Button>
              </div>
            </div>

            {funcionarios.length > 0 && (
              <div className="alert alert-info d-flex align-items-center mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Encontrados {funcionarios.length} funcionário(s)
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Valor Refeição</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">
                        <i className="bi bi-search display-1 d-block mb-2"></i>
                        {searchFunc.length < 3
                          ? "Digite pelo menos 3 caracteres para buscar funcionários"
                          : "Nenhum funcionário encontrado com os critérios informados"}
                      </td>
                    </tr>
                  ) : (
                    funcionarios.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <strong>{f.id}</strong>
                        </td>
                        <td>{f.nome}</td>
                        <td>
                          <span className="badge bg-primary">{f.cargo}</span>
                        </td>
                        <td>
                          {f.valorRefeicao != null ? (
                            <span className="badge bg-success">
                              R$ {f.valorRefeicao.toFixed(2)}
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">
                              Não definido
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Configuração de Preços por Cargo */}
        <Card>
          <CardHeader>
            <CardTitle className="d-flex align-items-center">
              <i className="bi bi-currency-dollar me-2"></i>
              Configuração de Preços por Cargo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <Input
                  label="Cargo"
                  placeholder="Digite o cargo"
                  value={cargoForm.cargo}
                  onChange={(e) =>
                    setCargoForm({ ...cargoForm, cargo: e.target.value })
                  }
                />
              </div>
              <div className="col-md-4">
                <Input
                  label="Descrição"
                  placeholder="Descrição do cargo (opcional)"
                  value={cargoForm.descricao}
                  onChange={(e) =>
                    setCargoForm({ ...cargoForm, descricao: e.target.value })
                  }
                />
              </div>
              <div className="col-md-3">
                <Input
                  label="Valor da Refeição (R$)"
                  placeholder="0,00"
                  value={cargoForm.valor}
                  onChange={(e) =>
                    setCargoForm({ ...cargoForm, valor: e.target.value })
                  }
                  icon={<i className="bi bi-currency-dollar"></i>}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <Button
                  variant="success"
                  onClick={salvarPrecoCargo}
                  disabled={!cargoForm.cargo || !cargoForm.valor}
                  className="w-100"
                >
                  <i className="bi bi-check-lg me-1"></i>
                  Salvar
                </Button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Cargo</th>
                    <th>Descrição</th>
                    <th>Valor Refeição</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {precosCargo.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">
                        <i className="bi bi-currency-dollar display-1 d-block mb-2"></i>
                        Nenhum preço configurado ainda
                      </td>
                    </tr>
                  ) : (
                    precosCargo.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.cargo}</strong>
                        </td>
                        <td>{p.descricao}</td>
                        <td>
                          <span className="badge bg-success fs-6">
                            R$ {p.valor_refeicao?.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          {p.ativo ? (
                            <span className="badge bg-success">Ativo</span>
                          ) : (
                            <span className="badge bg-danger">Inativo</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <div>
      {/* Sistema de Toast */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1055 }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast show align-items-center text-bg-${
              toast.type === "success"
                ? "success"
                : toast.type === "error"
                ? "danger"
                : toast.type === "warning"
                ? "warning"
                : "info"
            } border-0`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">
                <strong>{toast.title}</strong>
                <div>{toast.message}</div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => removeToast(toast.id)}
              ></button>
            </div>
          </div>
        ))}
      </div>

      {/* Navegação por Tabs */}
      <div className="mb-4">
        <div className="btn-group">
          <Button
            variant={tab === "usuarios" ? "primary" : "outline"}
            onClick={() => setTab("usuarios")}
          >
            <i className="bi bi-people me-1"></i>
            Usuários Cantina
          </Button>
          <Button
            variant={tab === "alunos" ? "primary" : "outline"}
            onClick={() => setTab("alunos")}
          >
            <i className="bi bi-mortarboard me-1"></i>
            Alunos
          </Button>
          <Button
            variant={tab === "funcionarios" ? "primary" : "outline"}
            onClick={() => setTab("funcionarios")}
          >
            <i className="bi bi-briefcase me-1"></i>
            Funcionários Escola
          </Button>
        </div>
      </div>

      {tab === "usuarios" && renderUsuariosTab()}
      {tab === "alunos" && renderAlunosTab()}
      {tab === "funcionarios" && renderFuncionariosTab()}

      {/* Modais de Confirmação */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title={
          deleteModal.usuario?.ativo ? "Desativar Usuário" : "Ativar Usuário"
        }
        message={
          deleteModal.usuario
            ? `Tem certeza que deseja ${
                deleteModal.usuario.ativo ? "desativar" : "ativar"
              } o usuário "${deleteModal.usuario.nome}"?`
            : ""
        }
        confirmText={deleteModal.usuario?.ativo ? "Desativar" : "Ativar"}
        confirmVariant={deleteModal.usuario?.ativo ? "danger" : "success"}
      />

      <ConfirmModal
        isOpen={resetModal.isOpen}
        onClose={closeResetModal}
        onConfirm={confirmReset}
        title="Resetar Senha"
        message={
          resetModal.usuario
            ? `Tem certeza que deseja resetar a senha do usuário "${resetModal.usuario.nome}" para "senha123"?`
            : ""
        }
        confirmText="Resetar Senha"
        confirmVariant="warning"
      />
    </div>
  );
}
