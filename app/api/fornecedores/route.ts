import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Fornecedor {
  id: number;
  nome: string;
  razao_social: string;
  cnpj: string;
  cpf: string;
  endereco: string;
  telefone: string;
  email: string;
  contato: string;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
  criado_por: number;
}

// GET - Listar fornecedores
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const ativo = url.searchParams.get('ativo');

    let sql = `
      SELECT f.*, uc.nome as criado_por_nome
      FROM cant_fornecedores f
      LEFT JOIN cant_usuarios_cantina uc ON f.criado_por = uc.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search) {
      sql += ` AND (f.nome LIKE ? OR f.razao_social LIKE ? OR f.cnpj LIKE ? OR f.cpf LIKE ? OR f.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (ativo !== null) {
      sql += ` AND f.ativo = ?`;
      params.push(ativo);
    }

    sql += ` ORDER BY f.nome ASC`;

    const rows = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo fornecedor
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, razao_social, cnpj, cpf, endereco, telefone, email, contato } = body;

    // Validações
    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // Validar CNPJ se fornecido
    if (cnpj && !validarCNPJ(cnpj)) {
      return NextResponse.json({ error: 'CNPJ inválido' }, { status: 400 });
    }

    // Validar CPF se fornecido
    if (cpf && !validarCPF(cpf)) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 });
    }

    // Verificar se CNPJ já existe
    if (cnpj) {
      const existingCNPJ = await query(
        'SELECT id FROM cant_fornecedores WHERE cnpj = ? AND ativo = 1',
        [cnpj.replace(/\D/g, '')]
      );

      if (existingCNPJ && existingCNPJ.length > 0) {
        return NextResponse.json(
          { error: 'Já existe um fornecedor ativo com este CNPJ' },
          { status: 400 }
        );
      }
    }

    // Verificar se CPF já existe
    if (cpf) {
      const existingCPF = await query(
        'SELECT id FROM cant_fornecedores WHERE cpf = ? AND ativo = 1',
        [cpf.replace(/\D/g, '')]
      );

      if (existingCPF && existingCPF.length > 0) {
        return NextResponse.json(
          { error: 'Já existe um fornecedor ativo com este CPF' },
          { status: 400 }
        );
      }
    }

    // Inserir fornecedor
    await query(
      `INSERT INTO cant_fornecedores
       (nome, razao_social, cnpj, cpf, endereco, telefone, email, contato, ativo, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [
        nome.trim(),
        razao_social?.trim() || null,
        cnpj ? cnpj.replace(/\D/g, '') : null,
        cpf ? cpf.replace(/\D/g, '') : null,
        endereco?.trim() || null,
        telefone?.trim() || null,
        email?.trim() || null,
        contato?.trim() || null,
      ]
    );

    // Buscar dados do fornecedor criado
    const newFornecedor = await query(
      `SELECT f.*, uc.nome as criado_por_nome
       FROM cant_fornecedores f
       LEFT JOIN cant_usuarios_cantina uc ON f.criado_por = uc.id
       WHERE f.id = LAST_INSERT_ID()`,
      []
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Fornecedor criado com sucesso',
        data: newFornecedor[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função para validar CNPJ
function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, '');

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
  const cpfLimpo = cpf.replace(/\D/g, '');

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
