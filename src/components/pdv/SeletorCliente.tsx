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
  onBuscarClientes: (busca: string) => Promise<Cliente[]>;
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

  const handleBusca = async (valor: string) => {
    setBusca(valor);

    if (valor.length < 2) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    setBuscando(true);
    try {
      const clientes = await onBuscarClientes(valor);
      setResultados(clientes);
      setMostrarResultados(true);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const selecionarCliente = (cliente: Cliente) => {
    onClienteSelecionado(cliente);
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
    <div className='bg-white border rounded-lg p-4'>
      <h3 className='font-semibold text-lg mb-4 flex items-center'>
        <FiUser className='mr-2' />
        Cliente
      </h3>

      {!clienteSelecionado ? (
        <div className='space-y-4'>
          <div className='relative'>
            <input
              type='text'
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder='RA do aluno, nome ou código do funcionário...'
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            {buscando && (
              <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
              </div>
            )}
          </div>

          {mostrarResultados && (
            <div className='border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto'>
              {resultados.length === 0 ? (
                <div className='p-4 text-center text-gray-500'>Nenhum cliente encontrado</div>
              ) : (
                resultados.map((cliente) => (
                  <div
                    key={`${cliente.tipo}-${cliente.id}`}
                    onClick={() => selecionarCliente(cliente)}
                    className='p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                  >
                    <div className='flex items-center space-x-3'>
                      {cliente.tipo === 'aluno' && cliente.fotoUrl ? (
                        <img
                          src={cliente.fotoUrl}
                          alt={cliente.nome}
                          className='w-10 h-10 rounded-full object-cover'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
                          <span className='text-white font-semibold text-sm'>
                            {cliente.nome
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)}
                          </span>
                        </div>
                      )}

                      <div className='flex-1'>
                        <p className='font-medium text-gray-900'>{cliente.nome}</p>
                        <p className='text-sm text-gray-600'>
                          {cliente.tipo === 'aluno'
                            ? `Aluno - RA: ${cliente.id}${
                                cliente.curso ? ` - ${cliente.curso}` : ''
                              }`
                            : `Funcionário - Código: ${cliente.id}${
                                cliente.cargo ? ` - ${cliente.cargo}` : ''
                              }`}
                        </p>
                        {cliente.tipo === 'aluno' && cliente.saldo !== undefined && (
                          <p
                            className={`text-sm font-medium ${
                              cliente.saldo > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            Saldo: R$ {cliente.saldo.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center space-x-3 flex-1'>
              {clienteSelecionado.tipo === 'aluno' && clienteSelecionado.fotoUrl ? (
                <img
                  src={clienteSelecionado.fotoUrl}
                  alt={clienteSelecionado.nome}
                  className='w-12 h-12 rounded-full object-cover'
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-white font-bold'>
                    {clienteSelecionado.nome
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </span>
                </div>
              )}

              <div className='flex-1'>
                <p className='font-semibold text-gray-900'>{clienteSelecionado.nome}</p>
                <p className='text-sm text-gray-600'>
                  {clienteSelecionado.tipo === 'aluno'
                    ? `Aluno - RA: ${clienteSelecionado.id}`
                    : `Funcionário - Código: ${clienteSelecionado.id}`}
                </p>

                {clienteSelecionado.tipo === 'aluno' && (
                  <>
                    {(clienteSelecionado.curso || clienteSelecionado.serie) && (
                      <p className='text-sm text-gray-600'>
                        {[
                          clienteSelecionado.curso,
                          clienteSelecionado.serie,
                          clienteSelecionado.turma,
                        ]
                          .filter(Boolean)
                          .join(' - ')}
                      </p>
                    )}
                    {clienteSelecionado.saldo !== undefined && (
                      <p
                        className={`text-sm font-semibold ${
                          clienteSelecionado.saldo > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        Saldo: R$ {clienteSelecionado.saldo.toFixed(2)}
                      </p>
                    )}
                    {clienteSelecionado.observacao && (
                      <div className='mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm'>
                        <strong>Observação:</strong> {clienteSelecionado.observacao}
                      </div>
                    )}
                  </>
                )}

                {clienteSelecionado.tipo === 'funcionario' && (
                  <>
                    {clienteSelecionado.cargo && (
                      <p className='text-sm text-gray-600'>Cargo: {clienteSelecionado.cargo}</p>
                    )}
                    {clienteSelecionado.precoRefeicao !== undefined &&
                      clienteSelecionado.precoRefeicao > 0 && (
                        <p className='text-sm text-blue-600 font-medium'>
                          Preço refeição: R$ {clienteSelecionado.precoRefeicao.toFixed(2)}
                        </p>
                      )}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={limparSelecao}
              className='ml-2 p-1 hover:bg-blue-100 rounded-full transition-colors'
              title='Remover cliente'
            >
              <FiX className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
