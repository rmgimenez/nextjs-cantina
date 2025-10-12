import { query } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

// GET - Listar todos os pacotes de alimentação
export async function GET(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Buscar parâmetros de filtro
    const { searchParams } = new URL(req.url);
    const ativo = searchParams.get("ativo");
    const tipo = searchParams.get("tipo");

    let sql = "SELECT * FROM cant_pacotes_alimentacao WHERE 1=1";
    const params: (string | number)[] = [];

    if (ativo !== null) {
      sql += " AND ativo = ?";
      params.push(ativo === "true" ? 1 : 0);
    }

    if (tipo) {
      sql += " AND tipo_refeicao = ?";
      params.push(tipo);
    }

    sql += " ORDER BY nome";

    const pacotes = await query(sql, params);

    // Garantir que valores numéricos sejam números e não strings
    interface PacoteRow {
      [key: string]: string | number | null | undefined;
      valor: string | number;
      quantidade_refeicoes: string | number;
      validade_dias?: string | number | null;
      ativo: string | number;
    }
    const pacotesFormatados = (pacotes as PacoteRow[]).map((pacote) => ({
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
    }));

    return NextResponse.json({ success: true, pacotes: pacotesFormatados });
  } catch (error) {
    console.error("Erro ao buscar pacotes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pacotes" },
      { status: 500 }
    );
  }
}

// POST - Criar novo pacote de alimentação
export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

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
    } = body;

    // Validações
    if (!nome || !tipo_refeicao || !quantidade_refeicoes || !valor) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios: nome, tipo_refeicao, quantidade_refeicoes, valor",
        },
        { status: 400 }
      );
    }

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

    if (quantidade_refeicoes <= 0) {
      return NextResponse.json(
        { error: "Quantidade de refeições deve ser maior que zero" },
        { status: 400 }
      );
    }

    if (valor <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser maior que zero" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO cant_pacotes_alimentacao 
      (nome, tipo_refeicao, descricao, quantidade_refeicoes, validade_dias, valor, 
       dt_inicio_vigencia, dt_fim_vigencia, criado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    interface InsertResult {
      insertId: number;
    }
    const result = (await query(sql, [
      nome,
      tipo_refeicao,
      descricao || null,
      quantidade_refeicoes,
      validade_dias || null,
      valor,
      dt_inicio_vigencia || null,
      dt_fim_vigencia || null,
      decoded.id,
    ])) as unknown as InsertResult;

    return NextResponse.json({
      success: true,
      message: "Pacote criado com sucesso",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao criar pacote:", error);
    return NextResponse.json(
      { error: "Erro ao criar pacote" },
      { status: 500 }
    );
  }
}
