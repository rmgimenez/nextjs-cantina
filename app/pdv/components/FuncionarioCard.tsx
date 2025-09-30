import styles from '../pdv.module.css';
import type { ContaFuncionario, Funcionario } from '../types';

interface FuncionarioCardProps {
  funcionario: Funcionario;
  contaInfo: ContaFuncionario | null;
  carregando: boolean;
  avisoCredito: string;
}

export function FuncionarioCard({
  funcionario,
  contaInfo,
  carregando,
  avisoCredito,
}: FuncionarioCardProps) {
  return (
    <div className={styles.clienteInfo}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://sistema.santanna.g12.br/carometr/${funcionario.codigo}.jpg`}
        alt={funcionario.nome}
        className={styles.fotoCliente}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('d-none');
        }}
      />
      <div className={`${styles.fotoPlaceholder} d-none`}>👔</div>

      <div className={styles.clienteNome}>{funcionario.nome}</div>
      <div className='text-muted small mb-2'>
        Cód: {funcionario.codigo}
        {funcionario.cargo && ` • ${funcionario.cargo}`}
      </div>

      {carregando && (
        <div className='text-center py-3'>
          <div className='spinner-border spinner-border-sm text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
          <div className='small text-muted mt-2'>Carregando dados...</div>
        </div>
      )}

      {!carregando && contaInfo && (
        <div className='border rounded p-2 mt-3 bg-light'>
          <div className='d-flex justify-content-between small mb-1'>
            <span>Limite:</span>
            <strong>
              {contaInfo.limite_credito !== null
                ? `R$ ${contaInfo.limite_credito.toFixed(2)}`
                : 'Sem limite'}
            </strong>
          </div>
          <div className='d-flex justify-content-between small mb-1'>
            <span>Em aberto:</span>
            <strong className='text-warning'>R$ {contaInfo.total_em_aberto.toFixed(2)}</strong>
          </div>
          {contaInfo.limite_disponivel !== null && (
            <div className='d-flex justify-content-between small'>
              <span>Disponível:</span>
              <strong className={contaInfo.limite_disponivel < 0 ? 'text-danger' : 'text-success'}>
                R$ {contaInfo.limite_disponivel.toFixed(2)}
              </strong>
            </div>
          )}
          {avisoCredito && (
            <div className='alert alert-warning py-1 px-2 mt-2 small mb-0'>{avisoCredito}</div>
          )}
        </div>
      )}
    </div>
  );
}
