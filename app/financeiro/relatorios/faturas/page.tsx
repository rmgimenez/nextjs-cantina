'use client';

import MainLayout from '@/components/MainLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Funcionario {
  codigo: number;
  nome: string;
  cargo: string;
}

export default function RelatorioFaturasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);

  const [mesInicio, setMesInicio] = useState('');
  const [mesFim, setMesFim] = useState('');
  const [codigoFuncionario, setCodigoFuncionario] = useState('');
  const [status, setStatus] = useState('');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [buscaFuncionario, setBuscaFuncionario] = useState('');

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (buscaFuncionario.length >= 3) {
        buscarFuncionarios();
      } else {
        setFuncionarios([]);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaFuncionario]);

  async function buscarFuncionarios() {
    try {
      const res = await fetch(`/api/funcionarios/busca?q=${buscaFuncionario}`);
      if (res.ok) {
        const data = await res.json();
        setFuncionarios(data);
      }
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    }
  }

  function selecionarFuncionario(func: Funcionario) {
    setCodigoFuncionario(func.codigo.toString());
    setBuscaFuncionario(`${func.nome} - ${func.cargo}`);
    setFuncionarios([]);
  }

  function limparFuncionario() {
    setCodigoFuncionario('');
    setBuscaFuncionario('');
  }

  async function gerarPDF() {
    if (!mesInicio && !mesFim && !codigoFuncionario) {
      alert('Selecione pelo menos um filtro para gerar o relatório');
      return;
    }

    setGerando(true);

    try {
      const params = new URLSearchParams();
      if (mesInicio) params.append('mesInicio', mesInicio);
      if (mesFim) params.append('mesFim', mesFim);
      if (codigoFuncionario) params.append('codigoFuncionario', codigoFuncionario);
      if (status) params.append('status', status);

      const res = await fetch(`/api/relatorios/faturas/pdf?${params.toString()}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao gerar relatório');
      }

      // Download do PDF
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-faturas-${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar relatório PDF';
      alert(errorMessage);
    } finally {
      setGerando(false);
    }
  }

  if (loading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ minHeight: '100vh' }}
      >
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className='container-fluid py-4'>
        <div className='row mb-4'>
          <div className='col'>
            <h2 className='text-primary'>
              <i className='bi bi-file-earmark-pdf me-2'></i>
              Relatório de Faturas para Departamento Pessoal
            </h2>
            <p className='text-muted'>
              Gere relatórios em PDF com as faturas dos funcionários para desconto em folha de
              pagamento
            </p>
          </div>
        </div>

        {/* Card de Filtros */}
        <div className='card shadow-sm mb-4'>
          <div className='card-header bg-primary text-white'>
            <h5 className='mb-0'>
              <i className='bi bi-funnel me-2'></i>
              Filtros do Relatório
            </h5>
          </div>
          <div className='card-body'>
            <div className='row g-3'>
              {/* Período */}
              <div className='col-md-6'>
                <label className='form-label fw-bold'>Mês Início</label>
                <input
                  type='month'
                  className='form-control'
                  value={mesInicio}
                  onChange={(e) => setMesInicio(e.target.value)}
                />
                <small className='text-muted'>Deixe em branco para sem limite inicial</small>
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-bold'>Mês Fim</label>
                <input
                  type='month'
                  className='form-control'
                  value={mesFim}
                  onChange={(e) => setMesFim(e.target.value)}
                />
                <small className='text-muted'>Deixe em branco para sem limite final</small>
              </div>

              {/* Funcionário */}
              <div className='col-md-8'>
                <label className='form-label fw-bold'>Funcionário (opcional)</label>
                <div className='position-relative'>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Digite o nome do funcionário (mínimo 3 caracteres)'
                    value={buscaFuncionario}
                    onChange={(e) => setBuscaFuncionario(e.target.value)}
                    disabled={!!codigoFuncionario}
                  />
                  {codigoFuncionario && (
                    <button
                      className='btn btn-sm btn-outline-danger position-absolute top-50 end-0 translate-middle-y me-2'
                      onClick={limparFuncionario}
                    >
                      <i className='bi bi-x-circle'></i>
                    </button>
                  )}
                  {funcionarios.length > 0 && (
                    <div
                      className='list-group position-absolute w-100 mt-1'
                      style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {funcionarios.map((func) => (
                        <button
                          key={func.codigo}
                          className='list-group-item list-group-item-action'
                          onClick={() => selecionarFuncionario(func)}
                        >
                          <div className='fw-bold'>{func.nome}</div>
                          <small className='text-muted'>{func.cargo}</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <small className='text-muted'>
                  Deixe em branco para incluir todos os funcionários
                </small>
              </div>

              {/* Status */}
              <div className='col-md-4'>
                <label className='form-label fw-bold'>Status (opcional)</label>
                <select
                  className='form-select'
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value=''>Todos os status</option>
                  <option value='GERADA'>Gerada</option>
                  <option value='ENVIADA'>Enviada</option>
                  <option value='PAGA'>Paga</option>
                  <option value='VENCIDA'>Vencida</option>
                  <option value='PARCIAL'>Paga Parcialmente</option>
                </select>
              </div>
            </div>

            {/* Botão de Gerar */}
            <div className='row mt-4'>
              <div className='col-12'>
                <button
                  className='btn btn-primary btn-lg w-100'
                  onClick={gerarPDF}
                  disabled={gerando}
                >
                  {gerando ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <i className='bi bi-file-earmark-pdf me-2'></i>
                      Gerar Relatório PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Informações */}
        <div className='card shadow-sm border-info'>
          <div className='card-header bg-info text-white'>
            <h5 className='mb-0'>
              <i className='bi bi-info-circle me-2'></i>
              Informações do Relatório
            </h5>
          </div>
          <div className='card-body'>
            <h6 className='fw-bold'>O relatório em PDF contém:</h6>
            <ul className='mb-3'>
              <li>Lista completa de faturas agrupadas por funcionário</li>
              <li>
                Detalhes de cada fatura: mês de referência, valor total, quantidade de itens, status
                e vencimento
              </li>
              <li>Subtotal por funcionário</li>
              <li>Total geral de todas as faturas</li>
              <li>Informações do funcionário (nome e cargo)</li>
              <li>Data de emissão do relatório</li>
            </ul>

            <h6 className='fw-bold mt-4'>Finalidade:</h6>
            <p className='mb-0'>
              Este relatório deve ser enviado ao <strong>Departamento Pessoal</strong> para efetuar
              os descontos na folha de pagamento dos funcionários conforme os valores consumidos na
              cantina.
            </p>
          </div>
        </div>

        {/* Card de Exemplos */}
        <div className='card shadow-sm border-warning mt-3'>
          <div className='card-header bg-warning'>
            <h5 className='mb-0'>
              <i className='bi bi-lightbulb me-2'></i>
              Exemplos de Uso
            </h5>
          </div>
          <div className='card-body'>
            <div className='row'>
              <div className='col-md-4'>
                <div className='border rounded p-3 h-100'>
                  <h6 className='fw-bold text-primary'>Relatório Mensal</h6>
                  <p className='small mb-0'>
                    <strong>Mês Início:</strong> 2025-01
                    <br />
                    <strong>Mês Fim:</strong> 2025-01
                    <br />
                    <strong>Funcionário:</strong> (vazio)
                    <br />
                    <strong>Status:</strong> Todos
                  </p>
                  <small className='text-muted mt-2 d-block'>
                    Gera relatório de todos os funcionários para um mês específico
                  </small>
                </div>
              </div>

              <div className='col-md-4'>
                <div className='border rounded p-3 h-100'>
                  <h6 className='fw-bold text-primary'>Relatório Individual</h6>
                  <p className='small mb-0'>
                    <strong>Mês Início:</strong> (vazio)
                    <br />
                    <strong>Mês Fim:</strong> (vazio)
                    <br />
                    <strong>Funcionário:</strong> João Silva
                    <br />
                    <strong>Status:</strong> Todos
                  </p>
                  <small className='text-muted mt-2 d-block'>
                    Gera relatório de um funcionário específico para todos os meses
                  </small>
                </div>
              </div>

              <div className='col-md-4'>
                <div className='border rounded p-3 h-100'>
                  <h6 className='fw-bold text-primary'>Faturas Pendentes</h6>
                  <p className='small mb-0'>
                    <strong>Mês Início:</strong> (vazio)
                    <br />
                    <strong>Mês Fim:</strong> (vazio)
                    <br />
                    <strong>Funcionário:</strong> (vazio)
                    <br />
                    <strong>Status:</strong> Gerada/Enviada
                  </p>
                  <small className='text-muted mt-2 d-block'>
                    Gera relatório de todas as faturas ainda não pagas
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
