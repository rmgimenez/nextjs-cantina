import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Buscar todos os pacotes de alunos com informações detalhadas
    const sql = `
      SELECT 
        pa.id,
        pa.id_pacote,
        pa.ra_aluno,
        pa.quantidade_total,
        pa.quantidade_utilizada,
        (pa.quantidade_total - pa.quantidade_utilizada) as quantidade_restante,
        pa.data_inicio,
        pa.data_fim,
        pa.ativo,
        pa.dt_criacao,
        p.nome as pacote_nome,
        p.tipo_refeicao,
        p.valor as pacote_valor,
        a.nome as aluno_nome,
        a.turma,
        a.serie,
        a.curso_nome
      FROM cant_pacotes_alunos pa
      INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
      INNER JOIN alunos a ON pa.ra_aluno = a.ra
      ORDER BY pa.dt_criacao DESC
    `;

    const pacotes = await query(sql);

    // Garantir que valores numéricos sejam números e não strings
    const pacotesFormatados = (pacotes as any[]).map((pacote) => ({
      ...pacote,
      quantidade_total: parseInt(pacote.quantidade_total),
      quantidade_utilizada: parseInt(pacote.quantidade_utilizada),
      quantidade_restante: parseInt(pacote.quantidade_restante),
      ativo: parseInt(pacote.ativo),
      pacote_valor: parseFloat(pacote.pacote_valor),
      serie: parseInt(pacote.serie),
    }));

    return NextResponse.json({
      success: true,
      pacotes: pacotesFormatados || [],
    });
  } catch (error) {
    console.error('Erro ao buscar pacotes de alunos:', error);
    return NextResponse.json({ error: 'Erro ao buscar pacotes de alunos' }, { status: 500 });
  }
}
