import { useRef } from 'react';
import styles from '../pdv.module.css';
import type {
  AlunoConta,
  ContaFuncionario,
  Funcionario,
  ObservacaoAluno,
  PacoteAluno,
  RestricaoAluno,
  TipoCliente,
} from '../types';
import { AlunoCard } from './AlunoCard';
import { BuscaCliente } from './BuscaCliente';
import { FuncionarioCard } from './FuncionarioCard';

interface ClienteCardProps {
  tipoCliente: TipoCliente;
  // Props para busca de alunos
  buscaAluno: string;
  onBuscaAlunoChange: (value: string) => void;
  sugestoesAlunos: AlunoConta[];
  onSelecionarAluno: (aluno: AlunoConta) => void;
  // Props para busca de funcionários
  buscaFunc: string;
  onBuscaFuncChange: (value: string) => void;
  sugestoesFunc: Funcionario[];
  onSelecionarFunc: (func: Funcionario) => void;
  // Cliente selecionado
  aluno: AlunoConta | null;
  funcionario: Funcionario | null;
  // Dados do aluno
  saldo: number;
  observacoes: ObservacaoAluno[];
  restricoes: RestricaoAluno[];
  pacotes: PacoteAluno[];
  temPacoteValido: boolean;
  onShowRestricoes: () => void;
  // Dados do funcionário
  contaFuncionario: ContaFuncionario | null;
  carregandoFuncionario: boolean;
  avisoCredito: string;
}

export function ClienteCard({
  tipoCliente,
  buscaAluno,
  onBuscaAlunoChange,
  sugestoesAlunos,
  onSelecionarAluno,
  buscaFunc,
  onBuscaFuncChange,
  sugestoesFunc,
  onSelecionarFunc,
  aluno,
  funcionario,
  saldo,
  observacoes,
  restricoes,
  pacotes,
  temPacoteValido,
  onShowRestricoes,
  contaFuncionario,
  carregandoFuncionario,
  avisoCredito,
}: ClienteCardProps) {
  const buscaClienteRef = useRef<HTMLInputElement>(null);

  const clienteSelecionado = aluno || funcionario;

  return (
    <div className={styles.clienteCard}>
      <h5 className='mb-3 text-center'>
        {tipoCliente === 'ALUNO' && '👨‍🎓 Identificar Aluno'}
        {tipoCliente === 'FUNCIONARIO' && '👔 Identificar Funcionário'}
        {tipoCliente === 'GERAL' && '🛒 Venda Geral'}
      </h5>

      {/* Busca de cliente */}
      <BuscaCliente
        ref={buscaClienteRef}
        tipoCliente={tipoCliente}
        buscaAluno={buscaAluno}
        onBuscaAlunoChange={onBuscaAlunoChange}
        sugestoesAlunos={sugestoesAlunos}
        onSelecionarAluno={onSelecionarAluno}
        buscaFunc={buscaFunc}
        onBuscaFuncChange={onBuscaFuncChange}
        sugestoesFunc={sugestoesFunc}
        onSelecionarFunc={onSelecionarFunc}
      />

      {/* Placeholder quando nenhum cliente selecionado */}
      {!clienteSelecionado && tipoCliente !== 'GERAL' && (
        <div className='text-center text-muted py-5'>
          <div className={styles.fotoPlaceholder}>{tipoCliente === 'ALUNO' ? '👨‍🎓' : '👔'}</div>
          <p className='mt-3'>
            {tipoCliente === 'ALUNO'
              ? 'Busque o aluno para iniciar'
              : 'Busque o funcionário para iniciar'}
          </p>
        </div>
      )}

      {/* Card do Aluno */}
      {aluno && tipoCliente === 'ALUNO' && (
        <AlunoCard
          aluno={aluno}
          saldo={saldo}
          observacoes={observacoes}
          restricoes={restricoes}
          pacotes={pacotes}
          temPacoteValido={temPacoteValido}
          onShowRestricoes={onShowRestricoes}
        />
      )}

      {/* Card do Funcionário */}
      {funcionario && tipoCliente === 'FUNCIONARIO' && (
        <FuncionarioCard
          funcionario={funcionario}
          contaInfo={contaFuncionario}
          carregando={carregandoFuncionario}
          avisoCredito={avisoCredito}
        />
      )}

      {/* Venda Geral */}
      {tipoCliente === 'GERAL' && (
        <div className='text-center py-5'>
          <div className={styles.fotoPlaceholder}>🛒</div>
          <p className='mt-3 text-muted'>
            Venda para público geral
            <br />
            <small>Pagamento: Dinheiro ou Cartão</small>
          </p>
        </div>
      )}
    </div>
  );
}
