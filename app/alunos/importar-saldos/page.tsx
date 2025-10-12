"use client";

import MainLayout from "@/components/MainLayout";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Erro {
  linha: number;
  ra: string;
  saldo: string;
  motivo: string;
}

interface AlunoAfetado {
  ra: number;
  nome: string;
  saldoAnterior: number;
  saldoNovo: number;
}

interface ResultadoImportacao {
  totalLinhas: number;
  contasCriadas: number;
  contasAtualizadas: number;
  erros: Erro[];
  alunosAfetados: AlunoAfetado[];
}

export default function ImportarSaldosPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.authenticated) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar extensão do arquivo
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setError("Por favor, selecione um arquivo CSV");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      setResultado(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo");
      return;
    }

    setUploading(true);
    setError("");
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("nomeArquivo", file.name);

      const response = await fetch("/api/alunos/importar-saldos", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao importar saldos");
      }

      setResultado(data.resultado);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao processar importação";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "123456;100.50\n789012;250.00\n345678;75.25";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_importacao_saldos.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  if (loading) {
    return (
      <MainLayout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="text-primary">
              <i className="bi bi-file-earmark-arrow-up me-2"></i>
              Importação de Saldos de Alunos
            </h2>
            <p className="text-muted">
              Importe saldos de contas de alunos através de um arquivo CSV
            </p>
          </div>
        </div>

        {/* Card de instruções */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-info">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Instruções
                </h5>
              </div>
              <div className="card-body">
                <h6>Formato do arquivo CSV:</h6>
                <ul>
                  <li>Arquivo CSV sem cabeçalho</li>
                  <li>
                    Separador: <strong>ponto e vírgula (;)</strong>
                  </li>
                  <li>
                    Formato de cada linha: <code>RA_DO_ALUNO;SALDO</code>
                  </li>
                  <li>
                    Aceita valores com vírgula ou ponto como separador decimal
                  </li>
                  <li>
                    Exemplo: <code>123456;100,50</code> ou{" "}
                    <code>789012;250.00</code>
                  </li>
                </ul>
                <h6 className="mt-3">Comportamento da importação:</h6>
                <ul>
                  <li>
                    Se o aluno já possui conta ativa, o saldo será{" "}
                    <strong>atualizado</strong>
                  </li>
                  <li>
                    Se o aluno não possui conta, uma nova será{" "}
                    <strong>criada</strong>
                  </li>
                  <li>
                    Cada importação gera uma movimentação de ajuste no histórico
                  </li>
                  <li>
                    Erros em linhas específicas não interrompem o processamento
                  </li>
                  <li>Um relatório detalhado será exibido ao final</li>
                </ul>
                <button
                  className="btn btn-outline-info btn-sm mt-2"
                  onClick={downloadTemplate}
                >
                  <i className="bi bi-download me-2"></i>
                  Baixar Arquivo Modelo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card de upload */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-3">Selecionar Arquivo</h5>
                <div className="mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {file && (
                    <div className="mt-2 text-success">
                      <i className="bi bi-file-earmark-check me-2"></i>
                      Arquivo selecionado: <strong>{file.name}</strong>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  {uploading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>
                      Importar Saldos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* Resultado da importação */}
        {resultado && (
          <div className="row">
            <div className="col-12">
              <div className="card border-success">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    Resultado da Importação
                  </h5>
                </div>
                <div className="card-body">
                  {/* Resumo */}
                  <div className="row mb-4">
                    <div className="col-md-3 col-sm-6 mb-3">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h3 className="mb-0">{resultado.totalLinhas}</h3>
                          <small className="text-muted">Total de Linhas</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <div className="card bg-success text-white">
                        <div className="card-body text-center">
                          <h3 className="mb-0">{resultado.contasCriadas}</h3>
                          <small>Contas Criadas</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <div className="card bg-info text-white">
                        <div className="card-body text-center">
                          <h3 className="mb-0">
                            {resultado.contasAtualizadas}
                          </h3>
                          <small>Contas Atualizadas</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <div className="card bg-danger text-white">
                        <div className="card-body text-center">
                          <h3 className="mb-0">{resultado.erros.length}</h3>
                          <small>Erros</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Erros */}
                  {resultado.erros.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Erros Encontrados ({resultado.erros.length})
                      </h6>
                      <div
                        className="table-responsive"
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        <table className="table table-sm table-striped">
                          <thead className="table-danger">
                            <tr>
                              <th>Linha</th>
                              <th>RA</th>
                              <th>Saldo</th>
                              <th>Motivo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultado.erros.map((erro, index) => (
                              <tr key={index}>
                                <td>{erro.linha}</td>
                                <td>{erro.ra}</td>
                                <td>{erro.saldo}</td>
                                <td>{erro.motivo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Alunos afetados */}
                  {resultado.alunosAfetados.length > 0 && (
                    <div>
                      <h6 className="text-success">
                        <i className="bi bi-check-circle me-2"></i>
                        Alunos Processados com Sucesso (
                        {resultado.alunosAfetados.length})
                      </h6>
                      <div
                        className="table-responsive"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        <table className="table table-sm table-hover">
                          <thead className="table-success">
                            <tr>
                              <th>RA</th>
                              <th>Nome</th>
                              <th className="text-end">Saldo Anterior</th>
                              <th className="text-end">Saldo Novo</th>
                              <th className="text-end">Diferença</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultado.alunosAfetados.map((aluno, index) => {
                              const diferenca =
                                aluno.saldoNovo - aluno.saldoAnterior;
                              return (
                                <tr key={index}>
                                  <td>{aluno.ra}</td>
                                  <td>{aluno.nome}</td>
                                  <td className="text-end">
                                    {formatarMoeda(aluno.saldoAnterior)}
                                  </td>
                                  <td className="text-end">
                                    {formatarMoeda(aluno.saldoNovo)}
                                  </td>
                                  <td
                                    className={`text-end ${
                                      diferenca >= 0
                                        ? "text-success"
                                        : "text-danger"
                                    }`}
                                  >
                                    {diferenca >= 0 ? "+" : ""}
                                    {formatarMoeda(diferenca)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
