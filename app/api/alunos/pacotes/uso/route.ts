import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// POST - Registrar uso de pacote pelo aluno
export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id_pacote_aluno, tipo_refeicao, observacoes } = body;

    // Validações
    if (!id_pacote_aluno || !tipo_refeicao) {
      return NextResponse.json(
        { error: "Campos obrigatórios: id_pacote_aluno, tipo_refeicao" },
        { status: 400 }
      );
    }

    // Buscar informações do pacote
    const pacotes = await query(
      `SELECT 
        pa.*,
        p.tipo_refeicao as tipo_pacote,
        a.nome as aluno_nome
      FROM cant_pacotes_alunos pa
      INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
      INNER JOIN alunos a ON pa.ra_aluno = a.ra
      WHERE pa.id = ? AND pa.ativo = 1`,
      [id_pacote_aluno]
    );

    if (!pacotes || pacotes.length === 0) {
      return NextResponse.json(
        { error: "Pacote não encontrado ou inativo" },
        { status: 404 }
      );
    }

    const pacote = pacotes[0];

    // Verificar se o pacote já não foi totalmente utilizado
    if (pacote.quantidade_utilizada >= pacote.quantidade_total) {
      return NextResponse.json(
        { error: "Pacote já foi totalmente utilizado" },
        { status: 400 }
      );
    }

    // Verificar se o pacote está vencido
    if (pacote.data_fim) {
      const hoje = new Date();
      const dataFim = new Date(pacote.data_fim);
      if (hoje > dataFim) {
        return NextResponse.json(
          { error: "Pacote vencido" },
          { status: 400 }
        );
      }
    }

    // Verificar se o tipo de refeição corresponde ao pacote (exceto PERSONALIZADO)
    if (
      pacote.tipo_pacote !== "PERSONALIZADO" &&
      pacote.tipo_pacote !== tipo_refeicao
    ) {
      return NextResponse.json(
        {
          error: "Tipo de refeição não corresponde ao pacote contratado",
          details: `Pacote é do tipo ${pacote.tipo_pacote}, mas tentou usar ${tipo_refeicao}`,
        },
        { status: 400 }
      );
    }

    // Verificar se já usou hoje (opcional - pode ser configurável)
    const hoje = new Date().toISOString().split("T")[0];
    const usosHoje = await query(
      `SELECT COUNT(*) as total FROM cant_uso_pacotes 
       WHERE id_pacote_aluno = ? 
       AND DATE(data_utilizacao) = ?
       AND tipo_refeicao = ?`,
      [id_pacote_aluno, hoje, tipo_refeicao]
    );

    if (usosHoje && usosHoje[0]?.total > 0) {
      return NextResponse.json(
        {
          error: "Já foi utilizado um pacote desta refeição hoje",
          warning: true,
        },
        { status: 400 }
      );
    }

    // Registrar uso do pacote
    const result: any = await query(
      `INSERT INTO cant_uso_pacotes 
       (id_pacote_aluno, tipo_refeicao, observacoes, usuario)
       VALUES (?, ?, ?, ?)`,
      [id_pacote_aluno, tipo_refeicao, observacoes || null, decoded.id]
    );

    // Atualizar quantidade utilizada
    await query(
      `UPDATE cant_pacotes_alunos 
       SET quantidade_utilizada = quantidade_utilizada + 1
       WHERE id = ?`,
      [id_pacote_aluno]
    );

    // Se for a última refeição, inativar o pacote
    if (pacote.quantidade_utilizada + 1 >= pacote.quantidade_total) {
      await query(
        `UPDATE cant_pacotes_alunos SET ativo = 0 WHERE id = ?`,
        [id_pacote_aluno]
      );
    }

    // Registrar log
    await query(
      `INSERT INTO cant_log_acoes 
       (id_usuario, acao, tabela_afetada, registro_id, dados_novos) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        decoded.id,
        "USO_PACOTE",
        "cant_uso_pacotes",
        result.insertId,
        JSON.stringify({
          id_pacote_aluno,
          tipo_refeicao,
          ra_aluno: pacote.ra_aluno,
          aluno_nome: pacote.aluno_nome,
          quantidade_restante: pacote.quantidade_total - (pacote.quantidade_utilizada + 1),
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Uso de pacote registrado com sucesso",
      id: result.insertId,
      quantidade_restante: pacote.quantidade_total - (pacote.quantidade_utilizada + 1),
    });
  } catch (error) {
    console.error("Erro ao registrar uso de pacote:", error);
    return NextResponse.json(
      { error: "Erro ao registrar uso de pacote" },
      { status: 500 }
    );
  }
}

// GET - Buscar histórico de uso de pacotes
export async function GET(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id_pacote_aluno = searchParams.get("id_pacote_aluno");
    const ra_aluno = searchParams.get("ra_aluno");

    let sql = `
      SELECT 
        up.*,
        pa.ra_aluno,
        a.nome as aluno_nome,
        p.nome as pacote_nome,
        u.nome as usuario_nome
      FROM cant_uso_pacotes up
      INNER JOIN cant_pacotes_alunos pa ON up.id_pacote_aluno = pa.id
      INNER JOIN alunos a ON pa.ra_aluno = a.ra
      INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
      LEFT JOIN cant_usuarios_cantina u ON up.usuario = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (id_pacote_aluno) {
      sql += " AND up.id_pacote_aluno = ?";
      params.push(id_pacote_aluno);
    }

    if (ra_aluno) {
      sql += " AND pa.ra_aluno = ?";
      params.push(ra_aluno);
    }

    sql += " ORDER BY up.data_utilizacao DESC LIMIT 100";

    const historico = await query(sql, params);
    return NextResponse.json({ success: true, historico });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}
