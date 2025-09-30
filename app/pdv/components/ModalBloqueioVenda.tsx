import type { AlunoConta, ProdutoBloqueado } from '../types';

interface ModalBloqueioVendaProps {
  show: boolean;
  aluno: AlunoConta | null;
  produtosBloqueados: ProdutoBloqueado[];
  onClose: () => void;
  onRemoverBloqueados: () => void;
}

export function ModalBloqueioVenda({
  show,
  aluno,
  produtosBloqueados,
  onClose,
  onRemoverBloqueados,
}: ModalBloqueioVendaProps) {
  if (!show || produtosBloqueados.length === 0) return null;

  return (
    <>
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex={-1}
        role='dialog'
      >
        <div className='modal-dialog modal-dialog-centered modal-lg'>
          <div className='modal-content border-danger shadow-lg'>
            <div className='modal-header bg-danger text-white'>
              <h5 className='modal-title'>
                <i className='bi bi-x-circle-fill me-2'></i>
                🚫 VENDA BLOQUEADA - Produtos Restritos
              </h5>
              <button
                type='button'
                className='btn-close btn-close-white'
                onClick={onClose}
              ></button>
            </div>
            <div className='modal-body'>
              {aluno && (
                <div className='alert alert-danger mb-4'>
                  <div className='d-flex align-items-center'>
                    <i className='bi bi-person-x-fill me-3' style={{ fontSize: '2rem' }}></i>
                    <div>
                      <strong className='d-block'>Aluno:</strong>
                      {aluno.nome} (RA: {aluno.ra})
                    </div>
                  </div>
                </div>
              )}

              <div className='alert alert-warning mb-3'>
                <i className='bi bi-exclamation-triangle-fill me-2'></i>
                <strong>Atenção!</strong> A venda não pode ser concluída porque o carrinho contém
                produtos restritos para este aluno.
              </div>

              <h6 className='fw-bold mb-3 text-danger'>
                Produtos Bloqueados ({produtosBloqueados.length}):
              </h6>

              <div className='list-group mb-4'>
                {produtosBloqueados.map(({ produto, restricao }, index) => (
                  <div key={index} className='list-group-item list-group-item-danger'>
                    <div className='d-flex w-100 justify-content-between align-items-start'>
                      <div className='flex-grow-1'>
                        <h6 className='mb-1'>
                          <i className='bi bi-x-circle-fill me-2 text-danger'></i>
                          {produto.nome}
                        </h6>
                        <p className='mb-1 small'>
                          <strong>Tipo:</strong> {produto.tipo_nome}
                        </p>
                        <p className='mb-1 small'>
                          <strong>Restrição:</strong>{' '}
                          {restricao.tipo_restricao === 'PRODUTO'
                            ? `Produto específico bloqueado`
                            : `Tipo "${restricao.tipo_produto_nome}" bloqueado`}
                        </p>
                        {restricao.motivo && (
                          <p className='mb-0 small text-muted'>
                            <strong>Motivo:</strong> {restricao.motivo}
                          </p>
                        )}
                      </div>
                      <span className='badge bg-danger'>BLOQUEADO</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className='alert alert-info mb-0'>
                <i className='bi bi-lightbulb-fill me-2'></i>
                <strong>O que fazer?</strong>
                <ul className='mb-0 mt-2'>
                  <li>Remova os produtos bloqueados do carrinho</li>
                  <li>Ou retorne ao carrinho e ajuste manualmente</li>
                </ul>
              </div>
            </div>
            <div className='modal-footer bg-light'>
              <button type='button' className='btn btn-outline-secondary' onClick={onClose}>
                <i className='bi bi-arrow-left me-1'></i>
                Voltar ao Carrinho
              </button>
              <button type='button' className='btn btn-danger' onClick={onRemoverBloqueados}>
                <i className='bi bi-trash me-1'></i>
                Remover Produtos Bloqueados
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show' onClick={onClose}></div>
    </>
  );
}
