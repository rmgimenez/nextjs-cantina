import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// GET - Listar pacotes de um aluno
export async function GET(
  req: Request,
  { params }: { params: Promise<{ ra: string }> }
) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { ra } = await params;
    const { searchParams } = new URL(req.url);
    const ativo = searchParams.get("ativo");

    let sql = `
      SELECT 
        pa.*,
        p.nome as pacote_nome,
        p.tipo_refeicao,
        p.descricao as pacote_descricao,
        p.valor as pacote_valor,
        (pa.quantidade_total - pa.quantidade_utilizada) as quantidade_restante,
        CASE 
          WHEN pa.data_fim < CURDATE() THEN 'VENCIDO'
          WHEN pa.data_fim <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'VENCENDO'
          ELSE 'ATIVO'
        END as status_validade
      FROM cant_pacotes_alunos pa
      INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
      WHERE pa.ra_aluno = ?
    `;
    const queryParams: (string | number)[] = [ra];

    if (ativo !== null) {
      sql += " AND pa.ativo = ?";
      queryParams.push(ativo === "true" ? 1 : 0);
    }

    sql += " ORDER BY pa.data_inicio DESC";

    const pacotes = await query(sql, queryParams);
    return NextResponse.json({ success: true, pacotes });
  } catch (error) {
    console.error("Erro ao buscar pacotes do aluno:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pacotes do aluno" },
      { status: 500 }
    );
  }
}

// POST - Contratar novo pacote para o aluno
export async function POST(
  req: Request,
  { params }: { params: Promise<{ ra: string }> }
) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { ra } = await params;
    const body = await req.json();
    const { id_pacote, data_inicio, data_fim } = body;

    // Validações
    if (!id_pacote || !data_inicio) {
      return NextResponse.json(
        { error: "Campos obrigatórios: id_pacote, data_inicio" },
        { status: 400 }
      );
    }

    // Verificar se o aluno existe
    const alunos = await query("SELECT ra FROM alunos WHERE ra = ?", [ra]);
    if (!alunos || alunos.length === 0) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o pacote existe e está ativo
    const pacotes = await query(
      "SELECT * FROM cant_pacotes_alimentacao WHERE id = ? AND ativo = 1",
      [id_pacote]
    );
    if (!pacotes || pacotes.length === 0) {
      return NextResponse.json(
        { error: "Pacote não encontrado ou inativo" },
        { status: 404 }
      );
    }

    const pacote = pacotes[0];

    // Calcular data_fim se não fornecida e se o pacote tem validade_dias
    let dataFim = data_fim;
    if (!dataFim && pacote.validade_dias) {
      const inicio = new Date(data_inicio);
      inicio.setDate(inicio.getDate() + pacote.validade_dias);
      dataFim = inicio.toISOString().split("T")[0];
    }

    const sql = `
      INSERT INTO cant_pacotes_alunos 
      (id_pacote, ra_aluno, quantidade_total, quantidade_utilizada, data_inicio, data_fim, criado_por)
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `;

    interface InsertResult {
      insertId: number;
    }
    const result = (await query(sql, [
      id_pacote,
      ra,
      pacote.quantidade_refeicoes,
      data_inicio,
      dataFim || null,
      decoded.id,
    ])) as unknown as InsertResult;

    // Registrar log
    await query(
      `INSERT INTO cant_log_acoes 
       (id_usuario, acao, tabela_afetada, registro_id, dados_novos) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        decoded.id,
        "CONTRATACAO_PACOTE",
        "cant_pacotes_alunos",
        result.insertId,
        JSON.stringify({
          ra_aluno: ra,
          id_pacote,
          quantidade_total: pacote.quantidade_refeicoes,
          data_inicio,
          data_fim: dataFim,
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Pacote contratado com sucesso",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao contratar pacote:", error);
    return NextResponse.json(
      { error: "Erro ao contratar pacote" },
      { status: 500 }
    );
  }
}
