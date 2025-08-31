import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function ensureAuth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const payload = await verifySessionToken(token);
  return payload as any;
}

interface ItemVenda {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

interface DadosVenda {
  tipoComprador: "ALUNO" | "FUNCIONARIO_ESCOLA" | "AVULSA";
  compradorId?: number; // RA do aluno ou código do funcionário
  formaPagamento:
    | "DINHEIRO"
    | "CARTAO"
    | "SALDO_ALUNO"
    | "CONTA_FUNCIONARIO"
    | "PACOTE";
  itens: ItemVenda[];
  observacao?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !["ADMIN", "ATENDENTE"].includes(user.tipo)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const dados: DadosVenda = await req.json();

    // Validações mínimas antes de delegar à procedure
    if (!dados.itens || dados.itens.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }
    if (
      !["ALUNO", "FUNCIONARIO_ESCOLA", "AVULSA"].includes(dados.tipoComprador)
    ) {
      return NextResponse.json(
        { error: "Tipo de comprador inválido" },
        { status: 400 }
      );
    }
    if (
      (dados.tipoComprador === "ALUNO" ||
        dados.tipoComprador === "FUNCIONARIO_ESCOLA") &&
      !dados.compradorId
    ) {
      return NextResponse.json(
        { error: "ID do comprador é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se existe caixa aberto
    const caixaAberto = await query(
      'SELECT id FROM cant_caixa WHERE status = "ABERTO" ORDER BY data_abertura DESC LIMIT 1'
    );

    if (caixaAberto.length === 0) {
      return NextResponse.json(
        {
          error: "Não há caixa aberto. Abra o caixa antes de realizar vendas.",
        },
        { status: 400 }
      );
    }

    const caixaId = caixaAberto[0].id;

    // Selecionar pacote válido se necessário (a procedure validará novamente)
    let pacoteId: number | null = null;
    if (dados.tipoComprador === "ALUNO" && dados.formaPagamento === "PACOTE") {
      const pacotes = await query<any[]>(
        `SELECT pa.id
           FROM cant_pacote_aluno pa
           WHERE pa.aluno_ra=? AND pa.status='ATIVO' AND pa.data_inicio <= CURDATE() AND pa.data_fim >= CURDATE() AND pa.usos_restantes > 0
           ORDER BY pa.id ASC LIMIT 1`,
        [dados.compradorId]
      );
      if (!pacotes.length) {
        return NextResponse.json(
          { error: "Nenhum pacote ativo disponível" },
          { status: 400 }
        );
      }
      pacoteId = pacotes[0].id;
    }

    // Montar string de itens no formato esperado pela procedure: prod,qtd,preco;prod,qtd,preco;
    const itensFmt =
      dados.itens
        .map(
          (i) =>
            `${i.produtoId},${Number(i.quantidade).toString()},${Number(
              i.precoUnitario
            ).toFixed(2)}`
        )
        .join(";") + ";";

    try {
      const rows: any = await query(
        "CALL cant_sp_realiza_venda(?,?,?,?,?,?,?,?,?,?)",
        [
          user.id,
          caixaId,
          dados.tipoComprador,
          dados.tipoComprador === "ALUNO" ? dados.compradorId : null,
          dados.tipoComprador === "FUNCIONARIO_ESCOLA"
            ? dados.compradorId
            : null,
          dados.formaPagamento,
          pacoteId,
          0, // desconto (placeholder)
          dados.observacao || null,
          itensFmt,
        ]
      );

      // mysql2 retorna: [ [ resultRow ], otherMeta ] – nosso helper devolve primeiro recordset
      const resultRow = Array.isArray(rows) ? rows[0] : rows;
      const vendaId = resultRow?.venda_id;
      const valorTotal = resultRow?.valor_liquido;

      return NextResponse.json({
        ok: true,
        vendaId,
        valorTotal,
        message: "Venda realizada com sucesso!",
      });
    } catch (err: any) {
      // Erros sinalizados pela procedure usam SQLSTATE '45000'
      const msg = err?.message || "Erro ao processar venda";
      // Heurística: se for erro de validação de negócio retornar 400
      if (
        msg.includes("Saldo") ||
        msg.includes("Pacote") ||
        msg.includes("Estoque") ||
        msg.includes("Produto") ||
        msg.includes("Tipo") ||
        msg.includes("Aluno") ||
        msg.includes("Funcionário")
      ) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      console.error("Erro procedure cant_sp_realiza_venda", err);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  } catch (error) {
    console.error("POST /api/pdv/vendas", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
