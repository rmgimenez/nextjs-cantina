import React, { useState } from 'react';
import { FiCheckCircle, FiCreditCard, FiDollarSign, FiLoader, FiUser } from 'react-icons/fi';

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

interface Cliente {
  tipo: 'aluno' | 'funcionario';
  id: number;
  nome: string;
  saldo?: number;
}

interface FormaPagamento {
  id: string;
  nome: string;
  icon: React.ReactNode;
  disponivel: boolean;
  requerCliente?: boolean;
}

interface CheckoutProps {
  itens: ItemCarrinho[];
  cliente: Cliente | null;
  onFinalizarVenda: (formaPagamento: string) => Promise<void>;
  loading?: boolean;
}

export default function Checkout({ itens, cliente, onFinalizarVenda, loading }: CheckoutProps) {
  const [formaSelecionada, setFormaSelecionada] = useState<string>('');
  const [processando, setProcessando] = useState(false);

  const total = itens.reduce((sum, item) => sum + item.preco * item.quantidade, 0);

  const formasPagamento: FormaPagamento[] = [
    {
      id: 'DINHEIRO',
      nome: 'Dinheiro',
      icon: <FiDollarSign className='w-5 h-5' />,
      disponivel: true,
    },
    {
      id: 'CARTAO',
      nome: 'Cartão',
      icon: <FiCreditCard className='w-5 h-5' />,
      disponivel: true,
    },
    {
      id: 'SALDO_ALUNO',
      nome: 'Saldo do Aluno',
      icon: <FiUser className='w-5 h-5' />,
      disponivel: cliente?.tipo === 'aluno' && (cliente.saldo || 0) >= total,
      requerCliente: true,
    },
    {
      id: 'CONTA_FUNCIONARIO',
      nome: 'Conta do Funcionário',
      icon: <FiUser className='w-5 h-5' />,
      disponivel: cliente?.tipo === 'funcionario',
      requerCliente: true,
    },
  ];

  const handleFinalizarVenda = async () => {
    if (!formaSelecionada || itens.length === 0 || processando) return;

    const formaEscolhida = formasPagamento.find((f) => f.id === formaSelecionada);
    if (formaEscolhida?.requerCliente && !cliente) {
      alert('Selecione um cliente para esta forma de pagamento');
      return;
    }

    if (formaSelecionada === 'SALDO_ALUNO' && cliente?.tipo === 'aluno') {
      const saldoAtual = cliente.saldo || 0;
      if (saldoAtual < total) {
        alert(
          `Saldo insuficiente. Saldo atual: R$ ${saldoAtual.toFixed(
            2
          )}, Valor necessário: R$ ${total.toFixed(2)}`
        );
        return;
      }
    }

    setProcessando(true);
    try {
      await onFinalizarVenda(formaSelecionada);
      setFormaSelecionada('');
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
    } finally {
      setProcessando(false);
    }
  };

  const podeFinalizarVenda = itens.length > 0 && formaSelecionada && !processando && !loading;

  return (
    <div className='bg-white border rounded-lg p-4'>
      <h3 className='font-semibold text-lg mb-4 flex items-center'>
        <FiCreditCard className='mr-2' />
        Pagamento
      </h3>

      {itens.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <p>Adicione produtos ao carrinho para continuar</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {/* Resumo da venda */}
          <div className='bg-gray-50 rounded-lg p-3'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm text-gray-600'>Itens ({itens.length})</span>
              <span className='text-sm'>R$ {total.toFixed(2)}</span>
            </div>
            <div className='flex justify-between items-center font-bold text-lg border-t pt-2'>
              <span>Total</span>
              <span className='text-green-600'>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Formas de pagamento */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Forma de Pagamento
            </label>

            {formasPagamento.map((forma) => (
              <button
                key={forma.id}
                onClick={() => (forma.disponivel ? setFormaSelecionada(forma.id) : null)}
                disabled={!forma.disponivel}
                className={`w-full p-3 border-2 rounded-lg flex items-center space-x-3 transition-all ${
                  !forma.disponivel
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : formaSelecionada === forma.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    !forma.disponivel
                      ? 'bg-gray-200'
                      : formaSelecionada === forma.id
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}
                >
                  {forma.icon}
                </div>

                <div className='flex-1 text-left'>
                  <p className='font-medium'>{forma.nome}</p>
                  {forma.id === 'SALDO_ALUNO' && cliente?.tipo === 'aluno' && (
                    <p className='text-sm text-gray-500'>
                      Saldo atual: R$ {(cliente.saldo || 0).toFixed(2)}
                    </p>
                  )}
                  {forma.requerCliente && !cliente && (
                    <p className='text-xs text-red-500'>Selecione um cliente</p>
                  )}
                </div>

                {formaSelecionada === forma.id && (
                  <FiCheckCircle className='w-5 h-5 text-blue-600' />
                )}
              </button>
            ))}
          </div>

          {/* Alertas */}
          {formaSelecionada === 'SALDO_ALUNO' &&
            cliente?.tipo === 'aluno' &&
            (cliente.saldo || 0) < total && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                <p className='text-red-700 text-sm'>
                  ⚠️ Saldo insuficiente. Faltam R$ {(total - (cliente.saldo || 0)).toFixed(2)}
                </p>
              </div>
            )}

          {/* Botão finalizar */}
          <button
            onClick={handleFinalizarVenda}
            disabled={!podeFinalizarVenda}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
              podeFinalizarVenda
                ? 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {processando ? (
              <FiLoader className='w-5 h-5 animate-spin' />
            ) : (
              <FiCheckCircle className='w-5 h-5' />
            )}
            <span>{processando ? 'Processando...' : 'Finalizar Venda'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
