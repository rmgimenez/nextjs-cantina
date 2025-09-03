import { formatarMoeda } from '@/lib/formatters';
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
  const [mostrarModalMov, setMostrarModalMov] = useState<null | 'sangria' | 'reforco'>(null);
  const [valorMov, setValorMov] = useState('');
  const [justificativaMov, setJustificativaMov] = useState('');

  const parseValor = (valor: string) => {
    return parseFloat(valor.replace(',', '.')) || 0;
  };

  const formatarValorInput = (valor: string) => {
    const numero = valor.replace(/\D/g, '');
    const numeroFormatado = (parseInt(numero) / 100).toFixed(2);
    return numeroFormatado.replace('.', ',');
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
          `${data.message}\n\nValor calculado: ${formatarMoeda(
            data.valorCalculado
          )}\nValor informado: ${formatarMoeda(data.valorInformado)}\nDiferença: ${formatarMoeda(
            data.diferenca
          )}`
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

  const handleMovimentacao = async () => {
    if (!mostrarModalMov) return;
    const valor = parseValor(valorMov);
    if (valor <= 0) {
      alert('Informe um valor maior que zero');
      return;
    }
    if (!justificativaMov || justificativaMov.trim().length < 3) {
      alert('Informe uma justificativa (mínimo 3 caracteres)');
      return;
    }
    if (mostrarModalMov === 'sangria' && status.caixa && valor > status.caixa.valorCalculado) {
      alert('Valor de sangria excede o total disponível em caixa');
      return;
    }

    setProcessando(true);
    try {
      const response = await fetch('/api/pdv/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: mostrarModalMov,
          valor: valor,
          justificativa: justificativaMov.trim(),
        }),
      });
      const data = await response.json();
      if (data.ok) {
        alert(data.message);
        onAtualizarStatus();
        setValorMov('');
        setJustificativaMov('');
        setMostrarModalMov(null);
      } else {
        alert(data.error || 'Erro ao registrar movimentação');
      }
    } catch (e) {
      console.error('Erro movimentação caixa', e);
      alert('Erro ao conectar com o servidor');
    } finally {
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <div className='card shadow-sm'>
        <div className='card-body'>
          <div className='placeholder-glow'>
            <span className='placeholder col-3 me-2'></span>
            <span className='placeholder col-8'></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='card shadow-sm'>
        <div className='card-body pb-3'>
          <h5 className='fw-semibold d-flex align-items-center mb-3'>
            {status.caixaAberto ? (
              <FiUnlock className='me-2 text-success' />
            ) : (
              <FiLock className='me-2 text-danger' />
            )}
            Status do Caixa
          </h5>

          {!status.caixaAberto ? (
            <div className=''>
              <div className='alert alert-danger text-center py-3'>
                <FiLock className='me-2' /> Caixa fechado – abra para realizar vendas
              </div>
              <div className='row g-2 align-items-end'>
                <div className='col-12'>
                  <label className='form-label small fw-semibold'>Valor inicial</label>
                  <div className='input-group'>
                    <span className='input-group-text'>R$</span>
                    <input
                      type='text'
                      value={valorInicial}
                      onChange={(e) => setValorInicial(formatarValorInput(e.target.value))}
                      className='form-control'
                      placeholder='0,00'
                    />
                  </div>
                </div>
                <div className='col-12 d-grid'>
                  <button
                    onClick={handleAbrirCaixa}
                    disabled={processando}
                    className='btn btn-success fw-semibold'
                  >
                    <FiUnlock className='me-2' /> {processando ? 'Abrindo...' : 'Abrir Caixa'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className=''>
              <div className='border rounded p-3 mb-3 bg-success bg-opacity-10'>
                <div className='d-flex justify-content-between mb-2 small'>
                  <div className='d-flex align-items-center fw-medium text-success'>
                    <FiUnlock className='me-2' /> Caixa Aberto
                  </div>
                  <span className='text-success'>#{status.caixa?.id}</span>
                </div>
                <div className='row g-2 small'>
                  <div className='col-6'>
                    <div className='text-muted d-flex align-items-center'>
                      <FiClock className='me-1' /> Aberto em:
                    </div>
                    <div className='fw-semibold'>
                      {status.caixa?.dataAbertura
                        ? new Date(status.caixa.dataAbertura).toLocaleString('pt-BR')
                        : '-'}
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='text-muted d-flex align-items-center'>
                      <FiUser className='me-1' /> Operador:
                    </div>
                    <div className='fw-semibold'>{status.caixa?.usuarioAbertura || '-'}</div>
                  </div>
                </div>
              </div>
              <div className='bg-light rounded p-3 mb-3'>
                <h6 className='fw-semibold mb-2'>Resumo Financeiro</h6>
                <ul className='list-unstyled mb-0 small'>
                  <li className='d-flex justify-content-between'>
                    <span className='text-muted'>Valor inicial</span>
                    <span>{formatarMoeda(Number(status.caixa?.valorInicial || 0))}</span>
                  </li>
                  <li className='d-flex justify-content-between'>
                    <span className='text-muted'>Total vendas</span>
                    <span className='text-success'>
                      + {formatarMoeda(Number(status.caixa?.totalVendas || 0))}
                    </span>
                  </li>
                  <li className='d-flex justify-content-between'>
                    <span className='text-muted'>Reforços</span>
                    <span className='text-success'>
                      + {formatarMoeda(Number(status.caixa?.totalReforcos || 0))}
                    </span>
                  </li>
                  <li className='d-flex justify-content-between'>
                    <span className='text-muted'>Sangrias</span>
                    <span className='text-danger'>
                      - {formatarMoeda(Number(status.caixa?.totalSangrias || 0))}
                    </span>
                  </li>
                  <li className='border-top pt-2 mt-2 d-flex justify-content-between fw-bold'>
                    <span>Total calculado</span>
                    <span className='text-primary'>
                      {formatarMoeda(Number(status.caixa?.valorCalculado || 0))}
                    </span>
                  </li>
                </ul>
              </div>
              <div className='d-grid'>
                <div className='btn-group mb-2'>
                  <button
                    type='button'
                    className='btn btn-outline-warning btn-sm fw-semibold'
                    onClick={() => setMostrarModalMov('sangria')}
                  >
                    Registrar Sangria
                  </button>
                  <button
                    type='button'
                    className='btn btn-outline-success btn-sm fw-semibold'
                    onClick={() => setMostrarModalMov('reforco')}
                  >
                    Registrar Reforço
                  </button>
                </div>
                <button
                  onClick={() => setMostrarModalFechamento(true)}
                  className='btn btn-danger fw-semibold'
                >
                  <FiLock className='me-2' /> Fechar Caixa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de fechamento */}
      {mostrarModalFechamento && (
        <div className='modal d-block' style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-dialog-centered'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Fechar Caixa</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setMostrarModalFechamento(false)}
                ></button>
              </div>
              <div className='modal-body'>
                <div className='mb-3 p-3 rounded bg-light'>
                  <div className='small text-muted'>Valor esperado no caixa:</div>
                  <div className='fs-5 fw-bold text-primary'>
                    {formatarMoeda(Number(status.caixa?.valorCalculado || 0))}
                  </div>
                </div>
                <label className='form-label small fw-semibold'>Valor real contado</label>
                <div className='input-group mb-2'>
                  <span className='input-group-text'>R$</span>
                  <input
                    type='text'
                    value={valorFechamento}
                    onChange={(e) => setValorFechamento(formatarValorInput(e.target.value))}
                    className='form-control'
                    placeholder='0,00'
                  />
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => setMostrarModalFechamento(false)}
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  onClick={handleFecharCaixa}
                  disabled={processando || !valorFechamento}
                  className='btn btn-danger'
                >
                  {processando ? 'Fechando...' : 'Fechar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarModalMov && (
        <div className='modal d-block' style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  {mostrarModalMov === 'sangria' ? 'Registrar Sangria' : 'Registrar Reforço'}
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => !processando && setMostrarModalMov(null)}
                  disabled={processando}
                ></button>
              </div>
              <div className='modal-body'>
                <div className='mb-3'>
                  <label className='form-label small fw-semibold'>Valor</label>
                  <div className='input-group'>
                    <span className='input-group-text'>R$</span>
                    <input
                      type='text'
                      className='form-control'
                      value={valorMov}
                      onChange={(e) => setValorMov(formatarValorInput(e.target.value))}
                      placeholder='0,00'
                      disabled={processando}
                    />
                  </div>
                  {mostrarModalMov === 'sangria' && status.caixa && (
                    <small className='text-muted'>
                      Disponível em caixa: {formatarMoeda(status.caixa.valorCalculado)}
                    </small>
                  )}
                </div>
                <div className='mb-3'>
                  <label className='form-label small fw-semibold'>Justificativa</label>
                  <textarea
                    className='form-control'
                    rows={3}
                    value={justificativaMov}
                    onChange={(e) => setJustificativaMov(e.target.value)}
                    placeholder='Descreva o motivo da movimentação'
                    disabled={processando}
                  />
                </div>
                <div className='alert alert-info py-2 small'>
                  Justificativa é obrigatória e ficará registrada no histórico do caixa.
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => !processando && setMostrarModalMov(null)}
                  disabled={processando}
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  className={
                    'btn ' + (mostrarModalMov === 'sangria' ? 'btn-warning' : 'btn-success')
                  }
                  onClick={handleMovimentacao}
                  disabled={processando || !valorMov || !justificativaMov}
                >
                  {processando ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
