import { useState } from 'react';
import { FiClock, FiLock, FiUnlock, FiUser } from 'react-icons/fi';

interface StatusCaixa {
  caixaAberto: boolean;
  caixa: {
    id: number;
    dataAbertura: string;
    valorInicial: number;
    totalVendas: number;
    totalSangrias: number;
    totalReforcos: number;
    valorCalculado: number;
    usuarioAbertura: string;
  } | null;
}

interface ControleCaixaProps {
  status: StatusCaixa;
  onAtualizarStatus: () => void;
  loading?: boolean;
}

export default function ControleCaixa({ status, onAtualizarStatus, loading }: ControleCaixaProps) {
  const [valorInicial, setValorInicial] = useState('0,00');
  const [valorFechamento, setValorFechamento] = useState('');
  const [processando, setProcessando] = useState(false);
  const [mostrarModalFechamento, setMostrarModalFechamento] = useState(false);

  const formatarMoeda = (valor: string) => {
    const numero = valor.replace(/\D/g, '');
    const numeroFormatado = (parseInt(numero) / 100).toFixed(2);
    return numeroFormatado.replace('.', ',');
  };

  const parseValor = (valor: string) => {
    return parseFloat(valor.replace(',', '.')) || 0;
  };

  const handleAbrirCaixa = async () => {
    const valor = parseValor(valorInicial);
    if (valor < 0) {
      alert('Valor inicial não pode ser negativo');
      return;
    }

    setProcessando(true);
    try {
      const response = await fetch('/api/pdv/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'abrir', valorInicial: valor }),
      });

      const data = await response.json();

      if (data.ok) {
        alert(data.message);
        onAtualizarStatus();
        setValorInicial('0,00');
      } else {
        alert(data.error || 'Erro ao abrir caixa');
      }
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setProcessando(false);
    }
  };

  const handleFecharCaixa = async () => {
    const valor = parseValor(valorFechamento);
    if (valor < 0) {
      alert('Valor de fechamento não pode ser negativo');
      return;
    }

    if (!confirm('Tem certeza que deseja fechar o caixa? Esta ação não pode ser desfeita.')) {
      return;
    }

    setProcessando(true);
    try {
      const response = await fetch('/api/pdv/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'fechar', valorFechamento: valor }),
      });

      const data = await response.json();

      if (data.ok) {
        alert(
          `${data.message}\n\nValor calculado: R$ ${data.valorCalculado.toFixed(
            2
          )}\nValor informado: R$ ${data.valorInformado.toFixed(
            2
          )}\nDiferença: R$ ${data.diferenca.toFixed(2)}`
        );
        onAtualizarStatus();
        setMostrarModalFechamento(false);
        setValorFechamento('');
      } else {
        alert(data.error || 'Erro ao fechar caixa');
      }
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <div className='bg-white border rounded-lg p-4'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-200 rounded w-1/3'></div>
          <div className='h-20 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='bg-white border rounded-lg p-4'>
        <h3 className='font-semibold text-lg mb-4 flex items-center'>
          {status.caixaAberto ? (
            <FiUnlock className='mr-2 text-green-600' />
          ) : (
            <FiLock className='mr-2 text-red-600' />
          )}
          Status do Caixa
        </h3>

        {!status.caixaAberto ? (
          <div className='space-y-4'>
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
              <FiLock className='mx-auto mb-2 text-red-600 text-2xl' />
              <p className='text-red-700 font-medium'>Caixa fechado</p>
              <p className='text-red-600 text-sm'>Abra o caixa para realizar vendas</p>
            </div>

            <div className='space-y-3'>
              <label className='block text-sm font-medium text-gray-700'>
                Valor inicial do caixa
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                  R$
                </span>
                <input
                  type='text'
                  value={valorInicial}
                  onChange={(e) => setValorInicial(formatarMoeda(e.target.value))}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='0,00'
                />
              </div>

              <button
                onClick={handleAbrirCaixa}
                disabled={processando}
                className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
              >
                <FiUnlock className='w-4 h-4' />
                <span>{processando ? 'Abrindo...' : 'Abrir Caixa'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <FiUnlock className='text-green-600' />
                  <span className='font-medium text-green-800'>Caixa Aberto</span>
                </div>
                <span className='text-sm text-green-600'>#{status.caixa?.id}</span>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-gray-600 flex items-center'>
                    <FiClock className='w-4 h-4 mr-1' />
                    Aberto em:
                  </p>
                  <p className='font-medium'>
                    {status.caixa?.dataAbertura
                      ? new Date(status.caixa.dataAbertura).toLocaleString('pt-BR')
                      : '-'}
                  </p>
                </div>

                <div>
                  <p className='text-gray-600 flex items-center'>
                    <FiUser className='w-4 h-4 mr-1' />
                    Operador:
                  </p>
                  <p className='font-medium'>{status.caixa?.usuarioAbertura || '-'}</p>
                </div>
              </div>
            </div>

            {/* Resumo financeiro */}
            <div className='bg-gray-50 rounded-lg p-4 space-y-2'>
              <h4 className='font-medium text-gray-800 mb-3'>Resumo Financeiro</h4>

              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Valor inicial:</span>
                <span>R$ {status.caixa?.valorInicial.toFixed(2) || '0,00'}</span>
              </div>

              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Total vendas:</span>
                <span className='text-green-600'>
                  + R$ {status.caixa?.totalVendas.toFixed(2) || '0,00'}
                </span>
              </div>

              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Reforços:</span>
                <span className='text-green-600'>
                  + R$ {status.caixa?.totalReforcos.toFixed(2) || '0,00'}
                </span>
              </div>

              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Sangrias:</span>
                <span className='text-red-600'>
                  - R$ {status.caixa?.totalSangrias.toFixed(2) || '0,00'}
                </span>
              </div>

              <div className='border-t pt-2 mt-2'>
                <div className='flex justify-between font-bold'>
                  <span>Total calculado:</span>
                  <span className='text-blue-600'>
                    R$ {status.caixa?.valorCalculado.toFixed(2) || '0,00'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMostrarModalFechamento(true)}
              className='w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2'
            >
              <FiLock className='w-4 h-4' />
              <span>Fechar Caixa</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de fechamento */}
      {mostrarModalFechamento && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-bold mb-4'>Fechar Caixa</h3>

            <div className='space-y-4'>
              <div className='bg-gray-50 rounded p-3'>
                <p className='text-sm text-gray-600'>Valor esperado no caixa:</p>
                <p className='text-xl font-bold text-blue-600'>
                  R$ {status.caixa?.valorCalculado.toFixed(2) || '0,00'}
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Valor real contado no caixa
                </label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                    R$
                  </span>
                  <input
                    type='text'
                    value={valorFechamento}
                    onChange={(e) => setValorFechamento(formatarMoeda(e.target.value))}
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='0,00'
                  />
                </div>
              </div>

              <div className='flex space-x-3'>
                <button
                  onClick={() => setMostrarModalFechamento(false)}
                  className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400'
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFecharCaixa}
                  disabled={processando || !valorFechamento}
                  className='flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                >
                  {processando ? 'Fechando...' : 'Fechar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
