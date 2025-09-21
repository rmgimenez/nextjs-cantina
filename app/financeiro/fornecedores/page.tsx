"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface Fornecedor {
  id: number;
  nome: string;
  razao_social: string;
  cnpj: string;
  cpf: string;
  endereco: string;
  telefone: string;
  email: string;
  contato: string;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
  criado_por_nome: string;
}

export default function FornecedoresPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(
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

  useEffect(() => {
    if (user) {
      loadFornecedores();
    }
  }, [user, searchTerm, statusFilter]);

  const loadFornecedores = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("ativo", statusFilter);

      const res = await fetch(`/api/fornecedores?${params}`);
      const data = await res.json();

      if (data.success) {
        setFornecedores(data.data);
      } else {
        console.error("Erro ao carregar fornecedores:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja desativar este fornecedor?")) {
      return;
    }

    try {
      const res = await fetch(`/api/fornecedores/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Fornecedor desativado com sucesso!");
        loadFornecedores();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao desativar fornecedor:", error);
      alert("Erro interno do servidor");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus ? 0 : 1;
    const action = newStatus ? "ativar" : "desativar";

    if (!confirm(`Tem certeza que deseja ${action} este fornecedor?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/fornecedores/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ativo: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Fornecedor ${action}do com sucesso!`);
        loadFornecedores();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao alterar status do fornecedor:", error);
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0">Fornecedores</h1>
            <p className="text-muted">Gerencie os fornecedores da cantina</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nome, CNPJ, CPF ou email..."
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
                  Novo Fornecedor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Fornecedores */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive table-responsive-custom">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nome</th>
                    <th>CNPJ/CPF</th>
                    <th>Contato</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        <div className="empty-state">
                          <div className="empty-state-icon">🏢</div>
                          <p className="text-muted">
                            Nenhum fornecedor encontrado
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fornecedores.map((fornecedor) => (
                      <tr key={fornecedor.id}>
                        <td>
                          <div>
                            <div className="fw-bold">{fornecedor.nome}</div>
                            {fornecedor.razao_social && (
                              <small className="text-muted">
                                {fornecedor.razao_social}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          {fornecedor.cnpj && (
                            <div>
                              <small className="text-muted">CNPJ:</small>
                              <br />
                              {formatarCNPJ(fornecedor.cnpj)}
                            </div>
                          )}
                          {fornecedor.cpf && (
                            <div>
                              <small className="text-muted">CPF:</small>
                              <br />
                              {formatarCPF(fornecedor.cpf)}
                            </div>
                          )}
                          {!fornecedor.cnpj && !fornecedor.cpf && "-"}
                        </td>
                        <td>{fornecedor.contato || "-"}</td>
                        <td>{fornecedor.email || "-"}</td>
                        <td>{fornecedor.telefone || "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              fornecedor.ativo ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {fornecedor.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          {new Date(fornecedor.dt_criacao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setEditingFornecedor(fornecedor);
                                setShowModal(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() =>
                                handleToggleStatus(
                                  fornecedor.id,
                                  fornecedor.ativo
                                )
                              }
                            >
                              {fornecedor.ativo ? "Desativar" : "Ativar"}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(fornecedor.id)}
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

      {/* Modal para Criar/Editar Fornecedor */}
      {showModal && (
        <FornecedorModal
          fornecedor={editingFornecedor}
          onClose={() => {
            setShowModal(false);
            setEditingFornecedor(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingFornecedor(null);
            loadFornecedores();
          }}
        />
      )}
    </MainLayout>
  );
}

// Componente Modal para Fornecedor
interface FornecedorModalProps {
  fornecedor: Fornecedor | null;
  onClose: () => void;
  onSave: () => void;
}

function FornecedorModal({
  fornecedor,
  onClose,
  onSave,
}: FornecedorModalProps) {
  const [formData, setFormData] = useState({
    nome: fornecedor?.nome || "",
    razao_social: fornecedor?.razao_social || "",
    cnpj: fornecedor?.cnpj || "",
    cpf: fornecedor?.cpf || "",
    endereco: fornecedor?.endereco || "",
    telefone: fornecedor?.telefone || "",
    email: fornecedor?.email || "",
    contato: fornecedor?.contato || "",
    ativo: fornecedor ? fornecedor.ativo.toString() : "1",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";

    // Validar CNPJ se fornecido
    if (formData.cnpj && !validarCNPJ(formData.cnpj)) {
      newErrors.cnpj = "CNPJ inválido";
    }

    // Validar CPF se fornecido
    if (formData.cpf && !validarCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    // Verificar se pelo menos CNPJ ou CPF foi fornecido
    if (!formData.cnpj && !formData.cpf) {
      newErrors.documento = "CNPJ ou CPF deve ser informado";
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
        ativo: parseInt(formData.ativo),
      };

      const url = fornecedor
        ? `/api/fornecedores/${fornecedor.id}`
        : "/api/fornecedores";
      const method = fornecedor ? "PUT" : "POST";

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
          fornecedor
            ? "Fornecedor atualizado com sucesso!"
            : "Fornecedor criado com sucesso!"
        );
        onSave();
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
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
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
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
                  <label className="form-label">Razão Social</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.razao_social}
                    onChange={(e) =>
                      setFormData({ ...formData, razao_social: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">CNPJ</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.cnpj ? "is-invalid" : ""
                    }`}
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cnpj: formatarCNPJ(e.target.value),
                      })
                    }
                    placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && (
                    <div className="invalid-feedback">{errors.cnpj}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">CPF</label>
                  <input
                    type="text"
                    className={`form-control ${errors.cpf ? "is-invalid" : ""}`}
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpf: formatarCPF(e.target.value),
                      })
                    }
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && (
                    <div className="invalid-feedback">{errors.cpf}</div>
                  )}
                </div>
                {errors.documento && (
                  <div className="col-12">
                    <div className="alert alert-danger py-2">
                      {errors.documento}
                    </div>
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-label">Contato</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.contato}
                    onChange={(e) =>
                      setFormData({ ...formData, contato: e.target.value })
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
                <div className="col-md-8">
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
                  <label className="form-label">Endereço</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.endereco}
                    onChange={(e) =>
                      setFormData({ ...formData, endereco: e.target.value })
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
                {loading ? "Salvando..." : fornecedor ? "Atualizar" : "Criar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Funções auxiliares para formatação e validação
function formatarCNPJ(cnpj: string): string {
  const apenasNumeros = cnpj.replace(/\D/g, "");
  return apenasNumeros.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}

function formatarCPF(cpf: string): string {
  const apenasNumeros = cpf.replace(/\D/g, "");
  return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

  // Calcular primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cnpjLimpo[12])) return false;

  // Calcular segundo dígito verificador
  soma = 0;
  peso = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cnpjLimpo[13])) return false;

  return true;
}

function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;

  // Calcular primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cpfLimpo[9])) return false;

  // Calcular segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cpfLimpo[10])) return false;

  return true;
}
