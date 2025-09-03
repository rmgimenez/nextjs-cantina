export interface ContaPagar {
  id: number;
  descricao: string;
  fornecedor?: string;
  numero_documento?: string;
  valor_original: number;
  valor_pago: number;
  valor_pendente: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
  situacao: string;
  dias_atraso?: number;
  categoria_nome?: string;
  usuario_cadastro_nome: string;
}

export interface Pagamento {
  id: number;
  valor_pago: number;
  valor_desconto: number;
  valor_juros: number;
  data_pagamento: string;
  forma_pagamento: string;
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
  fornecedor: string;
  data_inicio: string;
  data_fim: string;
}

export interface FormDataConta {
  categoria_id: string;
  descricao: string;
  fornecedor: string;
  numero_documento: string;
  valor_original: string;
  data_emissao: string;
  data_vencimento: string;
  observacoes: string;
  parcelas: string;
  data_primeira_parcela: string;
}

export interface FormDataPagamento {
  valor_pago: string;
  valor_desconto: string;
  valor_juros: string;
  data_pagamento: string;
  forma_pagamento: string;
  observacoes: string;
}
