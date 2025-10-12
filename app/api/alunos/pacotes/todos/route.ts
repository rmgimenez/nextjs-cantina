import { query } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

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

    interface PacoteRow {
      [key: string]: string | number | null | undefined;
      quantidade_total: string | number;
      quantidade_utilizada: string | number;
      quantidade_restante: string | number;
      ativo: string | number;
      pacote_valor: string | number;
      serie: string | number;
    }
    const pacotes = await query(sql);

    // Garantir que valores numéricos sejam números e não strings
    const pacotesFormatados = (pacotes as PacoteRow[]).map((pacote) => ({
      ...pacote,
      quantidade_total:
        typeof pacote.quantidade_total === "number"
          ? pacote.quantidade_total
          : parseInt(String(pacote.quantidade_total)),
      quantidade_utilizada:
        typeof pacote.quantidade_utilizada === "number"
          ? pacote.quantidade_utilizada
          : parseInt(String(pacote.quantidade_utilizada)),
      quantidade_restante:
        typeof pacote.quantidade_restante === "number"
          ? pacote.quantidade_restante
          : parseInt(String(pacote.quantidade_restante)),
      ativo:
        typeof pacote.ativo === "number"
          ? pacote.ativo
          : parseInt(String(pacote.ativo)),
      pacote_valor:
        typeof pacote.pacote_valor === "number"
          ? pacote.pacote_valor
          : parseFloat(String(pacote.pacote_valor)),
      serie:
        typeof pacote.serie === "number"
          ? pacote.serie
          : parseInt(String(pacote.serie)),
    }));

    return NextResponse.json({
      success: true,
      pacotes: pacotesFormatados || [],
    });
  } catch (error) {
    console.error("Erro ao buscar pacotes de alunos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pacotes de alunos" },
      { status: 500 }
    );
  }
}
