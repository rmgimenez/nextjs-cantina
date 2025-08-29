import { COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function ensureAuth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifySessionToken(token);
  return payload as any;
}

export async function GET(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ATENDENTE', 'ESTOQUISTA'].includes(user.tipo)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const busca = url.searchParams.get('q');
    const tipo = url.searchParams.get('tipo'); // 'aluno' ou 'funcionario'

    if (!busca || busca.length < 2) {
      return NextResponse.json(
        { error: 'Busca deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }

    let resultado: any = { clientes: [] };

    // Buscar alunos
    if (!tipo || tipo === 'aluno') {
      try {
        const alunosSql = `
          SELECT 
            a.ra,
            a.nome,
            COALESCE(mc.curso, '') as curso,
            COALESCE(mc.serie, '') as serie,
            COALESCE(mc.turma, '') as turma,
            COALESCE(vs.saldo, 0) as saldo,
            COALESCE(obs.observacao, '') as observacao
          FROM cadastro_alunos a
          LEFT JOIN matricula_cursos mc ON mc.ra = a.ra AND mc.ativo = 1
          LEFT JOIN cant_view_aluno_saldo vs ON vs.aluno_ra = a.ra
          LEFT JOIN cant_aluno_observacao obs ON obs.aluno_ra = a.ra AND obs.ativo = 1
          WHERE (a.ra = ? OR a.nome LIKE ?)
          ORDER BY a.nome
          LIMIT 10
        `;

        const isNumeric = /^\d+$/.test(busca);
        const alunosParams = isNumeric ? [parseInt(busca), `%${busca}%`] : [0, `%${busca}%`];
        const alunos = await query(alunosSql, alunosParams);

        resultado.clientes.push(
          ...alunos.map((a: any) => ({
            tipo: 'aluno',
            id: a.ra,
            nome: a.nome,
            curso: a.curso,
            serie: a.serie,
            turma: a.turma,
            saldo: parseFloat(a.saldo || 0),
            observacao: a.observacao,
            fotoUrl: `https://sistema.santanna.g12.br/carometr/${a.ra}.jpg`,
          }))
        );
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      }
    }

    // Buscar funcionários da escola
    if (!tipo || tipo === 'funcionario') {
      try {
        const funcionariosSql = `
          SELECT 
            f.codigo,
            f.nome,
            f.cargo,
            COALESCE(pc.preco, 0) as preco_refeicao
          FROM funcionarios f
          LEFT JOIN cant_preco_cargo pc ON pc.cargo = f.cargo
          WHERE (f.codigo = ? OR f.nome LIKE ?)
          AND f.ativo = 1
          ORDER BY f.nome
          LIMIT 10
        `;

        const isNumeric = /^\d+$/.test(busca);
        const funcionariosParams = isNumeric ? [parseInt(busca), `%${busca}%`] : [0, `%${busca}%`];
        const funcionarios = await query(funcionariosSql, funcionariosParams);

        resultado.clientes.push(
          ...funcionarios.map((f: any) => ({
            tipo: 'funcionario',
            id: f.codigo,
            nome: f.nome,
            cargo: f.cargo,
            precoRefeicao: parseFloat(f.preco_refeicao || 0),
          }))
        );
      } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
      }
    }

    return NextResponse.json({ ok: true, ...resultado });
  } catch (error) {
    console.error('GET /api/pdv/clientes', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
