import { forwardRef } from 'react';
import styles from '../pdv.module.css';
import type { AlunoConta, Funcionario, TipoCliente } from '../types';

interface BuscaClienteProps {
  tipoCliente: TipoCliente;
  // Props para alunos
  buscaAluno?: string;
  onBuscaAlunoChange?: (value: string) => void;
  sugestoesAlunos?: AlunoConta[];
  onSelecionarAluno?: (aluno: AlunoConta) => void;
  // Props para funcionários
  buscaFunc?: string;
  onBuscaFuncChange?: (value: string) => void;
  sugestoesFunc?: Funcionario[];
  onSelecionarFunc?: (func: Funcionario) => void;
}

export const BuscaCliente = forwardRef<HTMLInputElement, BuscaClienteProps>(
  (
    {
      tipoCliente,
      buscaAluno,
      onBuscaAlunoChange,
      sugestoesAlunos,
      onSelecionarAluno,
      buscaFunc,
      onBuscaFuncChange,
      sugestoesFunc,
      onSelecionarFunc,
    },
    ref
  ) => {
    if (tipoCliente === 'GERAL') {
      return null;
    }

    if (tipoCliente === 'ALUNO') {
      return (
        <div className={styles.buscaRapida}>
          <input
            ref={ref}
            className={styles.buscaInput}
            placeholder='🔍 Buscar por nome ou RA... (F2)'
            value={buscaAluno}
            onChange={(e) => onBuscaAlunoChange?.(e.target.value)}
            autoFocus
          />
          {sugestoesAlunos && sugestoesAlunos.length > 0 && (
            <div className={styles.sugestoesDropdown}>
              {sugestoesAlunos.map((a) => (
                <div
                  key={a.ra}
                  className={styles.sugestaoItem}
                  onClick={() => onSelecionarAluno?.(a)}
                >
                  <strong>{a.nome}</strong>
                  <br />
                  <small className='text-muted'>RA: {a.ra}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // FUNCIONARIO
    return (
      <div className={styles.buscaRapida}>
        <input
          ref={ref}
          className={styles.buscaInput}
          placeholder='🔍 Buscar funcionário... (F2)'
          value={buscaFunc}
          onChange={(e) => onBuscaFuncChange?.(e.target.value)}
          autoFocus
        />
        {sugestoesFunc && sugestoesFunc.length > 0 && (
          <div className={styles.sugestoesDropdown}>
            {sugestoesFunc.map((f) => (
              <div
                key={f.codigo}
                className={styles.sugestaoItem}
                onClick={() => onSelecionarFunc?.(f)}
              >
                <strong>{f.nome}</strong>
                <br />
                <small className='text-muted'>
                  Cód: {f.codigo} {f.cargo && `• ${f.cargo}`}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

BuscaCliente.displayName = 'BuscaCliente';
