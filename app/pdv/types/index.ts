// Types para o sistema PDV

export interface User {
  id: number;
  nome: string;
  perfil: number;
}

export interface Produto {
  id: number;
  nome: string;
  preco_venda: number;
  por_quilo: number;
  tipo_nome: string;
}

export interface AlunoConta {
  ra: number;
  nome: string;
  saldo_atual?: number;
}

export interface Funcionario {
  codigo: number;
  nome: string;
  cargo?: string;
}

export interface ContaFuncionario {
  codigo_funcionario: number;
  funcionario_nome: string;
  cargo_oficial?: string;
  limite_credito: number | null;
  alerta_credito: number | null;
  total_em_aberto: number;
  limite_disponivel: number | null;
}

export interface ItemCarrinho {
  id_produto: number;
  quantidade?: number;
  peso?: number;
}

export type FormaPagamento = 'SALDO' | 'DINHEIRO' | 'CARTAO' | 'CONTA_FUNCIONARIO';
export type TipoCliente = 'ALUNO' | 'FUNCIONARIO' | 'GERAL';
export type PrioridadeObs = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface ObservacaoAluno {
  id: number;
  tipo_observacao: 'MEDICA' | 'ALIMENTAR' | 'COMPORTAMENTAL' | 'GERAL';
  prioridade: PrioridadeObs;
  observacao: string;
  dt_validade_formatada: string | null;
  expirada: boolean;
  destaque: boolean;
  dias_restantes: number | null;
  ativo: number;
}

export interface StatusCaixa {
  aberto: boolean;
  caixa?: {
    id: number;
    dt_abertura: string;
    valor_inicial: number;
  };
  totais?: {
    suprimentos: number;
    sangrias: number;
    vendas_dinheiro: number;
    esperado: number;
  };
}

export interface PacoteAluno {
  id: number;
  nome_pacote: string;
  tipo_refeicao: string;
  quantidade_total: number;
  quantidade_utilizada: number;
  data_inicio: string;
  data_fim: string | null;
  ativo: number;
}

export interface RestricaoAluno {
  id: number;
  tipo_restricao: 'PRODUTO' | 'TIPO_PRODUTO';
  id_produto: number | null;
  produto_nome: string | null;
  id_tipo_produto: number | null;
  tipo_produto_nome: string | null;
  motivo: string | null;
  ativo: number;
}

export interface ResumoVenda {
  id_venda: number;
  total: number;
  valor_original: number;
  desconto: number;
  cargo_aplicado: string | null;
}

export interface ProdutoBloqueado {
  produto: Produto;
  restricao: RestricaoAluno;
}
