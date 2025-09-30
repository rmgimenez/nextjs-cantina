import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface ProcessamentoResultado {
  totalLinhas: number;
  contasCriadas: number;
  contasAtualizadas: number;
  erros: Array<{
    linha: number;
    ra: string;
    saldo: string;
    motivo: string;
  }>;
  alunosAfetados: Array<{
    ra: number;
    nome: string;
    saldoAnterior: number;
    saldoNovo: number;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = user.id;

    // Verificar se é administrador
    const userRows = (await query(
      `SELECT u.id, u.nome, p.nome as perfil_nome
       FROM cant_usuarios_cantina u
       INNER JOIN cant_perfis_acesso p ON u.id_perfil = p.id
       WHERE u.id = ?`,
      [userId]
    )) as any[];

    if (!userRows || userRows.length === 0 || userRows[0].perfil_nome !== 'ADMINISTRADOR') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem importar saldos.' },
        { status: 403 }
      );
    }

    // Obter dados do formulário
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const nomeArquivo = (formData.get('nomeArquivo') as string) || file?.name || 'arquivo.csv';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo foi enviado' }, { status: 400 });
    }

    // Ler conteúdo do arquivo
    const fileContent = await file.text();
    const linhas = fileContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const resultado: ProcessamentoResultado = {
      totalLinhas: linhas.length,
      contasCriadas: 0,
      contasAtualizadas: 0,
      erros: [],
      alunosAfetados: [],
    };

    // Processar cada linha
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];
      const numeroLinha = i + 1;

      // Separar RA e SALDO
      const partes = linha.split(';');

      if (partes.length !== 2) {
        resultado.erros.push({
          linha: numeroLinha,
          ra: linha,
          saldo: '',
          motivo: 'Formato inválido. Esperado: RA;SALDO',
        });
        continue;
      }

      const raStr = partes[0].trim();
      const saldoStr = partes[1].trim();

      // Validar RA (deve ser número)
      const ra = parseInt(raStr);
      if (isNaN(ra) || ra <= 0) {
        resultado.erros.push({
          linha: numeroLinha,
          ra: raStr,
          saldo: saldoStr,
          motivo: 'RA inválido. Deve ser um número inteiro positivo.',
        });
        continue;
      }

      // Validar SALDO (converter vírgula para ponto se necessário)
      const saldoNormalizado = saldoStr.replace(',', '.');
      const saldo = parseFloat(saldoNormalizado);
      if (isNaN(saldo)) {
        resultado.erros.push({
          linha: numeroLinha,
          ra: raStr,
          saldo: saldoStr,
          motivo: 'Saldo inválido. Deve ser um número válido.',
        });
        continue;
      }

      // Verificar se o aluno existe na view alunos
      const alunoRows = (await query('SELECT ra, nome FROM alunos WHERE ra = ?', [ra])) as any[];

      if (!alunoRows || alunoRows.length === 0) {
        resultado.erros.push({
          linha: numeroLinha,
          ra: raStr,
          saldo: saldoStr,
          motivo: 'Aluno não encontrado ou não está matriculado.',
        });
        continue;
      }

      const aluno = alunoRows[0];

      // Verificar se já existe conta para o aluno
      const contaRows = (await query(
        'SELECT id, saldo_atual FROM cant_contas_alunos WHERE ra_aluno = ? AND ativo = 1',
        [ra]
      )) as any[];

      let saldoAnterior = 0;
      let idConta: number;

      if (contaRows && contaRows.length > 0) {
        // Atualizar conta existente
        const conta = contaRows[0];
        idConta = conta.id;
        saldoAnterior = parseFloat(conta.saldo_atual);

        await query('UPDATE cant_contas_alunos SET saldo_atual = ? WHERE id = ?', [saldo, idConta]);

        resultado.contasAtualizadas++;
      } else {
        // Criar nova conta
        const insertResult = (await query(
          'INSERT INTO cant_contas_alunos (ra_aluno, saldo_atual, ativo) VALUES (?, ?, 1)',
          [ra, saldo]
        )) as any;

        idConta = insertResult.insertId;
        saldoAnterior = 0;

        resultado.contasCriadas++;
      }

      // Registrar movimentação de ajuste
      const diferenca = saldo - saldoAnterior;
      const tipoMovimentacao = diferenca >= 0 ? 'CREDITO' : 'DEBITO';
      const valorMovimentacao = Math.abs(diferenca);

      await query(
        `INSERT INTO cant_movimentacoes_alunos 
         (id_conta_aluno, tipo_movimentacao, valor, saldo_anterior, saldo_posterior, descricao, usuario)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          idConta,
          tipoMovimentacao,
          valorMovimentacao,
          saldoAnterior,
          saldo,
          `Importação de saldo via arquivo: ${nomeArquivo}`,
          userId,
        ]
      );

      // Adicionar aos alunos afetados
      resultado.alunosAfetados.push({
        ra: ra,
        nome: aluno.nome,
        saldoAnterior: saldoAnterior,
        saldoNovo: saldo,
      });
    }

    // Registrar log de auditoria
    const logData = {
      nomeArquivo: nomeArquivo,
      totalLinhas: resultado.totalLinhas,
      contasCriadas: resultado.contasCriadas,
      contasAtualizadas: resultado.contasAtualizadas,
      totalErros: resultado.erros.length,
      dataImportacao: new Date().toISOString(),
    };

    await query(
      `INSERT INTO cant_log_acoes 
       (id_usuario, acao, tabela_afetada, dados_novos)
       VALUES (?, ?, ?, ?)`,
      [userId, 'IMPORTACAO_SALDOS_ALUNOS', 'cant_contas_alunos', JSON.stringify(logData)]
    );

    return NextResponse.json({
      success: true,
      resultado: resultado,
    });
  } catch (error) {
    console.error('Erro ao importar saldos:', error);
    return NextResponse.json({ error: 'Erro ao processar importação de saldos' }, { status: 500 });
  }
}
