import { query } from '../../../../lib/db';

export const TIPOS_OBS = ['MEDICA', 'ALIMENTAR', 'COMPORTAMENTAL', 'GERAL'] as const;

export const PRIORIDADES = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'] as const;

export type TipoObs = (typeof TIPOS_OBS)[number];
export type PrioridadeObs = (typeof PRIORIDADES)[number];

export type RawObservation = {
  id: number;
  ra_aluno: number;
  tipo_observacao: TipoObs;
  observacao: string;
  prioridade: PrioridadeObs;
  dt_validade: string | Date | null;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
  criado_por: number | null;
  criado_por_nome: string | null;
};

export type ApiObservation = RawObservation & {
  dt_validade_formatada: string | null;
  expirada: boolean;
  dias_restantes: number | null;
  destaque: boolean;
};

export function mapObservation(row: RawObservation): ApiObservation {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let dtValidDate: Date | null = null;
  if (row.dt_validade) {
    if (row.dt_validade instanceof Date) {
      dtValidDate = new Date(row.dt_validade.getTime());
    } else if (typeof row.dt_validade === 'string') {
      const parsed = new Date(row.dt_validade);
      if (!Number.isNaN(parsed.getTime())) {
        dtValidDate = parsed;
      }
    }
    if (dtValidDate) {
      dtValidDate.setHours(0, 0, 0, 0);
    }
  }

  const expirada = !!(dtValidDate && dtValidDate.getTime() < hoje.getTime());
  let dias_restantes: number | null = null;
  if (dtValidDate && !expirada) {
    const diffMs = dtValidDate.getTime() - hoje.getTime();
    dias_restantes = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  }

  const destaque = expirada || row.prioridade === 'CRITICA' || row.prioridade === 'ALTA';

  const dt_validade_formatada = dtValidDate
    ? `${dtValidDate.getFullYear()}-${String(dtValidDate.getMonth() + 1).padStart(2, '0')}-${String(
        dtValidDate.getDate()
      ).padStart(2, '0')}`
    : null;

  return {
    ...row,
    ativo: Number(row.ativo),
    dt_validade_formatada,
    expirada,
    dias_restantes,
    destaque,
  };
}

export function parseDateOnly(value?: unknown) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) {
    throw new Error('Data inválida. Use o formato AAAA-MM-DD');
  }
  const [yearStr, monthStr, dayStr] = trimmed.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error('Data inválida. Informe uma data real');
  }
  return `${yearStr}-${monthStr}-${dayStr}`;
}

export async function ensureAlunoExiste(ra: number) {
  const aluno = await query('SELECT ra FROM alunos WHERE ra = ? LIMIT 1', [ra]);
  if (!aluno || aluno.length === 0) {
    throw new Error('Aluno não encontrado');
  }
}

export function buildOrderClause() {
  return `ORDER BY o.ativo DESC, FIELD(o.prioridade, 'CRITICA','ALTA','MEDIA','BAIXA'),
    (o.dt_validade IS NULL), o.dt_validade ASC, o.dt_criacao DESC`;
}
