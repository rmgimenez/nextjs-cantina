'use client';

import MainLayout from '@/components/MainLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Pacote {
  id: number;
  nome: string;
  tipo_refeicao: string;
  descricao: string;
  quantidade_refeicoes: number;
  validade_dias: number | null;
  valor: number;
  ativo: number;
  dt_inicio_vigencia: string | null;
  dt_fim_vigencia: string | null;
  dt_criacao: string;
}

interface Aluno {
  ra: number;
  nome: string;
  turma: string;
  serie: number;
  curso_nome: string;
}

interface PacoteAluno {
  id: number;
  id_pacote: number;
  ra_aluno: number;
  quantidade_total: number;
  quantidade_utilizada: number;
  quantidade_restante: number;
  data_inicio: string;
  data_fim: string | null;
  ativo: number;
  pacote_nome: string;
  tipo_refeicao: string;
  aluno_nome: string;
}

const TIPOS_REFEICAO = [
  { value: 'LANCHE_MANHA', label: 'Lanche da Manhã' },
  { value: 'ALMOCO', label: 'Almoço' },
  { value: 'LANCHE_TARDE', label: 'Lanche da Tarde' },
  { value: 'JANTAR', label: 'Jantar' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
];

export default function PacotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [pacotesAlunos, setPacotesAlunos] = useState<PacoteAluno[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showContratarModal, setShowContratarModal] = useState(false);
  const [editingPacote, setEditingPacote] = useState<Pacote | null>(null);
  const [searchRA, setSearchRA] = useState('');
  const [searchTipo, setSearchTipo] = useState<'ra' | 'nome'>('ra');
  const [resultadosBusca, setResultadosBusca] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [pacoteSelecionado, setPacoteSelecionado] = useState<number | null>(null);
  const [quantidadeTotal, setQuantidadeTotal] = useState(1);
  const [dataInicio, setDataInicio] = useState('');
  const [activeTab, setActiveTab] = useState<'pacotes' | 'contratos'>('pacotes');

  const [formData, setFormData] = useState({
    nome: '',
    tipo_refeicao: 'ALMOCO',
    descricao: '',
    quantidade_refeicoes: 1,
    validade_dias: 30,
    valor: 0,
    ativo: 1,
    dt_inicio_vigencia: '',
    dt_fim_vigencia: '',
  });

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/login');
      } else {
        setLoading(false);
        carregarPacotes();
        carregarPacotesAlunos();
      }
    }
    checkAuth();
  }, [router]);

  async function carregarPacotes() {
    try {
      const res = await fetch('/api/pacotes');
      const data = await res.json();
      if (data.success) {
        setPacotes(data.pacotes);
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    }
  }

  async function carregarPacotesAlunos() {
    try {
      const res = await fetch('/api/alunos/pacotes/todos');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPacotesAlunos(data.pacotes);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes de alunos:', error);
    }
  }

  async function buscarAluno() {
    if (!searchRA) {
      alert(searchTipo === 'ra' ? 'Digite um RA para buscar' : 'Digite um nome para buscar');
      return;
    }

    try {
      const res = await fetch(`/api/alunos/busca?q=${encodeURIComponent(searchRA)}`);
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        setResultadosBusca(data.data);
        // Se for busca por RA e encontrou apenas 1, seleciona automaticamente
        if (searchTipo === 'ra' && data.data.length === 1) {
          setAlunoSelecionado(data.data[0]);
          setResultadosBusca([]);
        }
      } else {
        alert('Nenhum aluno encontrado');
        setResultadosBusca([]);
        setAlunoSelecionado(null);
      }
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      alert('Erro ao buscar aluno');
    }
  }

  function selecionarAlunoDaLista(aluno: Aluno) {
    setAlunoSelecionado(aluno);
    setResultadosBusca([]);
    setSearchRA('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingPacote ? `/api/pacotes/${editingPacote.id}` : '/api/pacotes';
      const method = editingPacote ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingPacote ? 'Pacote atualizado com sucesso!' : 'Pacote criado com sucesso!');
        setShowModal(false);
        resetForm();
        carregarPacotes();
      } else {
        alert(data.error || 'Erro ao salvar pacote');
      }
    } catch (error) {
      console.error('Erro ao salvar pacote:', error);
      alert('Erro ao salvar pacote');
    }
  }

  async function handleContratar(e: React.FormEvent) {
    e.preventDefault();

    if (!alunoSelecionado || !pacoteSelecionado) {
      alert('Selecione um aluno e um pacote');
      return;
    }

    try {
      const res = await fetch(`/api/alunos/pacotes/${alunoSelecionado.ra}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pacote: pacoteSelecionado,
          quantidade_total: quantidadeTotal,
          data_inicio: dataInicio,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Pacote contratado com sucesso!');
        setShowContratarModal(false);
        resetContratarForm();
        carregarPacotesAlunos();
      } else {
        alert(data.error || 'Erro ao contratar pacote');
      }
    } catch (error) {
      console.error('Erro ao contratar pacote:', error);
      alert('Erro ao contratar pacote');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este pacote?')) {
      return;
    }

    try {
      const res = await fetch(`/api/pacotes/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('Pacote excluído com sucesso!');
        carregarPacotes();
      } else {
        alert(data.error || 'Erro ao excluir pacote');
      }
    } catch (error) {
      console.error('Erro ao excluir pacote:', error);
      alert('Erro ao excluir pacote');
    }
  }

  async function handleCancelarPacoteAluno(id: number, raAluno: number) {
    if (!confirm('Tem certeza que deseja cancelar este pacote do aluno?')) {
      return;
    }

    try {
      const res = await fetch(`/api/alunos/pacotes/${raAluno}/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('Pacote cancelado com sucesso!');
        carregarPacotesAlunos();
      } else {
        alert(data.error || 'Erro ao cancelar pacote');
      }
    } catch (error) {
      console.error('Erro ao cancelar pacote:', error);
      alert('Erro ao cancelar pacote');
    }
  }

  function openEditModal(pacote: Pacote) {
    setEditingPacote(pacote);
    setFormData({
      nome: pacote.nome,
      tipo_refeicao: pacote.tipo_refeicao,
      descricao: pacote.descricao || '',
      quantidade_refeicoes: pacote.quantidade_refeicoes,
      validade_dias: pacote.validade_dias || 30,
      valor: pacote.valor,
      ativo: pacote.ativo,
      dt_inicio_vigencia: pacote.dt_inicio_vigencia || '',
      dt_fim_vigencia: pacote.dt_fim_vigencia || '',
    });
    setShowModal(true);
  }

  function resetForm() {
    setEditingPacote(null);
    setFormData({
      nome: '',
      tipo_refeicao: 'ALMOCO',
      descricao: '',
      quantidade_refeicoes: 1,
      validade_dias: 30,
      valor: 0,
      ativo: 1,
      dt_inicio_vigencia: '',
      dt_fim_vigencia: '',
    });
  }

  function resetContratarForm() {
    setSearchRA('');
    setSearchTipo('ra');
    setResultadosBusca([]);
    setAlunoSelecionado(null);
    setPacoteSelecionado(null);
    setQuantidadeTotal(1);
    setDataInicio('');
  }

  function formatarTipoRefeicao(tipo: string): string {
    const encontrado = TIPOS_REFEICAO.find((t) => t.value === tipo);
    return encontrado ? encontrado.label : tipo;
  }

  function formatarData(data: string | null): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  function formatarValor(valor: number | string): string {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  if (loading) {
    return (
      <MainLayout>
        <div
          className='d-flex justify-content-center align-items-center'
          style={{ minHeight: '400px' }}
        >
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className='container-fluid py-4'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h2 className='text-primary'>
            <i className='bi bi-box-seam me-2'></i>
            Pacotes de Alimentação
          </h2>
          <div>
            <button
              className='btn btn-success me-2'
              onClick={() => {
                resetContratarForm();
                setShowContratarModal(true);
              }}
            >
              <i className='bi bi-person-plus me-2'></i>
              Contratar Pacote
            </button>
            <button
              className='btn btn-primary'
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <i className='bi bi-plus-circle me-2'></i>
              Novo Pacote
            </button>
          </div>
        </div>

        {/* Tabs */}
        <ul className='nav nav-tabs mb-4'>
          <li className='nav-item'>
            <button
              className={`nav-link ${activeTab === 'pacotes' ? 'active' : ''}`}
              onClick={() => setActiveTab('pacotes')}
            >
              <i className='bi bi-box-seam me-2'></i>
              Tipos de Pacotes
            </button>
          </li>
          <li className='nav-item'>
            <button
              className={`nav-link ${activeTab === 'contratos' ? 'active' : ''}`}
              onClick={() => setActiveTab('contratos')}
            >
              <i className='bi bi-people me-2'></i>
              Pacotes Contratados
            </button>
          </li>
        </ul>

        {/* Tab: Tipos de Pacotes */}
        {activeTab === 'pacotes' && (
          <div className='card'>
            <div className='card-body'>
              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Tipo Refeição</th>
                      <th>Qtd. Refeições</th>
                      <th>Validade (dias)</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacotes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className='text-center text-muted'>
                          Nenhum pacote cadastrado
                        </td>
                      </tr>
                    ) : (
                      pacotes.map((pacote) => (
                        <tr key={pacote.id}>
                          <td>{pacote.id}</td>
                          <td>{pacote.nome}</td>
                          <td>
                            <span className='badge bg-info'>
                              {formatarTipoRefeicao(pacote.tipo_refeicao)}
                            </span>
                          </td>
                          <td>{pacote.quantidade_refeicoes}</td>
                          <td>{pacote.validade_dias || '-'}</td>
                          <td>R$ {formatarValor(pacote.valor)}</td>
                          <td>
                            <span
                              className={`badge ${pacote.ativo ? 'bg-success' : 'bg-secondary'}`}
                            >
                              {pacote.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td>
                            <button
                              className='btn btn-sm btn-outline-primary me-2'
                              onClick={() => openEditModal(pacote)}
                              title='Editar pacote'
                            >
                              <i className='bi bi-pencil'></i>
                            </button>
                            <button
                              className='btn btn-sm btn-outline-danger'
                              onClick={() => handleDelete(pacote.id)}
                              title='Excluir pacote'
                            >
                              <i className='bi bi-trash'></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Pacotes Contratados */}
        {activeTab === 'contratos' && (
          <div className='card'>
            <div className='card-body'>
              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Aluno</th>
                      <th>RA</th>
                      <th>Pacote</th>
                      <th>Tipo</th>
                      <th>Utilizado</th>
                      <th>Restante</th>
                      <th>Data Início</th>
                      <th>Data Fim</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacotesAlunos.length === 0 ? (
                      <tr>
                        <td colSpan={11} className='text-center text-muted'>
                          Nenhum pacote contratado
                        </td>
                      </tr>
                    ) : (
                      pacotesAlunos.map((pa) => (
                        <tr key={pa.id}>
                          <td>{pa.id}</td>
                          <td>{pa.aluno_nome}</td>
                          <td>{pa.ra_aluno}</td>
                          <td>{pa.pacote_nome}</td>
                          <td>
                            <span className='badge bg-info'>
                              {formatarTipoRefeicao(pa.tipo_refeicao)}
                            </span>
                          </td>
                          <td>
                            <span className='badge bg-warning'>
                              {pa.quantidade_utilizada}/{pa.quantidade_total}
                            </span>
                          </td>
                          <td>
                            <span className='badge bg-primary'>{pa.quantidade_restante}</span>
                          </td>
                          <td>{formatarData(pa.data_inicio)}</td>
                          <td>{formatarData(pa.data_fim)}</td>
                          <td>
                            <span className={`badge ${pa.ativo ? 'bg-success' : 'bg-secondary'}`}>
                              {pa.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td>
                            {pa.ativo && (
                              <button
                                className='btn btn-sm btn-outline-danger'
                                onClick={() => handleCancelarPacoteAluno(pa.id, pa.ra_aluno)}
                                title='Cancelar pacote'
                              >
                                <i className='bi bi-x-circle'></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Criar/Editar Pacote */}
        {showModal && (
          <div
            className='modal show d-block'
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className='modal-dialog modal-lg'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>{editingPacote ? 'Editar Pacote' : 'Novo Pacote'}</h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className='modal-body'>
                    <div className='row'>
                      <div className='col-md-8 mb-3'>
                        <label className='form-label'>Nome do Pacote *</label>
                        <input
                          type='text'
                          className='form-control'
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className='col-md-4 mb-3'>
                        <label className='form-label'>Status *</label>
                        <select
                          className='form-select'
                          value={formData.ativo}
                          onChange={(e) =>
                            setFormData({ ...formData, ativo: Number(e.target.value) })
                          }
                        >
                          <option value={1}>Ativo</option>
                          <option value={0}>Inativo</option>
                        </select>
                      </div>
                    </div>

                    <div className='row'>
                      <div className='col-md-6 mb-3'>
                        <label className='form-label'>Tipo de Refeição *</label>
                        <select
                          className='form-select'
                          value={formData.tipo_refeicao}
                          onChange={(e) =>
                            setFormData({ ...formData, tipo_refeicao: e.target.value })
                          }
                          required
                        >
                          {TIPOS_REFEICAO.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className='col-md-3 mb-3'>
                        <label className='form-label'>Qtd. Refeições *</label>
                        <input
                          type='number'
                          className='form-control'
                          value={formData.quantidade_refeicoes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantidade_refeicoes: Number(e.target.value),
                            })
                          }
                          min={1}
                          required
                        />
                      </div>
                      <div className='col-md-3 mb-3'>
                        <label className='form-label'>Validade (dias)</label>
                        <input
                          type='number'
                          className='form-control'
                          value={formData.validade_dias || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, validade_dias: Number(e.target.value) || 0 })
                          }
                          min={1}
                        />
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label className='form-label'>Descrição</label>
                      <textarea
                        className='form-control'
                        rows={3}
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      ></textarea>
                    </div>

                    <div className='row'>
                      <div className='col-md-4 mb-3'>
                        <label className='form-label'>Valor (R$) *</label>
                        <input
                          type='number'
                          className='form-control'
                          value={formData.valor}
                          onChange={(e) =>
                            setFormData({ ...formData, valor: Number(e.target.value) })
                          }
                          min={0}
                          step='0.01'
                          required
                        />
                      </div>
                      <div className='col-md-4 mb-3'>
                        <label className='form-label'>Início Vigência</label>
                        <input
                          type='date'
                          className='form-control'
                          value={formData.dt_inicio_vigencia}
                          onChange={(e) =>
                            setFormData({ ...formData, dt_inicio_vigencia: e.target.value })
                          }
                        />
                      </div>
                      <div className='col-md-4 mb-3'>
                        <label className='form-label'>Fim Vigência</label>
                        <input
                          type='date'
                          className='form-control'
                          value={formData.dt_fim_vigencia}
                          onChange={(e) =>
                            setFormData({ ...formData, dt_fim_vigencia: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary'
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </button>
                    <button type='submit' className='btn btn-primary'>
                      {editingPacote ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Contratar Pacote */}
        {showContratarModal && (
          <div
            className='modal show d-block'
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className='modal-dialog modal-lg'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>Contratar Pacote para Aluno</h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => {
                      setShowContratarModal(false);
                      resetContratarForm();
                    }}
                  ></button>
                </div>
                <form onSubmit={handleContratar}>
                  <div className='modal-body'>
                    {/* Buscar Aluno */}
                    <div className='card mb-3'>
                      <div className='card-body'>
                        <h6 className='card-title'>1. Buscar Aluno</h6>

                        {/* Seletor de tipo de busca */}
                        <div className='mb-3'>
                          <label className='form-label'>Buscar por:</label>
                          <div className='btn-group w-100' role='group'>
                            <button
                              type='button'
                              className={`btn ${
                                searchTipo === 'ra' ? 'btn-primary' : 'btn-outline-primary'
                              }`}
                              onClick={() => {
                                setSearchTipo('ra');
                                setSearchRA('');
                                setResultadosBusca([]);
                              }}
                            >
                              <i className='bi bi-hash me-2'></i>
                              RA
                            </button>
                            <button
                              type='button'
                              className={`btn ${
                                searchTipo === 'nome' ? 'btn-primary' : 'btn-outline-primary'
                              }`}
                              onClick={() => {
                                setSearchTipo('nome');
                                setSearchRA('');
                                setResultadosBusca([]);
                              }}
                            >
                              <i className='bi bi-person me-2'></i>
                              Nome
                            </button>
                          </div>
                        </div>

                        {/* Campo de busca */}
                        <div className='input-group mb-3'>
                          <input
                            type='text'
                            className='form-control'
                            placeholder={
                              searchTipo === 'ra'
                                ? 'Digite o RA do aluno'
                                : 'Digite o nome do aluno'
                            }
                            value={searchRA}
                            onChange={(e) => setSearchRA(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                buscarAluno();
                              }
                            }}
                          />
                          <button type='button' className='btn btn-primary' onClick={buscarAluno}>
                            <i className='bi bi-search me-2'></i>
                            Buscar
                          </button>
                        </div>

                        {/* Lista de resultados */}
                        {resultadosBusca.length > 0 && (
                          <div className='list-group mb-3'>
                            <div className='list-group-item active'>
                              <strong>Selecione um aluno:</strong>
                            </div>
                            {resultadosBusca.map((aluno) => (
                              <button
                                key={aluno.ra}
                                type='button'
                                className='list-group-item list-group-item-action'
                                onClick={() => selecionarAlunoDaLista(aluno)}
                              >
                                <div className='d-flex w-100 justify-content-between'>
                                  <h6 className='mb-1'>{aluno.nome}</h6>
                                  <small className='text-muted'>RA: {aluno.ra}</small>
                                </div>
                                <small className='text-muted'>
                                  Turma: {aluno.turma} | Série: {aluno.serie}º | Curso:{' '}
                                  {aluno.curso_nome}
                                </small>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Aluno selecionado */}
                        {alunoSelecionado && (
                          <div className='alert alert-success mb-0'>
                            <div className='d-flex justify-content-between align-items-start'>
                              <div>
                                <strong>{alunoSelecionado.nome}</strong>
                                <br />
                                <small>
                                  RA: {alunoSelecionado.ra} | Turma: {alunoSelecionado.turma} |
                                  Série: {alunoSelecionado.serie}º | Curso:{' '}
                                  {alunoSelecionado.curso_nome}
                                </small>
                              </div>
                              <button
                                type='button'
                                className='btn btn-sm btn-outline-danger'
                                onClick={() => {
                                  setAlunoSelecionado(null);
                                  setSearchRA('');
                                }}
                              >
                                <i className='bi bi-x'></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selecionar Pacote */}
                    {alunoSelecionado && (
                      <>
                        <div className='card mb-3'>
                          <div className='card-body'>
                            <h6 className='card-title'>2. Selecionar Pacote</h6>
                            <select
                              className='form-select'
                              value={pacoteSelecionado || ''}
                              onChange={(e) => setPacoteSelecionado(Number(e.target.value))}
                              required
                            >
                              <option value=''>Selecione um pacote</option>
                              {pacotes
                                .filter((p) => p.ativo === 1)
                                .map((pacote) => (
                                  <option key={pacote.id} value={pacote.id}>
                                    {pacote.nome} - {formatarTipoRefeicao(pacote.tipo_refeicao)} -
                                    R$ {formatarValor(pacote.valor)} ({pacote.quantidade_refeicoes}{' '}
                                    refeições)
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div className='card mb-3'>
                          <div className='card-body'>
                            <h6 className='card-title'>3. Configurar Contratação</h6>
                            <div className='row'>
                              <div className='col-md-6 mb-3'>
                                <label className='form-label'>Quantidade *</label>
                                <input
                                  type='number'
                                  className='form-control'
                                  value={quantidadeTotal}
                                  onChange={(e) => setQuantidadeTotal(Number(e.target.value))}
                                  min={1}
                                  required
                                />
                                <small className='text-muted'>
                                  Número de vezes que o aluno pode usar o pacote
                                </small>
                              </div>
                              <div className='col-md-6 mb-3'>
                                <label className='form-label'>Data de Início *</label>
                                <input
                                  type='date'
                                  className='form-control'
                                  value={dataInicio}
                                  onChange={(e) => setDataInicio(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary'
                      onClick={() => {
                        setShowContratarModal(false);
                        resetContratarForm();
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type='submit'
                      className='btn btn-success'
                      disabled={!alunoSelecionado || !pacoteSelecionado}
                    >
                      <i className='bi bi-check-circle me-2'></i>
                      Contratar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
