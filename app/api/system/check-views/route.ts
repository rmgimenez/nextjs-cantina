import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/system/check-views - verifica e recria views se necessário
export async function GET() {
  try {
    const viewsToCheck = [
      "vw_cant_vendas_completa",
      "vw_cant_estoque_alertas",
      "vw_cant_contas_alunos_completa",
      "vw_cant_vendas_funcionarios",
      "vw_cant_contas_funcionarios",
    ];

    const missingViews: string[] = [];

    // Verifica se cada view existe
    for (const viewName of viewsToCheck) {
      try {
        await query(`SELECT 1 FROM ${viewName} LIMIT 1`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        missingViews.push(viewName);
      }
    }

    if (missingViews.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Views não encontradas no banco de dados",
          missingViews,
          message:
            "Execute o script bancodados.sql para criar as views necessárias",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Todas as views estão configuradas corretamente",
      views: viewsToCheck,
    });
  } catch (error) {
    console.error("Erro ao verificar views:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao conectar com o banco de dados",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
