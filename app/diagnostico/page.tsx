"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";

type DiagnosticoResult = {
  success: boolean;
  error?: string;
  details?: string;
  missingViews?: string[];
  message?: string;
  views?: string[];
};

export default function DiagnosticoPage() {
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<DiagnosticoResult | null>(null);

  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch("/api/system/check-views");
        const data = await res.json();
        setResultado(data);
      } catch (error) {
        setResultado({
          success: false,
          error: "Erro ao conectar com o servidor",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        });
      } finally {
        setLoading(false);
      }
    }
    verificar();
  }, []);

  return (
    <MainLayout>
      <div className="container mt-4">
        <h1 className="mb-4">Diagnóstico do Sistema</h1>

        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Verificando...</span>
            </div>
          </div>
        )}

        {!loading && resultado && (
          <div className="card">
            <div className="card-body">
              {resultado.success ? (
                <div className="alert alert-success">
                  <h4 className="alert-heading">✅ Sistema OK</h4>
                  <p>{resultado.message}</p>
                  {resultado.views && resultado.views.length > 0 && (
                    <div className="mt-3">
                      <strong>Views verificadas:</strong>
                      <ul className="mb-0 mt-2">
                        {resultado.views.map((view) => (
                          <li key={view} className="text-success">
                            ✓ {view}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-danger">
                  <h4 className="alert-heading">❌ Problemas Encontrados</h4>
                  <p>
                    <strong>Erro:</strong> {resultado.error}
                  </p>

                  {resultado.details && (
                    <p>
                      <strong>Detalhes:</strong> {resultado.details}
                    </p>
                  )}

                  {resultado.missingViews &&
                    resultado.missingViews.length > 0 && (
                      <div className="mt-3">
                        <strong>Views não encontradas:</strong>
                        <ul className="mb-0 mt-2">
                          {resultado.missingViews.map((view) => (
                            <li key={view} className="text-danger">
                              ✗ {view}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {resultado.message && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <strong>Solução:</strong>
                      <p className="mb-0 mt-2">{resultado.message}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <h5>Informações do Ambiente</h5>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Next.js:</strong>
                      </td>
                      <td>15.5.3 (Turbopack)</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Database:</strong>
                      </td>
                      <td>MySQL</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Status da conexão:</strong>
                      </td>
                      <td>
                        {resultado.success ? (
                          <span className="badge bg-success">Conectado</span>
                        ) : (
                          <span className="badge bg-danger">
                            Erro de conexão
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <h5>Comandos para correção</h5>
                <div className="bg-dark text-light p-3 rounded">
                  <code>
                    # Execute o script SQL no MySQL:
                    <br />
                    mysql -u root -p sant31br &lt; bancodados.sql
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
