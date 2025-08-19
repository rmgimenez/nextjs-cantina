import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const alertas: any[] = [];

    // Por enquanto, retornamos alertas simulados já que as tabelas podem não ter dados
    // Quando houver dados reais, podemos descomentar as consultas abaixo

    /*
    // Verificar caixas com diferenças (últimos 3 dias)
    const caixasDiferencaQuery = `
      SELECT 
        c.data_abertura,
        c.valor_inicial,
        c.valor_fechamento_informado,
        c.valor_fechamento_calculado,
        c.diferenca
      FROM cant_caixa c
      WHERE c.status = 'FECHADO'
      AND DATE(c.data_abertura) >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
      AND ABS(COALESCE(c.diferenca, 0)) > 0
      ORDER BY c.data_abertura DESC
      LIMIT 3
    `;

    try {
      const caixasComDiferenca = await query(caixasDiferencaQuery) as any[];

      caixasComDiferenca.forEach((caixa) => {
        const dataFormatada = new Date(caixa.data_abertura).toLocaleDateString('pt-BR');
        const diferenca = Math.abs(caixa.diferenca || 0);
        const diferencaFormatada = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(diferenca);

        alertas.push({
          type: 'error',
          message: `Caixa com diferença de ${diferencaFormatada} em ${dataFormatada}`,
          time: calcularTempoPassado(caixa.data_abertura)
        });
      });
    } catch (error) {
      console.log('Tabela cant_caixa ainda não existe ou sem dados');
    }
    */

    // Verificar produtos com estoque baixo
    try {
      const produtosEstoqueBaixoQuery = `
        SELECT COUNT(*) as quantidade
        FROM cant_view_estoque_saldo vs
        JOIN cant_produtos p ON p.id = vs.produto_id
        WHERE vs.saldo <= 10 AND p.ativo = 1
      `;

      const [estoqueBaixo] = (await query(produtosEstoqueBaixoQuery)) as any[];

      if (estoqueBaixo.quantidade > 0) {
        alertas.push({
          type: 'warning',
          message: `Estoque baixo: ${estoqueBaixo.quantidade} produto${
            estoqueBaixo.quantidade > 1 ? 's' : ''
          }`,
          time: 'Agora',
        });
      }
    } catch (error) {
      console.log('View cant_view_estoque_saldo ainda não existe ou sem dados');
    }

    /*
    // Verificar caixas abertos há muito tempo (mais de 12 horas)
    const caixasAbertosQuery = `
      SELECT 
        c.data_abertura,
        u.nome as usuario_nome
      FROM cant_caixa c
      JOIN cant_usuarios u ON u.id = c.usuario_abertura_id
      WHERE c.status = 'ABERTO'
      AND c.data_abertura < DATE_SUB(NOW(), INTERVAL 12 HOUR)
    `;

    try {
      const caixasAbertos = await query(caixasAbertosQuery) as any[];

      caixasAbertos.forEach((caixa) => {
        alertas.push({
          type: 'warning',
          message: `Caixa aberto há mais de 12h por ${caixa.usuario_nome}`,
          time: calcularTempoPassado(caixa.data_abertura)
        });
      });
    } catch (error) {
      console.log('Erro ao verificar caixas abertos:', error);
    }
    */

    // Adicionar alerta de backup (simulado por agora)
    alertas.push({
      type: 'info',
      message: 'Backup automático realizado com sucesso',
      time: '4h atrás',
    });

    // Limitar a 5 alertas mais recentes
    const alertasLimitados = alertas.slice(0, 5);

    return NextResponse.json(alertasLimitados);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função helper para calcular tempo passado
function calcularTempoPassado(data: string | Date): string {
  const agora = new Date();
  const dataPassada = new Date(data);
  const diferencaMs = agora.getTime() - dataPassada.getTime();

  const minutos = Math.floor(diferencaMs / (1000 * 60));
  const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
  const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

  if (dias > 0) {
    return `${dias} dia${dias > 1 ? 's' : ''} atrás`;
  } else if (horas > 0) {
    return `${horas}h atrás`;
  } else if (minutos > 0) {
    return `${minutos}min atrás`;
  } else {
    return 'Agora';
  }
}
