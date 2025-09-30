/**
 * Formata um valor numérico como moeda brasileira
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

/**
 * Formata uma data ISO para o formato brasileiro com hora
 */
export function formatDate(dateIso: string | null | undefined): string {
  if (!dateIso) return '-';
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
}

/**
 * Remove caracteres não numéricos exceto vírgula e ponto
 */
export function normalizeDecimalInput(value: string): string {
  if (!value) return '';
  return value.replace(/[^\d,\.]/g, '');
}

/**
 * Converte uma string formatada para número decimal
 */
export function toDecimal(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, '').replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
}
