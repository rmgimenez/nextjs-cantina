import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

// GET /api/alunos/contas/[ra] - Consulta conta/saldo de um RA
export async function GET(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const { ra } = await params;
    if (!ra || isNaN(Number(ra))) {
      return NextResponse.json({ error: 'RA inválido' }, { status: 400 });
    }

    // Buscar dados do aluno na view e conta
    const rows = await query(
      `SELECT a.ra, a.nome, a.turma, a.serie, a.curso_nome,
              ca.id as conta_id, ca.saldo_atual, ca.limite_credito, ca.ativo
       FROM alunos a
       LEFT JOIN cant_contas_alunos ca ON ca.ra_aluno = a.ra
       WHERE a.ra = ?
       LIMIT 1`,
      [Number(ra)]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    const aluno = rows[0] as {
      ra: number;
      nome: string;
      turma?: string | null;
      serie?: string | number | null;
      curso_nome?: string | null;
      conta_id?: number | null;
      saldo_atual?: number | null;
      limite_credito?: number | null;
      ativo?: number | null;
    };

    // Se não existir conta, criar automaticamente ativa com saldo 0
    if (!aluno.conta_id) {
      await query(
        `INSERT INTO cant_contas_alunos (ra_aluno, saldo_atual, limite_credito, ativo)
         VALUES (?, 0, 0, 1)`,
        [Number(ra)]
      );
      const created = await query(
        `SELECT id as conta_id, saldo_atual, limite_credito, ativo
         FROM cant_contas_alunos WHERE ra_aluno = ?`,
        [Number(ra)]
      );
      const conta = created[0] as {
        conta_id: number;
        saldo_atual: number;
        limite_credito: number;
        ativo: number;
      };
      return NextResponse.json({ success: true, data: { ...aluno, ...conta } });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Erro ao consultar conta do aluno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
