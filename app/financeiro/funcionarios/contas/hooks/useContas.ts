import { useEffect, useMemo, useState } from "react";
import type { ContaFuncionario, FiltrosContas, ResumoContas } from "../types";
import { normalizeDecimalInput, toDecimal } from "../utils";

/**
 * Hook para gerenciar contas de funcionários
 */
export function useContas(user: { id: number; nome: string } | null) {
  const [contas, setContas] = useState<ContaFuncionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosContas>({
    searchTerm: "",
    statusFilter: "",
    cargoFilter: "",
    limiteMinFilter: "",
    limiteMaxFilter: "",
  });

  useEffect(() => {
    if (!user) return;
    loadContas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    filtros.searchTerm,
    filtros.statusFilter,
    filtros.cargoFilter,
    filtros.limiteMinFilter,
    filtros.limiteMaxFilter,
  ]);

  const loadContas = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const params = new URLSearchParams();
      if (filtros.searchTerm.trim())
        params.append("search", filtros.searchTerm.trim());
      if (filtros.statusFilter) params.append("ativo", filtros.statusFilter);
      if (filtros.cargoFilter.trim())
        params.append("cargo", filtros.cargoFilter.trim());
      if (filtros.limiteMinFilter.trim()) {
        const min = toDecimal(normalizeDecimalInput(filtros.limiteMinFilter));
        if (min !== null) {
          params.append("limite_min", String(min));
        }
      }
      if (filtros.limiteMaxFilter.trim()) {
        const max = toDecimal(normalizeDecimalInput(filtros.limiteMaxFilter));
        if (max !== null) {
          params.append("limite_max", String(max));
        }
      }

      const res = await fetch(`/api/funcionarios/contas?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const parsed = (
          data.data as Array<{
            id: number;
            codigo_funcionario: number;
            funcionario_nome: string | null;
            cargo_oficial: string | null;
            limite_credito: number | null;
            alerta_credito: number | null;
            total_em_aberto: number;
            limite_disponivel: number | null;
            ativo: number;
            dt_criacao: string;
            dt_alteracao: string;
            observacoes: string | null;
          }>
        ).map((row) => ({
          id: Number(row.id),
          codigo_funcionario: Number(row.codigo_funcionario),
          funcionario_nome: row.funcionario_nome ?? null,
          cargo_oficial: row.cargo_oficial ?? null,
          limite_credito:
            row.limite_credito !== null && row.limite_credito !== undefined
              ? Number(row.limite_credito)
              : null,
          alerta_credito:
            row.alerta_credito !== null && row.alerta_credito !== undefined
              ? Number(row.alerta_credito)
              : null,
          total_em_aberto: Number(row.total_em_aberto ?? 0),
          limite_disponivel:
            row.limite_disponivel !== null &&
            row.limite_disponivel !== undefined
              ? Number(row.limite_disponivel)
              : null,
          ativo: Number(row.ativo ?? 0),
          dt_criacao: row.dt_criacao,
          dt_alteracao: row.dt_alteracao,
          observacoes: row.observacoes ?? null,
        }));
        setContas(parsed);
      } else {
        setErrorMessage(data.error || "Não foi possível carregar as contas.");
      }
    } catch (error) {
      console.error("Erro ao carregar contas de funcionários:", error);
      setErrorMessage("Erro interno ao carregar contas.");
    } finally {
      setLoading(false);
    }
  };

  const resumo: ResumoContas = useMemo(() => {
    const totalAberto = contas.reduce(
      (sum, conta) => sum + Number(conta.total_em_aberto || 0),
      0
    );
    const totalLimite = contas.reduce((sum, conta) => {
      if (conta.limite_credito == null) return sum;
      return sum + conta.limite_credito;
    }, 0);
    const totalDisponivel = contas.reduce((sum, conta) => {
      if (conta.limite_disponivel == null) return sum;
      return sum + conta.limite_disponivel;
    }, 0);
    const contasCriticas = contas.filter(
      (conta) =>
        conta.limite_disponivel != null && conta.limite_disponivel <= 0.01
    ).length;
    const contasAtivas = contas.filter((conta) => conta.ativo === 1).length;
    return {
      totalAberto,
      totalLimite,
      totalDisponivel,
      contasCriticas,
      contasAtivas,
    };
  }, [contas]);

  const handleToggleStatus = async (conta: ContaFuncionario) => {
    const novoStatus = conta.ativo ? 0 : 1;
    const confirma = window.confirm(
      `Deseja ${novoStatus ? "ativar" : "desativar"} a conta do funcionário ${
        conta.funcionario_nome || conta.codigo_funcionario
      }?`
    );
    if (!confirma) return;

    try {
      const res = await fetch(
        `/api/funcionarios/contas/${conta.codigo_funcionario}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ativo: novoStatus }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        await loadContas();
      } else {
        alert(data.error || "Não foi possível alterar o status.");
      }
    } catch (error) {
      console.error("Erro ao alterar status da conta:", error);
      alert("Erro interno do servidor.");
    }
  };

  return {
    contas,
    loading,
    errorMessage,
    filtros,
    setFiltros,
    resumo,
    loadContas,
    handleToggleStatus,
  };
}
