export interface User {
  id: number;
  nome: string;
  perfil: number;
}

export interface ContaFuncionario {
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
  observacoes?: string | null;
}

export interface FuncionarioBusca {
  codigo: number;
  nome: string;
  cargo: string | null;
}

export interface ResumoContas {
  totalAberto: number;
  totalLimite: number;
  totalDisponivel: number;
  contasCriticas: number;
  contasAtivas: number;
}

export interface FiltrosContas {
  searchTerm: string;
  statusFilter: string;
  cargoFilter: string;
  limiteMinFilter: string;
  limiteMaxFilter: string;
}
