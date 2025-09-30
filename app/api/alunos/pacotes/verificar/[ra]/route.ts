import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

// GET - Verificar se aluno possui pacote válido para uma refeição
export async function GET(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { ra } = await params;
    const { searchParams } = new URL(req.url);
    const tipo_refeicao = searchParams.get('tipo');

    // Buscar pacotes ativos do aluno que ainda têm saldo
    const sql = `
      SELECT 
        pa.id,
        pa.id_pacote,
        pa.quantidade_total,
        pa.quantidade_utilizada,
        (pa.quantidade_total - pa.quantidade_utilizada) as quantidade_restante,
        pa.data_inicio,
        pa.data_fim,
        p.nome as pacote_nome,
        p.tipo_refeicao,
        p.descricao,
        p.valor,
        CASE 
          WHEN pa.data_fim < CURDATE() THEN 'VENCIDO'
          WHEN pa.data_fim <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'VENCENDO'
          ELSE 'ATIVO'
        END as status_validade
      FROM cant_pacotes_alunos pa
      INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
      WHERE pa.ra_aluno = ?
        AND pa.ativo = 1
        AND pa.quantidade_utilizada < pa.quantidade_total
        AND (pa.data_fim IS NULL OR pa.data_fim >= CURDATE())
    `;

    const sqlParams: any[] = [ra];

    // Se tipo de refeição foi especificado, filtrar por ele
    let sqlFinal = sql;
    if (tipo_refeicao) {
      sqlFinal += " AND (p.tipo_refeicao = ? OR p.tipo_refeicao = 'PERSONALIZADO')";
      sqlParams.push(tipo_refeicao);
    }

    sqlFinal += ' ORDER BY pa.data_inicio DESC';

    const pacotes = await query(sqlFinal, sqlParams);

    // Verificar se já usou algum pacote desta refeição hoje
    const hoje = new Date().toISOString().split('T')[0];
    const usosHoje = tipo_refeicao
      ? await query(
          `SELECT up.*, pa.id_pacote
           FROM cant_uso_pacotes up
           INNER JOIN cant_pacotes_alunos pa ON up.id_pacote_aluno = pa.id
           WHERE pa.ra_aluno = ? 
           AND DATE(up.data_utilizacao) = ?
           AND up.tipo_refeicao = ?`,
          [ra, hoje, tipo_refeicao]
        )
      : [];

    const temPacoteValido = pacotes && pacotes.length > 0;
    const jaUsouHoje = usosHoje && usosHoje.length > 0;

    return NextResponse.json({
      success: true,
      temPacoteValido,
      jaUsouHoje,
      pacotes: pacotes || [],
      usosHoje: usosHoje || [],
    });
  } catch (error) {
    console.error('Erro ao verificar pacotes:', error);
    return NextResponse.json({ error: 'Erro ao verificar pacotes' }, { status: 500 });
  }
}
