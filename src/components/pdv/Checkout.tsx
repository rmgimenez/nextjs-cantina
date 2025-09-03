import { formatarMoeda } from '@/lib/formatters';
import React, { useState } from 'react';
import { FiCheckCircle, FiCreditCard, FiDollarSign, FiLoader, FiUser } from 'react-icons/fi';

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  exigePeso?: boolean;
  peso?: number;
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
          `Saldo insuficiente. Saldo atual: ${formatarMoeda(
            saldoAtual
          )}, Valor necessário: ${formatarMoeda(total)}`
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
    <div className='card shadow-sm'>
      <div className='card-header bg-white border-0 pb-0'>
        <h5 className='fw-semibold mb-0 d-flex align-items-center'>
          <FiCreditCard className='me-2' /> Pagamento
        </h5>
      </div>
      <div className='card-body pt-2'>
        {itens.length === 0 ? (
          <div className='text-center text-muted small py-4'>
            Adicione produtos ao carrinho para continuar
          </div>
        ) : (
          <>
            <div className='p-2 rounded bg-light mb-3'>
              <div className='d-flex justify-content-between small mb-1'>
                <span className='text-muted'>Itens ({itens.length})</span>
                <span>{formatarMoeda(total)}</span>
              </div>
              <div className='border-top pt-2 d-flex justify-content-between align-items-center fw-bold'>
                <span>Total</span>
                <span className='text-success'>{formatarMoeda(total)}</span>
              </div>
            </div>
            <div className='mb-2'>
              <label className='form-label small fw-semibold'>Forma de Pagamento</label>
              <div className='d-flex flex-column gap-2'>
                {formasPagamento.map((forma) => {
                  const active = formaSelecionada === forma.id;
                  return (
                    <button
                      key={forma.id}
                      onClick={() => (forma.disponivel ? setFormaSelecionada(forma.id) : null)}
                      disabled={!forma.disponivel}
                      className={`btn btn-sm text-start d-flex align-items-center gap-2 border-2 ${
                        !forma.disponivel
                          ? 'btn-outline-secondary disabled opacity-50'
                          : active
                          ? 'btn-outline-primary bg-primary bg-opacity-10'
                          : 'btn-outline-secondary'
                      }`}
                    >
                      <span
                        className={`p-2 rounded-circle d-inline-flex align-items-center justify-content-center ${
                          active ? 'bg-primary bg-opacity-25 text-primary' : 'bg-light'
                        }`}
                      >
                        {forma.icon}
                      </span>
                      <span className='flex-grow-1 small'>
                        <span className='fw-semibold d-block'>{forma.nome}</span>
                        {forma.id === 'SALDO_ALUNO' && cliente?.tipo === 'aluno' && (
                          <span className='text-muted'>
                            Saldo: {formatarMoeda(cliente.saldo || 0)}
                          </span>
                        )}
                        {forma.requerCliente && !cliente && (
                          <span className='text-danger d-block'>Selecione um cliente</span>
                        )}
                      </span>
                      {active && <FiCheckCircle className='text-primary' />}
                    </button>
                  );
                })}
              </div>
            </div>
            {formaSelecionada === 'SALDO_ALUNO' &&
              cliente?.tipo === 'aluno' &&
              (cliente.saldo || 0) < total && (
                <div className='alert alert-danger py-2 small'>
                  Saldo insuficiente. Faltam {formatarMoeda(total - (cliente.saldo || 0))}
                </div>
              )}
            <div className='d-grid mt-3'>
              <button
                onClick={handleFinalizarVenda}
                disabled={!podeFinalizarVenda}
                className='btn btn-success fw-semibold d-flex justify-content-center align-items-center gap-2'
              >
                {processando ? (
                  <FiLoader className='spinner-border spinner-border-sm' />
                ) : (
                  <FiCheckCircle />
                )}
                {processando ? 'Processando...' : 'Finalizar Venda'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
