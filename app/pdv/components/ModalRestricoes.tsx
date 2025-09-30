import type { AlunoConta, RestricaoAluno } from '../types';

interface ModalRestricoesProps {
  show: boolean;
  aluno: AlunoConta | null;
  restricoes: RestricaoAluno[];
  onClose: () => void;
}

export function ModalRestricoes({ show, aluno, restricoes, onClose }: ModalRestricoesProps) {
  if (!show || restricoes.length === 0) return null;

  return (
    <>
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex={-1}
        role='dialog'
      >
        <div className='modal-dialog modal-dialog-centered'>
          <div className='modal-content border-danger'>
            <div className='modal-header bg-danger text-white'>
              <h5 className='modal-title'>
                <i className='bi bi-exclamation-triangle-fill me-2'></i>
                ⚠️ ATENÇÃO: Restrições de Consumo
              </h5>
              <button
                type='button'
                className='btn-close btn-close-white'
                onClick={onClose}
              ></button>
            </div>
            <div className='modal-body'>
              {aluno && (
                <div className='alert alert-warning mb-3'>
                  <strong>Aluno:</strong> {aluno.nome} (RA: {aluno.ra})
                </div>
              )}

              <div className='mb-3'>
                <p className='fw-bold mb-2'>Este aluno possui as seguintes restrições:</p>
                <div className='list-group'>
                  {restricoes.map((r) => (
                    <div key={r.id} className='list-group-item'>
                      <div className='d-flex w-100 justify-content-between'>
                        <h6 className='mb-1'>
                          {r.tipo_restricao === 'PRODUTO' ? (
                            <>
                              <i className='bi bi-box me-1'></i>
                              Produto: <strong>{r.produto_nome}</strong>
                            </>
                          ) : (
                            <>
                              <i className='bi bi-tag me-1'></i>
                              Tipo: <strong>{r.tipo_produto_nome}</strong>
                            </>
                          )}
                        </h6>
                      </div>
                      {r.motivo && (
                        <p className='mb-1 small text-muted'>
                          <strong>Motivo:</strong> {r.motivo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className='alert alert-info mb-0'>
                <i className='bi bi-info-circle me-2'></i>
                <strong>Importante:</strong> O sistema bloqueará automaticamente a venda de produtos
                restritos para este aluno.
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-primary' onClick={onClose}>
                <i className='bi bi-check-lg me-1'></i>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show' onClick={onClose}></div>
    </>
  );
}
