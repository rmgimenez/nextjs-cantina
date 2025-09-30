import { forwardRef } from 'react';
import styles from '../pdv.module.css';
import type { Produto, TipoCliente } from '../types';
import { getProdutoIcon } from '../utils';

interface ProdutosGridProps {
  produtos: Produto[];
  busca: string;
  onBuscaChange: (value: string) => void;
  onAddItem: (produto: Produto) => void;
  tipoCliente: TipoCliente;
  precosCargo: Record<number, number>;
}

export const ProdutosGrid = forwardRef<HTMLInputElement, ProdutosGridProps>(
  ({ produtos, busca, onBuscaChange, onAddItem, tipoCliente, precosCargo }, ref) => {
    const produtosFiltrados = produtos.filter((p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
      <div className={styles.clienteCard}>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h5 className='mb-0'>🛍️ Produtos</h5>
          <span className='badge bg-secondary'>{produtosFiltrados.length} produtos</span>
        </div>

        <div className='mb-3'>
          <input
            ref={ref}
            className={styles.buscaInput}
            placeholder='🔍 Buscar produto... (F3)'
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
          />
        </div>

        <div className={styles.produtosGrid}>
          {produtosFiltrados.length === 0 ? (
            <div className='col-12 text-center text-muted py-5'>
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            produtosFiltrados.map((p) => {
              const precoEspecial = tipoCliente === 'FUNCIONARIO' ? precosCargo[p.id] : undefined;
              const temDesconto =
                precoEspecial != null && Number(precoEspecial) !== Number(p.preco_venda);
              const precoFinal = temDesconto ? Number(precoEspecial) : Number(p.preco_venda);

              return (
                <div
                  key={p.id}
                  className={styles.produtoCard}
                  onClick={() => onAddItem(p)}
                  title={`Adicionar ${p.nome}`}
                >
                  <div className={styles.produtoIcon}>{getProdutoIcon(p.tipo_nome)}</div>
                  <div className={styles.produtoNome}>{p.nome}</div>
                  <div className={styles.produtoPreco}>
                    {temDesconto ? (
                      <>
                        <span className='text-decoration-line-through text-muted small'>
                          R$ {Number(p.preco_venda).toFixed(2)}
                        </span>
                        <br />
                        <span className='text-success fw-bold'>R$ {precoFinal.toFixed(2)}</span>
                      </>
                    ) : (
                      <>R$ {precoFinal.toFixed(2)}</>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
);

ProdutosGrid.displayName = 'ProdutosGrid';
