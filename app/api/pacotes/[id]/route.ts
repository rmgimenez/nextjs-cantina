import { query } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

// GET - Buscar pacote específico
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const pacotes = await query(
      "SELECT * FROM cant_pacotes_alimentacao WHERE id = ?",
      [id]
    );

    if (!pacotes || pacotes.length === 0) {
      return NextResponse.json(
        { error: "Pacote não encontrado" },
        { status: 404 }
      );
    }

    interface PacoteRow {
      [key: string]: string | number | null | undefined;
      valor: string | number;
      quantidade_refeicoes: string | number;
      validade_dias?: string | number | null;
      ativo: string | number;
    }
    const pacote = pacotes[0] as PacoteRow;
    const pacoteFormatado = {
      ...pacote,
      valor:
        typeof pacote.valor === "number"
          ? pacote.valor
          : parseFloat(String(pacote.valor)),
      quantidade_refeicoes:
        typeof pacote.quantidade_refeicoes === "number"
          ? pacote.quantidade_refeicoes
          : parseInt(String(pacote.quantidade_refeicoes)),
      validade_dias: pacote.validade_dias
        ? typeof pacote.validade_dias === "number"
          ? pacote.validade_dias
          : parseInt(String(pacote.validade_dias))
        : null,
      ativo:
        typeof pacote.ativo === "number"
          ? pacote.ativo
          : parseInt(String(pacote.ativo)),
    };

    return NextResponse.json({ success: true, pacote: pacoteFormatado });
  } catch (error) {
    console.error("Erro ao buscar pacote:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pacote" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar pacote
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await req.json();
    const {
      nome,
      tipo_refeicao,
      descricao,
      quantidade_refeicoes,
      validade_dias,
      valor,
      dt_inicio_vigencia,
      dt_fim_vigencia,
      ativo,
    } = body;

    // Validações
    if (tipo_refeicao) {
      const tiposValidos = [
        "LANCHE_MANHA",
        "ALMOCO",
        "LANCHE_TARDE",
        "JANTAR",
        "PERSONALIZADO",
      ];
      if (!tiposValidos.includes(tipo_refeicao)) {
        return NextResponse.json(
          { error: "Tipo de refeição inválido" },
          { status: 400 }
        );
      }
    }

    if (quantidade_refeicoes !== undefined && quantidade_refeicoes <= 0) {
      return NextResponse.json(
        { error: "Quantidade de refeições deve ser maior que zero" },
        { status: 400 }
      );
    }

    if (valor !== undefined && valor <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser maior que zero" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (nome !== undefined) {
      updates.push("nome = ?");
      values.push(nome);
    }
    if (tipo_refeicao !== undefined) {
      updates.push("tipo_refeicao = ?");
      values.push(tipo_refeicao);
    }
    if (descricao !== undefined) {
      updates.push("descricao = ?");
      values.push(descricao);
    }
    if (quantidade_refeicoes !== undefined) {
      updates.push("quantidade_refeicoes = ?");
      values.push(quantidade_refeicoes);
    }
    if (validade_dias !== undefined) {
      updates.push("validade_dias = ?");
      values.push(validade_dias);
    }
    if (valor !== undefined) {
      updates.push("valor = ?");
      values.push(valor);
    }
    if (dt_inicio_vigencia !== undefined) {
      updates.push("dt_inicio_vigencia = ?");
      values.push(dt_inicio_vigencia);
    }
    if (dt_fim_vigencia !== undefined) {
      updates.push("dt_fim_vigencia = ?");
      values.push(dt_fim_vigencia);
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

    values.push(id);

    const sql = `UPDATE cant_pacotes_alimentacao SET ${updates.join(
      ", "
    )} WHERE id = ?`;
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

// DELETE - Inativar pacote (soft delete)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Verificar se existem pacotes ativos de alunos vinculados
    const pacotesAtivos = await query(
      `SELECT COUNT(*) as total FROM cant_pacotes_alunos 
       WHERE id_pacote = ? AND ativo = 1`,
      [id]
    );

    if (pacotesAtivos && pacotesAtivos[0]?.total > 0) {
      return NextResponse.json(
        {
          error: "Não é possível inativar pacote com contratos ativos",
          details: "Existem alunos com este pacote ativo",
        },
        { status: 400 }
      );
    }

    await query("UPDATE cant_pacotes_alimentacao SET ativo = 0 WHERE id = ?", [
      id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Pacote inativado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao inativar pacote:", error);
    return NextResponse.json(
      { error: "Erro ao inativar pacote" },
      { status: 500 }
    );
  }
}
