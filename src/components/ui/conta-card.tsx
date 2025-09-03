import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ContaCardProps {
  id: number | string;
  descricao: string;
  categoria?: string;
  documento?: string;
  participante?: string; // fornecedor ou cliente
  valor_original?: number;
  valor_pendente?: number;
  data_emissao?: string;
  data_vencimento?: string;
  situacao?: string;
  status?: string;
  onEditar?: () => void;
  onExcluir?: () => void;
  onAcaoPrincipal?: () => void; // Pagar ou Receber
  onVerLancamentos?: () => void; // ver pagamentos/recebimentos
}

export default function ContaCard({
  descricao,
  categoria,
  documento,
  participante,
  valor_original,
  valor_pendente,
  data_emissao,
  data_vencimento,
  situacao,
  status,
  onEditar,
  onExcluir,
  onAcaoPrincipal,
  onVerLancamentos,
}: ContaCardProps) {
  const fmt = (v?: number) => (typeof v === 'number' ? formatarMoeda(v) : '-');

  const fmtDate = (d?: string) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <Card className='mb-3' padding='medium' shadow='small'>
      <CardHeader>
        <div className='d-flex justify-content-between align-items-start'>
          <div>
            <CardTitle>{descricao}</CardTitle>
            <div className='text-muted small'>
              {categoria && <span className='me-2'>{categoria}</span>}
              {documento && <span className='me-2'>• {documento}</span>}
              {participanteDisplay(participante)}
            </div>
          </div>
          <div className='text-end'>
            <div className='fw-bold'>{fmt(valor_pendente ?? valor_original)}</div>
            <div className='small text-muted'>{status || situacao || ''}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='row gy-2'>
          <div className='col-6 col-sm-4'>
            <div className='small text-muted'>Emissão</div>
            <div>{fmtDate(data_emissao)}</div>
          </div>
          <div className='col-6 col-sm-4'>
            <div className='small text-muted'>Vencimento</div>
            <div>{fmtDate(data_vencimento)}</div>
          </div>
          <div className='col-12 col-sm-4'>
            <div className='small text-muted'>Valor original</div>
            <div>{fmt(valor_original)}</div>
          </div>
        </div>

        <div className='d-flex gap-2 mt-3'>
          {onAcaoPrincipal && (
            <Button onClick={onAcaoPrincipal} className='btn btn-primary btn-sm'>
              {valor_pendente && valor_pendente > 0 ? 'Pagar/Receber' : 'Registrar'}
            </Button>
          )}
          {onVerLancamentos && (
            <Button
              onClick={onVerLancamentos}
              variant='outline'
              className='btn btn-outline-secondary btn-sm'
            >
              Ver Lançamentos
            </Button>
          )}
          {onEditar && (
            <Button
              onClick={onEditar}
              variant='outline'
              className='btn btn-outline-secondary btn-sm'
            >
              Editar
            </Button>
          )}
          {onExcluir && (
            <Button onClick={onExcluir} variant='outline' className='btn btn-outline-danger btn-sm'>
              Excluir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function participanteDisplay(p?: string) {
  if (!p) return null;
  return <span className='text-truncate' style={{ maxWidth: 240 }}>{`• ${p}`}</span>;
}
