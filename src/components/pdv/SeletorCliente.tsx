import { formatarMoeda } from '@/lib/formatters';
import { useState } from 'react';
import { FiSearch, FiUser, FiX } from 'react-icons/fi';

interface Cliente {
  tipo: 'aluno' | 'funcionario';
  id: number;
  nome: string;
  curso?: string;
  serie?: string;
  turma?: string;
  cargo?: string;
  saldo?: number;
  precoRefeicao?: number;
  observacao?: string;
  fotoUrl?: string;
}

interface SeletorClienteProps {
  clienteSelecionado: Cliente | null;
  onClienteSelecionado: (cliente: Cliente | null) => void;
  // aceita opcionalmente um filtro de tipo: 'todos' | 'aluno' | 'funcionario'
  onBuscarClientes: (busca: string, tipo?: 'todos' | 'aluno' | 'funcionario') => Promise<Cliente[]>;
}

export default function SeletorCliente({
  clienteSelecionado,
  onClienteSelecionado,
  onBuscarClientes,
}: SeletorClienteProps) {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'aluno' | 'funcionario'>('todos');

  const handleBusca = async (valor: string) => {
    setBusca(valor);
    if (valor.length < 2) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }
    setBuscando(true);
    try {
      const clientes = await onBuscarClientes(valor, tipoFiltro);
      setResultados(clientes);
      setMostrarResultados(true);
    } catch (e) {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const selecionarCliente = (c: Cliente) => {
    onClienteSelecionado(c);
    setBusca('');
    setMostrarResultados(false);
    setResultados([]);
  };

  const limparSelecao = () => {
    onClienteSelecionado(null);
    setBusca('');
    setMostrarResultados(false);
    setResultados([]);
  };

  return (
    <div className='card shadow-sm'>
      <div className='card-header bg-white border-0 pb-0'>
        <h5 className='fw-semibold mb-0 d-flex align-items-center'>
          <FiUser className='me-2' /> Cliente
        </h5>
      </div>
      <div className='card-body pt-2'>
        {!clienteSelecionado ? (
          <div>
            <div className='position-relative mb-2'>
              <div className='d-flex mb-2 gap-2'>
                <select
                  value={tipoFiltro}
                  onChange={(e) => {
                    const v = e.target.value as 'todos' | 'aluno' | 'funcionario';
                    setTipoFiltro(v);
                    // se já existe uma busca válida, reexecuta
                    if (busca && busca.length >= 2) handleBusca(busca);
                  }}
                  className='form-select form-select-sm w-auto'
                >
                  <option value='todos'>Todos</option>
                  <option value='aluno'>Alunos</option>
                  <option value='funcionario'>Funcionários</option>
                </select>
                <div className='flex-grow-1'></div>
              </div>
              <FiSearch className='position-absolute top-50 translate-middle-y ms-2 text-muted' />
              <input
                type='text'
                value={busca}
                onChange={(e) => handleBusca(e.target.value)}
                placeholder='RA, nome (aluno/func) ou código do funcionário'
                className='form-control ps-5'
              />
              {buscando && (
                <div className='position-absolute top-50 end-0 translate-middle-y me-2 spinner-border spinner-border-sm text-primary'></div>
              )}
            </div>
            {mostrarResultados && (
              <div className='border rounded bg-white overflow-auto' style={{ maxHeight: 230 }}>
                {resultados.length === 0 ? (
                  <div className='text-center py-3 small text-muted'>Nenhum cliente encontrado</div>
                ) : (
                  resultados.map((cliente: Cliente) => (
                    <button
                      type='button'
                      key={`${cliente.tipo}-${cliente.id}`}
                      onClick={() => selecionarCliente(cliente)}
                      className='w-100 text-start px-3 py-2 border-bottom bg-white'
                      style={{ cursor: 'pointer' }}
                    >
                      <div className='d-flex align-items-center gap-2'>
                        {cliente.tipo === 'aluno' && cliente.fotoUrl ? (
                          <img
                            src={cliente.fotoUrl}
                            alt={cliente.nome}
                            className='rounded-circle object-cover'
                            style={{ width: 40, height: 40 }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className='rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white fw-semibold'
                            style={{ width: 40, height: 40 }}
                          >
                            {cliente.nome
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .substring(0, 2)}
                          </div>
                        )}
                        <div className='flex-grow-1'>
                          <div className='d-flex align-items-center justify-content-between'>
                            <div className='small fw-semibold text-truncate'>{cliente.nome}</div>
                            <div>
                              <span
                                className={`badge bg-${
                                  cliente.tipo === 'aluno' ? 'success' : 'primary'
                                } me-1`}
                                title={cliente.tipo === 'aluno' ? 'Aluno' : 'Funcionário'}
                              >
                                {cliente.tipo === 'aluno' ? 'Aluno' : 'Funcionário'}
                              </span>
                            </div>
                          </div>
                          <div className='text-muted small'>
                            {cliente.tipo === 'aluno'
                              ? `RA: ${cliente.id}${cliente.curso ? ` • ${cliente.curso}` : ''}`
                              : `Cód: ${cliente.id}${cliente.cargo ? ` • ${cliente.cargo}` : ''}`}
                          </div>
                          {cliente.tipo === 'aluno' && cliente.saldo !== undefined && (
                            <div
                              className={`small fw-semibold ${
                                cliente.saldo > 0 ? 'text-success' : 'text-danger'
                              }`}
                            >
                              Saldo: {formatarMoeda(cliente.saldo)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className='border rounded p-3 bg-primary bg-opacity-10 position-relative'>
            <button
              onClick={limparSelecao}
              type='button'
              className='btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2 rounded-circle'
              title='Remover cliente'
            >
              <FiX />
            </button>
            <div className='d-flex gap-3'>
              {clienteSelecionado.tipo === 'aluno' && clienteSelecionado.fotoUrl ? (
                <img
                  src={clienteSelecionado.fotoUrl}
                  alt={clienteSelecionado.nome}
                  className='rounded-circle object-cover'
                  style={{ width: 56, height: 56 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className='rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white fw-bold'
                  style={{ width: 56, height: 56 }}
                >
                  {clienteSelecionado.nome
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
              )}
              <div className='flex-grow-1'>
                <div className='fw-semibold'>{clienteSelecionado.nome}</div>
                <div className='d-flex align-items-center gap-2 mb-1'>
                  <span
                    className={`badge bg-${
                      clienteSelecionado.tipo === 'aluno' ? 'success' : 'primary'
                    }`}
                  >
                    {clienteSelecionado.tipo === 'aluno' ? 'Aluno' : 'Funcionário'}
                  </span>
                  <small className='text-muted'>
                    {clienteSelecionado.tipo === 'aluno'
                      ? `RA: ${clienteSelecionado.id}`
                      : `Código: ${clienteSelecionado.id}`}
                  </small>
                </div>
                {clienteSelecionado.tipo === 'aluno' && (
                  <>
                    {(clienteSelecionado.curso || clienteSelecionado.serie) && (
                      <div className='small text-muted'>
                        {[
                          clienteSelecionado.curso,
                          clienteSelecionado.serie,
                          clienteSelecionado.turma,
                        ]
                          .filter(Boolean)
                          .join(' - ')}
                      </div>
                    )}
                    {clienteSelecionado.saldo !== undefined && (
                      <div
                        className={`small fw-semibold ${
                          clienteSelecionado.saldo > 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        Saldo: {formatarMoeda(clienteSelecionado.saldo)}
                      </div>
                    )}
                    {clienteSelecionado.observacao && (
                      <div className='alert alert-warning py-1 px-2 mt-2 small mb-0'>
                        <strong>Obs:</strong> {clienteSelecionado.observacao}
                      </div>
                    )}
                    {/* Botão rápido para gerenciar restrições do aluno */}
                    <div className='mt-2'>
                      <a
                        href={`/dashboard/alunos/restricoes?ra=${clienteSelecionado.id}`}
                        className='btn btn-sm btn-outline-primary'
                        target='_self'
                      >
                        Gerenciar Restrições do Aluno
                      </a>
                    </div>
                  </>
                )}
                {clienteSelecionado.tipo === 'funcionario' && (
                  <>
                    {clienteSelecionado.cargo && (
                      <div className='small text-muted'>Cargo: {clienteSelecionado.cargo}</div>
                    )}
                    {clienteSelecionado.precoRefeicao !== undefined &&
                      clienteSelecionado.precoRefeicao > 0 && (
                        <div className='small text-primary fw-semibold'>
                          Preço refeição: {formatarMoeda(clienteSelecionado.precoRefeicao)}
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
