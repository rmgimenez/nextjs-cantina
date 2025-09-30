import styles from '../pdv.module.css';
import type { AlunoConta, ObservacaoAluno, PacoteAluno, RestricaoAluno } from '../types';
import { getTipoRefeicaoLabel } from '../utils';

interface AlunoCardProps {
  aluno: AlunoConta;
  saldo: number;
  observacoes: ObservacaoAluno[];
  restricoes: RestricaoAluno[];
  pacotes: PacoteAluno[];
  temPacoteValido: boolean;
  onShowRestricoes: () => void;
}

export function AlunoCard({
  aluno,
  saldo,
  observacoes,
  restricoes,
  pacotes,
  temPacoteValido,
  onShowRestricoes,
}: AlunoCardProps) {
  return (
    <div className={styles.clienteInfo}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://sistema.santanna.g12.br/carometr/${aluno.ra}.jpg`}
        alt={aluno.nome}
        className={styles.fotoCliente}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('d-none');
        }}
      />
      <div className={`${styles.fotoPlaceholder} d-none`}>👨‍🎓</div>

      <div className={styles.clienteNome}>{aluno.nome}</div>
      <div className='text-muted small mb-2'>RA: {aluno.ra}</div>

      {/* Badge de Restrições */}
      {restricoes.length > 0 && (
        <div className='alert alert-danger py-2 px-2 mb-2 d-flex justify-content-between align-items-center'>
          <div>
            <i className='bi bi-exclamation-triangle-fill me-2'></i>
            <strong>{restricoes.length}</strong>{' '}
            {restricoes.length === 1 ? 'restrição ativa' : 'restrições ativas'}
          </div>
          <button
            className='btn btn-sm btn-outline-danger'
            onClick={onShowRestricoes}
            title='Ver detalhes das restrições'
          >
            <i className='bi bi-eye'></i>
          </button>
        </div>
      )}

      <div className={`${styles.clienteSaldo} ${saldo < 10 ? styles.clienteSaldoBaixo : ''}`}>
        R$ {saldo.toFixed(2)}
      </div>
      {saldo < 10 && (
        <div className='alert alert-warning py-1 px-2 mt-2 small'>⚠️ Saldo baixo!</div>
      )}

      {/* Observações do aluno */}
      {observacoes.length > 0 && (
        <div className='mt-3'>
          <h6 className='fw-bold text-danger mb-2'>⚠️ ATENÇÃO</h6>
          {observacoes.map((obs) => {
            const alertClass =
              obs.prioridade === 'CRITICA'
                ? styles.obsAlertCritica
                : obs.prioridade === 'ALTA'
                ? styles.obsAlertAlta
                : obs.prioridade === 'MEDIA'
                ? styles.obsAlertMedia
                : styles.obsAlertBaixa;

            return (
              <div key={obs.id} className={`${styles.obsAlert} ${alertClass}`}>
                <strong>{obs.tipo_observacao}:</strong> {obs.observacao}
              </div>
            );
          })}
        </div>
      )}

      {/* Pacotes de Alimentação */}
      {temPacoteValido && pacotes.length > 0 && (
        <div className='mt-3 border border-success rounded p-2 bg-light'>
          <h6 className='fw-bold text-success mb-2'>
            <i className='bi bi-box-seam me-1'></i>
            Pacotes Disponíveis
          </h6>
          {pacotes.map((pacote) => (
            <div key={pacote.id} className='small mb-2 pb-2 border-bottom'>
              <strong>{getTipoRefeicaoLabel(pacote.tipo_refeicao)}</strong>
              <br />
              Restantes: {pacote.quantidade_total - pacote.quantidade_utilizada} de{' '}
              {pacote.quantidade_total}
              {pacote.data_fim && (
                <>
                  <br />
                  Válido até: {new Date(pacote.data_fim).toLocaleDateString('pt-BR')}
                </>
              )}
            </div>
          ))}
          <div className='text-center mt-2'>
            <a
              href='/alunos/pacotes/consultar'
              className='btn btn-sm btn-outline-success'
              target='_blank'
            >
              <i className='bi bi-box-arrow-up-right me-1'></i>
              Usar Pacote
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
