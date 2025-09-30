import type { ContaFuncionario } from '../types';
import { useContaForm } from '../hooks';
import { normalizeDecimalInput } from '../utils';

interface ContaModalProps {
  conta: ContaFuncionario | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ContaModal({ conta, onClose, onSaved }: ContaModalProps) {
  const {
    codigo,
    setCodigo,
    funcionario,
    setFuncionario,
    limite,
    setLimite,
    alerta,
    setAlerta,
    observacoes,
    setObservacoes,
    ativo,
    setAtivo,
    loading,
    buscando,
    feedback,
    isEdicao,
    handleBuscarFuncionario,
    handleSubmit,
  } = useContaForm(conta);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(onSaved);
  };

  return (
    <div className='modal show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className='modal-dialog modal-lg'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>
              {isEdicao ? 'Editar conta de funcionário' : 'Nova conta de funcionário'}
            </h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className='modal-body'>
              {feedback && (
                <div className='alert alert-warning' role='alert'>
                  {feedback}
                </div>
              )}
              <div className='row g-3'>
                <div className='col-md-4'>
                  <label className='form-label'>Código do funcionário *</label>
                  <div className='input-group'>
                    <input
                      type='text'
                      className='form-control'
                      value={codigo}
                      onChange={(e) => {
                        setCodigo(e.target.value.replace(/[^\d]/g, ''));
                        if (!isEdicao) {
                          setFuncionario(null);
                        }
                      }}
                      disabled={isEdicao}
                      placeholder='Ex.: 123'
                    />
                    {!isEdicao && (
                      <button
                        className='btn btn-outline-secondary'
                        type='button'
                        onClick={handleBuscarFuncionario}
                        disabled={buscando}
                      >
                        {buscando ? 'Buscando...' : 'Buscar'}
                      </button>
                    )}
                  </div>
                </div>
                <div className='col-md-8'>
                  <label className='form-label'>Funcionário selecionado</label>
                  <input
                    type='text'
                    className='form-control'
                    value={
                      funcionario
                        ? `${funcionario.nome}${funcionario.cargo ? ` - ${funcionario.cargo}` : ''}`
                        : 'Nenhum funcionário selecionado'
                    }
                    disabled
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label'>Limite de crédito</label>
                  <input
                    type='text'
                    inputMode='decimal'
                    className='form-control'
                    placeholder='Ex.: 500,00'
                    value={limite}
                    onChange={(e) => setLimite(normalizeDecimalInput(e.target.value))}
                  />
                  <div className='form-text'>Deixe em branco para não aplicar limite fixo.</div>
                </div>
                <div className='col-md-6'>
                  <label className='form-label'>Alerta de crédito</label>
                  <input
                    type='text'
                    inputMode='decimal'
                    className='form-control'
                    placeholder='Ex.: 100,00'
                    value={alerta}
                    onChange={(e) => setAlerta(normalizeDecimalInput(e.target.value))}
                  />
                  <div className='form-text'>
                    Envie um alerta quando o saldo disponível atingir este valor.
                  </div>
                </div>
                <div className='col-12'>
                  <label className='form-label'>Observações</label>
                  <textarea
                    className='form-control'
                    rows={3}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder='Registre instruções específicas sobre este funcionário.'
                  ></textarea>
                </div>
                <div className='col-12'>
                  <div className='form-check form-switch'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      id='contaAtivaSwitch'
                      checked={ativo}
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                    <label className='form-check-label' htmlFor='contaAtivaSwitch'>
                      Conta ativa
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-outline-secondary' onClick={onClose}>
                Cancelar
              </button>
              <button type='submit' className='btn btn-primary' disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
