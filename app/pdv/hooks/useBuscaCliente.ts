import { useEffect, useState } from 'react';
import type { AlunoConta, Funcionario, TipoCliente } from '../types';

/**
 * Hook para buscar alunos
 */
export function useBuscaAlunos(tipoCliente: TipoCliente) {
  const [buscaAluno, setBuscaAluno] = useState('');
  const [sugestoesAlunos, setSugestoesAlunos] = useState<AlunoConta[]>([]);

  useEffect(() => {
    let ignore = false;

    async function buscar() {
      if (tipoCliente !== 'ALUNO') return;

      const q = buscaAluno.trim();
      if (!q || q.length < 2) {
        setSugestoesAlunos([]);
        return;
      }

      try {
        const res = await fetch(`/api/alunos/busca?q=${encodeURIComponent(q)}&limit=10`);
        const d = await res.json();

        if (!ignore) {
          setSugestoesAlunos(d?.data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        if (!ignore) {
          setSugestoesAlunos([]);
        }
      }
    }

    buscar();

    return () => {
      ignore = true;
    };
  }, [buscaAluno, tipoCliente]);

  return { buscaAluno, setBuscaAluno, sugestoesAlunos, setSugestoesAlunos };
}

/**
 * Hook para buscar funcionários
 */
export function useBuscaFuncionarios(tipoCliente: TipoCliente) {
  const [buscaFunc, setBuscaFunc] = useState('');
  const [sugestoesFunc, setSugestoesFunc] = useState<Funcionario[]>([]);

  useEffect(() => {
    let ignore = false;

    async function buscar() {
      if (tipoCliente !== 'FUNCIONARIO') return;

      const q = buscaFunc.trim();
      if (!q || q.length < 2) {
        setSugestoesFunc([]);
        return;
      }

      try {
        const res = await fetch(`/api/funcionarios/busca?q=${encodeURIComponent(q)}&limit=10`);
        const d = await res.json();

        if (!ignore) {
          setSugestoesFunc(d?.data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        if (!ignore) {
          setSugestoesFunc([]);
        }
      }
    }

    buscar();

    return () => {
      ignore = true;
    };
  }, [buscaFunc, tipoCliente]);

  return { buscaFunc, setBuscaFunc, sugestoesFunc, setSugestoesFunc };
}
