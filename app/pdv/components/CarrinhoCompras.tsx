import styles from '../pdv.module.css';
import type { ItemCarrinho, Produto, TipoCliente } from '../types';

interface CarrinhoComprasProps {
  itens: ItemCarrinho[];
  produtos: Produto[];
  tipoCliente: TipoCliente;
  precosCargo: Record<number, number>;
  totais: {
    base: number;
    aplicado: number;
    desconto: number;
  };
  onUpdateItem: (id_produto: number, field: 'quantidade' | 'peso', value: string) => void;
  onRemoverItem: (id_produto: number) => void;
  onFinalizar: () => void;
  podeFinali: boolean;
  clienteSelecionado: boolean;
}

export function CarrinhoCompras({
  itens,
  produtos,
  tipoCliente,
  precosCargo,
  totais,
  onUpdateItem,
  onRemoverItem,
  onFinalizar,
  podeFinali,
  clienteSelecionado,
}: CarrinhoComprasProps) {
  return (
    <div className={styles.carrinhoContainer}>
      <div className={styles.carrinhoHeader}>
        <div className='d-flex justify-content-between align-items-center'>
          <h5 className='mb-0'>🛒 Carrinho</h5>
          <span className='badge bg-primary'>
            {itens.length} {itens.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      <div className={styles.carrinhoItens}>
        {itens.length === 0 ? (
          <div className='text-center text-muted py-5'>
            <div style={{ fontSize: '3rem' }}>🛒</div>
            <p className='mt-2'>Carrinho vazio</p>
            <small>Adicione produtos para começar</small>
          </div>
        ) : (
          itens.map((item) => {
            const p = produtos.find((pr) => pr.id === item.id_produto);
            if (!p) return null;

            const quantidade = p.por_quilo
              ? Number(item.peso) || 0
              : Number(item.quantidade ?? 1) || 0;
            const precoBase = Number(p.preco_venda);
            const precoAplicado =
              tipoCliente === 'FUNCIONARIO' && precosCargo[p.id] != null
                ? Number(precosCargo[p.id])
                : precoBase;
            const subtotal = precoAplicado * quantidade;
            const temDesconto = precoAplicado !== precoBase;

            return (
              <div key={item.id_produto} className={styles.carrinhoItem}>
                <div className='d-flex justify-content-between align-items-start mb-2'>
                  <div className='flex-grow-1'>
                    <strong>{p.nome}</strong>
                    {temDesconto && <span className='badge bg-success ms-2'>Com desconto</span>}
                  </div>
                  <button
                    className='btn btn-sm btn-outline-danger'
                    onClick={() => onRemoverItem(item.id_produto)}
                    title='Remover item'
                  >
                    ✕
                  </button>
                </div>

                <div className='row g-2 align-items-center'>
                  {p.por_quilo ? (
                    <>
                      <div className='col-5'>
                        <label className='form-label small mb-1'>Peso (kg)</label>
                        <input
                          type='number'
                          className='form-control form-control-sm'
                          value={item.peso || 0}
                          onChange={(e) => onUpdateItem(item.id_produto, 'peso', e.target.value)}
                          step='0.001'
                          min='0'
                        />
                      </div>
                      <div className='col-7'>
                        <label className='form-label small mb-1'>
                          Preço/kg: R$ {precoAplicado.toFixed(2)}
                        </label>
                        {temDesconto && (
                          <div className='text-muted small text-decoration-line-through'>
                            R$ {precoBase.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='col-5'>
                        <label className='form-label small mb-1'>Qtd</label>
                        <input
                          type='number'
                          className='form-control form-control-sm'
                          value={item.quantidade || 1}
                          onChange={(e) =>
                            onUpdateItem(item.id_produto, 'quantidade', e.target.value)
                          }
                          min='1'
                        />
                      </div>
                      <div className='col-7'>
                        <label className='form-label small mb-1'>
                          Unit: R$ {precoAplicado.toFixed(2)}
                        </label>
                        {temDesconto && (
                          <div className='text-muted small text-decoration-line-through'>
                            R$ {precoBase.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className='mt-2 pt-2 border-top d-flex justify-content-between'>
                  <span className='small text-muted'>Subtotal:</span>
                  <strong>R$ {subtotal.toFixed(2)}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.carrinhoFooter}>
        <div className={styles.totalContainer}>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <span className='text-muted small'>Subtotal:</span>
            <span className='fw-semibold'>R$ {totais.base.toFixed(2)}</span>
          </div>

          {tipoCliente === 'FUNCIONARIO' && totais.desconto > 0 && (
            <div className='d-flex justify-content-between align-items-center mb-2'>
              <span className='text-success small'>Desconto:</span>
              <span className='text-success fw-semibold'>- R$ {totais.desconto.toFixed(2)}</span>
            </div>
          )}

          <div className='border-top pt-2 mt-2'>
            <div className='d-flex justify-content-between align-items-center'>
              <span className='fw-bold'>TOTAL:</span>
              <span className='fs-4 fw-bold text-primary'>R$ {totais.aplicado.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          className={styles.btnFinalizar}
          onClick={onFinalizar}
          disabled={!podeFinali}
          title='Finalizar venda (F9)'
        >
          {itens.length === 0
            ? '🛒 Carrinho vazio'
            : !clienteSelecionado
            ? '⚠️ Selecione um cliente'
            : '✓ Finalizar Venda (F9)'}
        </button>
      </div>
    </div>
  );
}
