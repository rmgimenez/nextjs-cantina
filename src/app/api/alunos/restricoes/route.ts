import { NextRequest, NextResponse } from 'next/server';

// Mock simples em memória para desenvolvimento local / testes.
// Em produção essa lógica deve chamar procedures ou DB via lib/db.
let _data: any[] = [
  { id: 1, aluno_ra: '12345', tipo: 'PRODUTO', referencia: 'ABC123', motivo: 'Alergia', ativo: 1 },
  {
    id: 2,
    aluno_ra: '12345',
    tipo: 'GERAL',
    referencia: null,
    motivo: 'Restrição médica',
    ativo: 1,
  },
];

function nextId() {
  return _data.length ? Math.max(..._data.map((d) => d.id)) + 1 : 1;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ra = url.searchParams.get('ra');
  if (ra) {
    const restricoes = _data.filter((r) => r.aluno_ra === ra);
    return NextResponse.json({ restricoes });
  }
  return NextResponse.json({ restricoes: _data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const item = {
    id: nextId(),
    aluno_ra: body.aluno_ra || '',
    tipo: body.tipo || 'GERAL',
    referencia: body.referencia || null,
    motivo: body.motivo || '',
    ativo: 1,
  };
  _data.push(item);
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get('id')) || 0;
  const idx = _data.findIndex((d) => d.id === id);
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });
  // marcar inativo
  _data[idx].ativo = 0;
  return NextResponse.json({ ok: true });
}
