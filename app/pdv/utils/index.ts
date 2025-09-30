// Funções utilitárias para o PDV

/**
 * Retorna o emoji do produto baseado no tipo
 */
export function getProdutoIcon(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t.includes('salgado')) return '🥖';
  if (t.includes('doce')) return '🍰';
  if (t.includes('bebida')) return '🥤';
  if (t.includes('refeiç') || t.includes('almoço')) return '🍽️';
  if (t.includes('lanche')) return '🥪';
  return '🍴';
}

/**
 * Retorna o label formatado do tipo de refeição
 */
export function getTipoRefeicaoLabel(tipo: string): string {
  const tipos: Record<string, string> = {
    LANCHE_MANHA: 'Lanche Manhã',
    ALMOCO: 'Almoço',
    LANCHE_TARDE: 'Lanche Tarde',
    JANTAR: 'Jantar',
    PERSONALIZADO: 'Personalizado',
  };
  return tipos[tipo] || tipo;
}

/**
 * Formata valor monetário
 */
export function formatarMoeda(valor: number): string {
  return valor.toFixed(2);
}

/**
 * Valida se o valor é numérico e positivo
 */
export function isNumeroValido(valor: any): boolean {
  const num = Number(valor);
  return !isNaN(num) && num >= 0;
}
