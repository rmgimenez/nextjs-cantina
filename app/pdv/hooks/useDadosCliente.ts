import { useState } from "react";
import type {
  AlunoConta,
  ContaFuncionario,
  Funcionario,
  ObservacaoAluno,
  PacoteAluno,
  RestricaoAluno,
  TipoCliente,
} from "../types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useDadosCliente(tipoCliente: TipoCliente) {
  // Estados do aluno
  const [aluno, setAluno] = useState<AlunoConta | null>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [observacoes, setObservacoes] = useState<ObservacaoAluno[]>([]);
  const [restricoes, setRestricoes] = useState<RestricaoAluno[]>([]);
  const [pacotes, setPacotes] = useState<PacoteAluno[]>([]);
  const [temPacoteValido, setTemPacoteValido] = useState(false);

  // Estados do funcionário
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [contaFuncionario, setContaFuncionario] =
    useState<ContaFuncionario | null>(null);
  const [precosCargo, setPrecosCargo] = useState<Record<number, number>>({});
  const [avisoCredito, setAvisoCredito] = useState("");
  const [carregandoFuncionario, setCarregandoFuncionario] = useState(false);

  // Funções para carregar dados do aluno
  async function carregarContaAluno(ra: number) {
    try {
      const res = await fetch(
        `/api/alunos/contas/${encodeURIComponent(String(ra))}`
      );
      const d = await res.json();
      if (d?.data) {
        setAluno(d.data);
        setSaldo(Number(d.data.saldo_atual || 0));
        return d.data;
      }
    } catch (error) {
      console.error("Erro ao carregar conta do aluno:", error);
    }
    return null;
  }

  async function carregarObservacoesAluno(ra: number) {
    try {
      const res = await fetch(
        `/api/alunos/observacoes/${encodeURIComponent(String(ra))}?ativo=1`
      );
      if (res.ok) {
        const d = await res.json();
        if (d?.success) {
          setObservacoes(d.data as ObservacaoAluno[]);
        } else {
          setObservacoes([]);
        }
      } else {
        setObservacoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar observações:", error);
      setObservacoes([]);
    }
  }

  async function carregarRestricoesAluno(ra: number) {
    try {
      const res = await fetch(
        `/api/alunos/restricoes/${encodeURIComponent(String(ra))}?ativo=1`
      );
      if (res.ok) {
        const d = await res.json();
        if (d?.success && d.data && d.data.length > 0) {
          setRestricoes(d.data);
          return d.data;
        } else {
          setRestricoes([]);
        }
      } else {
        setRestricoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar restrições:", error);
      setRestricoes([]);
    }
    return [];
  }

  async function carregarPacotesAluno(ra: number) {
    try {
      const res = await fetch(
        `/api/alunos/pacotes/verificar/${encodeURIComponent(String(ra))}`
      );
      if (res.ok) {
        const d = await res.json();
        if (d?.success) {
          setPacotes(d.pacotes || []);
          setTemPacoteValido(d.temPacoteValido || false);
        } else {
          setPacotes([]);
          setTemPacoteValido(false);
        }
      } else {
        setPacotes([]);
        setTemPacoteValido(false);
      }
    } catch (error) {
      console.error("Erro ao carregar pacotes:", error);
      setPacotes([]);
      setTemPacoteValido(false);
    }
  }

  async function selecionarAluno(a: AlunoConta) {
    await carregarContaAluno(a.ra);
    await carregarObservacoesAluno(a.ra);
    const restricoesData = await carregarRestricoesAluno(a.ra);
    await carregarPacotesAluno(a.ra);
    return restricoesData;
  }

  // Funções para carregar dados do funcionário
  async function carregarDadosFuncionario(codigo: number, cargo?: string) {
    setCarregandoFuncionario(true);

    try {
      // Carregar conta
      const res = await fetch(
        `/api/funcionarios/contas/${encodeURIComponent(String(codigo))}`
      );
      if (res.ok) {
        const d = await res.json();
        if (d?.data) {
          const conta = d.data as ContaFuncionario;
          conta.total_em_aberto = Number(conta.total_em_aberto || 0);
          conta.limite_credito =
            conta.limite_credito !== null && conta.limite_credito !== undefined
              ? Number(conta.limite_credito)
              : null;
          conta.alerta_credito =
            conta.alerta_credito !== null && conta.alerta_credito !== undefined
              ? Number(conta.alerta_credito)
              : null;
          conta.limite_disponivel =
            conta.limite_disponivel !== null &&
            conta.limite_disponivel !== undefined
              ? Number(conta.limite_disponivel)
              : null;
          setContaFuncionario(conta);

          if (
            conta.limite_disponivel !== null &&
            conta.alerta_credito !== null &&
            conta.limite_disponivel <= conta.alerta_credito
          ) {
            setAvisoCredito(
              "Limite disponível em alerta. Atenção ao próximo lançamento."
            );
          } else {
            setAvisoCredito("");
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar conta do funcionário:", error);
    }

    try {
      // Carregar preços especiais por cargo
      if (cargo) {
        const res = await fetch(
          `/api/funcionarios/precos?cargo=${encodeURIComponent(
            cargo
          )}&vigentes=1`
        );
        if (res.ok) {
          const d = await res.json();
          const precos = (d?.data || []) as {
            id_produto: number;
            preco_especial: number;
          }[];
          const map: Record<number, number> = {};
          precos.forEach((p) => {
            if (p?.id_produto) {
              map[p.id_produto] = Number(p.preco_especial);
            }
          });
          setPrecosCargo(map);
        } else {
          setPrecosCargo({});
        }
      } else {
        setPrecosCargo({});
      }
    } catch (error) {
      console.error("Erro ao carregar preços:", error);
      setPrecosCargo({});
    }

    setCarregandoFuncionario(false);
  }

  async function selecionarFuncionario(f: Funcionario) {
    setFuncionario(f);
    await carregarDadosFuncionario(f.codigo, f.cargo?.toUpperCase());
  }

  function limparDadosCliente() {
    setAluno(null);
    setFuncionario(null);
    setSaldo(0);
    setObservacoes([]);
    setRestricoes([]);
    setPacotes([]);
    setTemPacoteValido(false);
    setContaFuncionario(null);
    setPrecosCargo({});
    setAvisoCredito("");
  }

  return {
    // Aluno
    aluno,
    saldo,
    observacoes,
    restricoes,
    pacotes,
    temPacoteValido,
    selecionarAluno,
    // Funcionário
    funcionario,
    contaFuncionario,
    precosCargo,
    avisoCredito,
    carregandoFuncionario,
    selecionarFuncionario,
    // Geral
    limparDadosCliente,
  };
}
