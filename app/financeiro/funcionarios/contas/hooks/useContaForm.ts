import { useState } from 'react';
import type { ContaFuncionario, FuncionarioBusca } from '../types';
import { toDecimal, normalizeDecimalInput } from '../utils';

/**
 * Hook para gerenciar o formulário de conta
 */
export function useContaForm(conta: ContaFuncionario | null) {
  const [codigo, setCodigo] = useState(conta ? String(conta.codigo_funcionario) : '');
  const [funcionario, setFuncionario] = useState<FuncionarioBusca | null>(
    conta
      ? {
          codigo: conta.codigo_funcionario,
          nome: conta.funcionario_nome || '',
          cargo: conta.cargo_oficial || null,
        }
      : null
  );
  const [limite, setLimite] = useState(
    conta?.limite_credito != null ? conta.limite_credito.toFixed(2).replace('.', ',') : ''
  );
  const [alerta, setAlerta] = useState(
    conta?.alerta_credito != null ? conta.alerta_credito.toFixed(2).replace('.', ',') : ''
  );
  const [observacoes, setObservacoes] = useState(conta?.observacoes || '');
  const [ativo, setAtivo] = useState(conta ? conta.ativo === 1 : true);
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isEdicao = Boolean(conta);

  const handleBuscarFuncionario = async () => {
    if (!codigo.trim()) {
      setFeedback('Informe o código do funcionário para buscar.');
      return;
    }

    try {
      setFeedback(null);
      setBuscando(true);
      const res = await fetch(
        `/api/funcionarios/busca?q=${encodeURIComponent(codigo.trim())}&limit=1`
      );
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
        const found = data.data[0] as FuncionarioBusca;
        setFuncionario(found);
      } else {
        setFuncionario(null);
        setFeedback('Funcionário não encontrado para o código informado.');
      }
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      setFeedback('Erro ao buscar funcionário. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async (onSaved: () => void) => {
    setFeedback(null);

    if (!isEdicao && !funcionario) {
      setFeedback('Selecione um funcionário antes de salvar a conta.');
      return;
    }

    const limiteDecimal = toDecimal(limite);
    const alertaDecimal = toDecimal(alerta);

    try {
      setLoading(true);
      const payload: Record<string, unknown> = {
        limite_credito: limiteDecimal,
        alerta_credito: alertaDecimal,
        observacoes: observacoes.trim() ? observacoes.trim() : null,
        ativo: ativo ? 1 : 0,
      };

      if (!isEdicao && funcionario) {
        payload.codigo_funcionario = Number(funcionario.codigo);
      }

      const url = isEdicao
        ? `/api/funcionarios/contas/${conta?.codigo_funcionario}`
        : '/api/funcionarios/contas';
      const method = isEdicao ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(isEdicao ? 'Conta atualizada com sucesso!' : 'Conta criada com sucesso!');
        onSaved();
      } else {
        setFeedback(data.error || 'Não foi possível salvar a conta.');
      }
    } catch (error) {
      console.error('Erro ao salvar conta de funcionário:', error);
      setFeedback('Erro interno ao salvar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return {
    codigo,
    setCodigo,
    funcionario,
    setFuncionario,
    limite,
    setLimite,
    alerta,
    setAlerta,
    observacoes,
    setObservacoes,
    ativo,
    setAtivo,
    loading,
    buscando,
    feedback,
    isEdicao,
    handleBuscarFuncionario,
    handleSubmit,
  };
}
