import styles from '../pdv.module.css';

export function AtalhosTeclado() {
  return (
    <div className={styles.atalhos}>
      <div>
        <kbd>F2</kbd> Buscar cliente
      </div>
      <div>
        <kbd>F3</kbd> Buscar produto
      </div>
      <div>
        <kbd>F9</kbd> Finalizar venda
      </div>
      <div>
        <kbd>ESC</kbd> Limpar venda
      </div>
    </div>
  );
}
