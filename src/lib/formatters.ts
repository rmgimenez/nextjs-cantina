/**
 * Utilitários para formatação de dados
 */

/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param valor - Valor numérico a ser formatado
 * @returns String formatada como moeda brasileira
 */
export const formatarMoeda = (valor: number | string | null | undefined): string => {
  // Garante que valores enviados como string ou nulos sejam convertidos para number
  const n = typeof valor === 'number' ? valor : parseFloat(String(valor ?? '0').replace(',', '.'));
  const safeNumber = Number.isFinite(n) ? n : 0;
  return safeNumber.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Formata uma data para o padrão brasileiro
 * @param data - Data a ser formatada (string ou Date)
 * @returns String formatada como data brasileira
 */
export const formatarData = (data: string | Date): string => {
  const dateObj = typeof data === 'string' ? new Date(data) : data;
  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Formata um número para formato brasileiro
 * @param valor - Valor numérico a ser formatado
 * @param casasDecimais - Número de casas decimais (padrão: 2)
 * @returns String formatada
 */
export const formatarNumero = (
  valor: number | string | null | undefined,
  casasDecimais: number = 2
): string => {
  const n = typeof valor === 'number' ? valor : parseFloat(String(valor ?? '0').replace(',', '.'));
  const safeNumber = Number.isFinite(n) ? n : 0;
  return safeNumber.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  });
};
