import { query } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

// GET - Buscar pacote específico do aluno
export async function GET(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
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

    const { ra, id } = await params;

    const sql = `
      SELECT 
        pa.*,
        p.nome as pacote_nome,
        p.tipo_refeicao,
        p.descricao as pacote_descricao,
        p.valor as pacote_valor,
        (pa.quantidade_total - pa.quantidade_utilizada) as quantidade_restante,
        a.nome as aluno_nome
      FROM cant_pacotes_alunos pa
      INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
      INNER JOIN alunos a ON pa.ra_aluno = a.ra
      WHERE pa.id = ? AND pa.ra_aluno = ?
    `;

    const pacotes = await query(sql, [id, ra]);

    if (!pacotes || pacotes.length === 0) {
      return NextResponse.json(
        { error: "Pacote não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, pacote: pacotes[0] });
  } catch (error) {
    console.error("Erro ao buscar pacote:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pacote" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar pacote do aluno
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
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

    const { ra, id } = await params;
    const body = await req.json();
    const { data_inicio, data_fim, ativo } = body;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data_inicio !== undefined) {
      updates.push("data_inicio = ?");
      values.push(data_inicio);
    }
    if (data_fim !== undefined) {
      updates.push("data_fim = ?");
      values.push(data_fim);
    }
    if (ativo !== undefined) {
      updates.push("ativo = ?");
      values.push(ativo ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    values.push(id, ra);

    const sql = `UPDATE cant_pacotes_alunos SET ${updates.join(
      ", "
    )} WHERE id = ? AND ra_aluno = ?`;
    await query(sql, values);

    return NextResponse.json({
      success: true,
      message: "Pacote atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar pacote:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pacote" },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar pacote (inativar)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
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

    const { ra, id } = await params;

    await query(
      "UPDATE cant_pacotes_alunos SET ativo = 0 WHERE id = ? AND ra_aluno = ?",
      [id, ra]
    );

    // Registrar log
    await query(
      `INSERT INTO cant_log_acoes 
       (id_usuario, acao, tabela_afetada, registro_id) 
       VALUES (?, ?, ?, ?)`,
      [decoded.id, "CANCELAMENTO_PACOTE", "cant_pacotes_alunos", id]
    );

    return NextResponse.json({
      success: true,
      message: "Pacote cancelado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cancelar pacote:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar pacote" },
      { status: 500 }
    );
  }
}
