import { query } from '@/lib/db';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NextRequest, NextResponse } from 'next/server';

interface FaturaRelatorio {
  codigo_funcionario: number;
  funcionario_nome: string;
  cargo: string;
  mes_referencia: string;
  valor_total: number;
  quantidade_itens: number;
  status: string;
  dt_vencimento: string;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mesInicio = searchParams.get('mesInicio');
    const mesFim = searchParams.get('mesFim');
    const codigoFuncionario = searchParams.get('codigoFuncionario');
    const status = searchParams.get('status');

    // Construir query com filtros
    let sql = `
      SELECT 
        f.id,
        f.codigo_funcionario,
        func.nome AS funcionario_nome,
        func.cargo,
        f.mes_referencia,
        f.valor_total,
        f.quantidade_itens,
        f.status,
        DATE_FORMAT(f.dt_vencimento, '%d/%m/%Y') AS dt_vencimento,
        DATE_FORMAT(f.dt_criacao, '%d/%m/%Y') AS dt_criacao
      FROM cant_faturas_funcionarios f
      LEFT JOIN funcionarios func ON f.codigo_funcionario = func.codigo
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (mesInicio) {
      sql += ` AND f.mes_referencia >= ?`;
      params.push(mesInicio);
    }

    if (mesFim) {
      sql += ` AND f.mes_referencia <= ?`;
      params.push(mesFim);
    }

    if (codigoFuncionario) {
      sql += ` AND f.codigo_funcionario = ?`;
      params.push(codigoFuncionario);
    }

    if (status) {
      sql += ` AND f.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY f.mes_referencia DESC, func.nome ASC`;

    const faturas = (await query(sql, params)) as FaturaRelatorio[];

    if (!faturas || faturas.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma fatura encontrada para os filtros selecionados' },
        { status: 404 }
      );
    }

    // Criar PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Cabeçalho
    doc.setFontSize(18);
    doc.setTextColor(37, 50, 135); // Azul principal
    doc.text('Relatório de Faturas - Departamento Pessoal', pageWidth / 2, 20, {
      align: 'center',
    });

    // Informações do relatório
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let yPos = 35;

    if (mesInicio && mesFim) {
      doc.text(
        `Período: ${formatMesReferencia(mesInicio)} a ${formatMesReferencia(mesFim)}`,
        14,
        yPos
      );
      yPos += 5;
    } else if (mesInicio) {
      doc.text(`A partir de: ${formatMesReferencia(mesInicio)}`, 14, yPos);
      yPos += 5;
    } else if (mesFim) {
      doc.text(`Até: ${formatMesReferencia(mesFim)}`, 14, yPos);
      yPos += 5;
    }

    if (codigoFuncionario) {
      const func = faturas[0];
      doc.text(`Funcionário: ${func.funcionario_nome} (${func.cargo})`, 14, yPos);
      yPos += 5;
    }

    if (status) {
      doc.text(`Status: ${formatStatus(status)}`, 14, yPos);
      yPos += 5;
    }

    doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, yPos);
    yPos += 10;

    // Agrupar faturas por funcionário e mês
    const faturasAgrupadas = agruparFaturas(faturas);

    // Calcular totais
    const totalGeral = faturas.reduce((sum, f) => sum + Number(f.valor_total), 0);
    const totalFuncionarios = new Set(faturas.map((f) => f.codigo_funcionario)).size;

    // Preparar dados da tabela
    const tableData: (
      | string
      | { content: string; colSpan?: number; styles?: Record<string, unknown> }
    )[][] = [];

    faturasAgrupadas.forEach((grupo) => {
      // Linha de cabeçalho do funcionário
      tableData.push([
        {
          content: `${grupo.funcionario_nome} - ${grupo.cargo}`,
          colSpan: 5,
          styles: {
            fillColor: [37, 50, 135],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11,
          },
        },
      ]);

      // Faturas do funcionário
      grupo.faturas.forEach((fatura) => {
        tableData.push([
          formatMesReferencia(fatura.mes_referencia),
          fatura.quantidade_itens.toString(),
          `R$ ${Number(fatura.valor_total).toFixed(2)}`,
          formatStatus(fatura.status),
          fatura.dt_vencimento,
        ]);
      });

      // Subtotal do funcionário
      tableData.push([
        {
          content: 'Subtotal',
          colSpan: 2,
          styles: {
            fontStyle: 'bold',
            halign: 'right',
          },
        },
        {
          content: `R$ ${grupo.subtotal.toFixed(2)}`,
          styles: {
            fontStyle: 'bold',
            fillColor: [240, 240, 240],
          },
        },
        '',
        '',
      ]);

      // Linha em branco
      tableData.push(['', '', '', '', '']);
    });

    // Tabela
    autoTable(doc, {
      head: [['Mês', 'Itens', 'Valor Total', 'Status', 'Vencimento']],
      body: tableData,
      startY: yPos,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [178, 0, 0], // Vermelho principal
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 35 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'center', cellWidth: 35 },
        4: { halign: 'center', cellWidth: 35 },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });

    // Resumo final
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont('', 'bold');
    doc.text('RESUMO DO RELATÓRIO', 14, finalY);

    doc.setFontSize(10);
    doc.setFont('', 'normal');
    doc.text(`Total de funcionários: ${totalFuncionarios}`, 14, finalY + 7);
    doc.text(`Total de faturas: ${faturas.length}`, 14, finalY + 12);

    doc.setFont('', 'bold');
    doc.setFontSize(12);
    doc.text(`VALOR TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`, 14, finalY + 20);

    // Rodapé
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'Sistema de Controle de Cantina Escolar',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Gerar PDF como buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-faturas-${new Date().getTime()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatório PDF' }, { status: 500 });
  }
}

// Funções auxiliares
function formatMesReferencia(mes: string): string {
  const [ano, mesNum] = mes.split('-');
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${meses[parseInt(mesNum) - 1]}/${ano}`;
}

function formatStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    GERADA: 'Gerada',
    ENVIADA: 'Enviada',
    PAGA: 'Paga',
    VENCIDA: 'Vencida',
    PARCIAL: 'Paga Parcialmente',
  };
  return statusMap[status] || status;
}

interface FaturaAgrupada {
  codigo_funcionario: number;
  funcionario_nome: string;
  cargo: string;
  faturas: FaturaRelatorio[];
  subtotal: number;
}

function agruparFaturas(faturas: FaturaRelatorio[]): FaturaAgrupada[] {
  const grupos = new Map<number, FaturaAgrupada>();

  faturas.forEach((fatura) => {
    if (!grupos.has(fatura.codigo_funcionario)) {
      grupos.set(fatura.codigo_funcionario, {
        codigo_funcionario: fatura.codigo_funcionario,
        funcionario_nome: fatura.funcionario_nome,
        cargo: fatura.cargo,
        faturas: [],
        subtotal: 0,
      });
    }

    const grupo = grupos.get(fatura.codigo_funcionario)!;
    grupo.faturas.push(fatura);
    grupo.subtotal += Number(fatura.valor_total);
  });

  return Array.from(grupos.values());
}
