import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET - Buscar fornecedor específico
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const rows = await query(
      `SELECT f.*, uc.nome as criado_por_nome
       FROM cant_fornecedores f
       LEFT JOIN cant_usuarios_cantina uc ON f.criado_por = uc.id
       WHERE f.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar fornecedor
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      nome,
      razao_social,
      cnpj,
      cpf,
      endereco,
      telefone,
      email,
      contato,
      ativo,
    } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se fornecedor existe
    const existingFornecedor = await query(
      "SELECT * FROM cant_fornecedores WHERE id = ?",
      [id]
    );

    if (!existingFornecedor || existingFornecedor.length === 0) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 }
      );
    }

    // Validações
    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Validar CNPJ se fornecido
    if (cnpj && !validarCNPJ(cnpj)) {
      return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
    }

    // Validar CPF se fornecido
    if (cpf && !validarCPF(cpf)) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    // Verificar se CNPJ já existe (exceto para o próprio fornecedor)
    if (cnpj) {
      const existingCNPJ = await query(
        "SELECT id FROM cant_fornecedores WHERE cnpj = ? AND id != ? AND ativo = 1",
        [cnpj.replace(/\D/g, ""), id]
      );

      if (existingCNPJ && existingCNPJ.length > 0) {
        return NextResponse.json(
          { error: "Já existe um fornecedor ativo com este CNPJ" },
          { status: 400 }
        );
      }
    }

    // Verificar se CPF já existe (exceto para o próprio fornecedor)
    if (cpf) {
      const existingCPF = await query(
        "SELECT id FROM cant_fornecedores WHERE cpf = ? AND id != ? AND ativo = 1",
        [cpf.replace(/\D/g, ""), id]
      );

      if (existingCPF && existingCPF.length > 0) {
        return NextResponse.json(
          { error: "Já existe um fornecedor ativo com este CPF" },
          { status: 400 }
        );
      }
    }

    // Atualizar fornecedor
    await query(
      `UPDATE cant_fornecedores
       SET nome = ?, razao_social = ?, cnpj = ?, cpf = ?, endereco = ?, telefone = ?, email = ?, contato = ?, ativo = ?
       WHERE id = ?`,
      [
        nome.trim(),
        razao_social?.trim() || null,
        cnpj ? cnpj.replace(/\D/g, "") : null,
        cpf ? cpf.replace(/\D/g, "") : null,
        endereco?.trim() || null,
        telefone?.trim() || null,
        email?.trim() || null,
        contato?.trim() || null,
        ativo ? 1 : 0,
        id,
      ]
    );

    // Buscar dados atualizados
    const updatedFornecedor = await query(
      `SELECT f.*, uc.nome as criado_por_nome
       FROM cant_fornecedores f
       LEFT JOIN cant_usuarios_cantina uc ON f.criado_por = uc.id
       WHERE f.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Fornecedor atualizado com sucesso",
      data: updatedFornecedor[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir fornecedor (soft delete - desativar)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se fornecedor existe
    const existingFornecedor = await query(
      "SELECT * FROM cant_fornecedores WHERE id = ?",
      [id]
    );

    if (!existingFornecedor || existingFornecedor.length === 0) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se existem contas a pagar vinculadas a este fornecedor
    const contasVinculadas = (await query(
      "SELECT COUNT(*) as count FROM cant_contas_pagar WHERE id_fornecedor = ? AND status != 'PAGO'",
      [id]
    )) as { count: number }[];

    if (contasVinculadas && contasVinculadas.length > 0) {
      const count = Number(contasVinculadas[0].count) || 0;
      if (count > 0) {
        return NextResponse.json(
          {
            error:
              "Não é possível excluir este fornecedor pois existem contas a pagar pendentes vinculadas a ele. Desative-o ao invés de excluir.",
          },
          { status: 400 }
        );
      }
    }

    // Desativar fornecedor (soft delete)
    await query("UPDATE cant_fornecedores SET ativo = 0 WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Fornecedor desativado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir fornecedor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para validar CNPJ
function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

  // Calcular primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cnpjLimpo[12])) return false;

  // Calcular segundo dígito verificador
  soma = 0;
  peso = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cnpjLimpo[13])) return false;

  return true;
}

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;

  // Calcular primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cpfLimpo[9])) return false;

  // Calcular segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cpfLimpo[10])) return false;

  return true;
}
