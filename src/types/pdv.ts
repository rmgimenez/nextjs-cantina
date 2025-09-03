export interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
  estoqueMinimo: number;
  exigePeso: boolean;
}

export interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
}

export interface Cliente {
  tipo: 'aluno' | 'funcionario';
  id: number;
  nome: string;
  curso?: string;
  serie?: string;
  turma?: string;
  cargo?: string;
  saldo?: number;
  precoRefeicao?: number;
  observacao?: string;
  fotoUrl?: string;
}

export interface StatusCaixa {
  caixaAberto: boolean;
  caixa: {
    id: number;
    dataAbertura: string;
    valorInicial: number;
    totalVendas: number;
    totalSangrias: number;
    totalReforcos: number;
    valorCalculado: number;
    usuarioAbertura: string;
  } | null;
}
