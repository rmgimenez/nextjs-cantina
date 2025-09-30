import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FuncionarioCantina {
  id: number;
  nome: string;
  usuario: string;
  senha: string;
  email: string;
  telefone: string;
  id_perfil: number;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
  criado_por: number;
}

// GET - Listar funcionários da cantina
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const perfil = url.searchParams.get('perfil');
    const ativo = url.searchParams.get('ativo');

    let sql = `
      SELECT fc.*, pa.nome as perfil_nome
      FROM cant_usuarios_cantina fc
      INNER JOIN cant_perfis_acesso pa ON fc.id_perfil = pa.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search) {
      sql += ` AND (fc.nome LIKE ? OR fc.usuario LIKE ? OR fc.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (perfil) {
      sql += ` AND fc.id_perfil = ?`;
      params.push(perfil);
    }

    if (ativo !== null) {
      sql += ` AND fc.ativo = ?`;
      params.push(ativo);
    }

    sql += ` ORDER BY fc.nome ASC`;

    const rows = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo funcionário da cantina
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, usuario, senha, email, telefone, id_perfil } = body;

    // Validações
    if (!nome || !usuario || !senha || !id_perfil) {
      return NextResponse.json(
        { error: 'Nome, usuário, senha e perfil são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar força da senha
    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existingUser = await query('SELECT id FROM cant_usuarios_cantina WHERE usuario = ?', [
      usuario,
    ]);

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 });
    }

    // Verificar se perfil existe
    const perfilExists = await query(
      'SELECT id FROM cant_perfis_acesso WHERE id = ? AND ativo = 1',
      [id_perfil]
    );

    if (!perfilExists || perfilExists.length === 0) {
      return NextResponse.json({ error: 'Perfil de acesso inválido' }, { status: 400 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 12);

    // Inserir funcionário
    await query(
      `INSERT INTO cant_usuarios_cantina
       (nome, usuario, senha, email, telefone, id_perfil, ativo, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
      [nome, usuario, hashedPassword, email || null, telefone || null, id_perfil]
    );

    // Buscar dados do funcionário criado
    const newFuncionario = await query(
      `SELECT fc.*, pa.nome as perfil_nome
       FROM cant_usuarios_cantina fc
       INNER JOIN cant_perfis_acesso pa ON fc.id_perfil = pa.id
       WHERE fc.id = LAST_INSERT_ID()`,
      []
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Funcionário criado com sucesso',
        data: newFuncionario[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
