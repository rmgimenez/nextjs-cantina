export interface ContaReceber {
  id: number;
  descricao: string;
  cliente?: string;
  numero_documento?: string;
  valor_original: number;
  valor_recebido: number;
  valor_pendente: number;
  data_emissao: string;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'PENDENTE' | 'RECEBIDO' | 'ATRASADO' | 'CANCELADO';
  situacao: string;
  dias_atraso?: number;
  categoria_nome?: string;
  usuario_cadastro_nome: string;
}

export interface Recebimento {
  id: number;
  valor_recebido: number;
  valor_desconto: number;
  valor_juros: number;
  data_recebimento: string;
  forma_recebimento: string;
  observacoes?: string;
  usuario_nome: string;
}

export interface CategoriaFinanceira {
  id: number;
  nome: string;
  tipo: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FiltrosContas {
  status: string;
  situacao: string;
  categoria_id: string;
  cliente: string;
  data_inicio: string;
  data_fim: string;
}

export interface FormDataConta {
  categoria_id: string;
  descricao: string;
  cliente: string;
  numero_documento: string;
  valor_original: string;
  data_emissao: string;
  data_vencimento: string;
  observacoes: string;
  parcelas: string;
  data_primeira_parcela: string;
}

export interface FormDataRecebimento {
  valor_recebido: string;
  valor_desconto: string;
  valor_juros: string;
  data_recebimento: string;
  forma_recebimento: string;
  observacoes: string;
}
