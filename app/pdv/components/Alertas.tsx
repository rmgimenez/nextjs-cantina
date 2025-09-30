import type { ResumoVenda } from '../types';

interface AlertasProps {
  msg: string;
  resumoVenda: ResumoVenda | null;
  onDismiss: () => void;
  onNovaVenda: () => void;
}

export function Alertas({ msg, resumoVenda, onDismiss, onNovaVenda }: AlertasProps) {
  if (!msg && !resumoVenda) return null;

  return (
    <>
      {msg && !resumoVenda && (
        <div className='alert alert-info alert-dismissible fade show' role='alert'>
          <strong>ℹ️ Atenção</strong> {msg}
          <button type='button' className='btn-close' onClick={onDismiss}></button>
        </div>
      )}

      {resumoVenda && (
        <div className='alert alert-success border-success mb-3'>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <h5 className='mb-2'>✓ Venda #{resumoVenda.id_venda} concluída!</h5>
              <div className='row g-2'>
                <div className='col-auto'>
                  <strong>Total:</strong> R$ {Number(resumoVenda.total).toFixed(2)}
                </div>
                {resumoVenda.desconto > 0 && (
                  <div className='col-auto'>
                    <strong>Desconto:</strong> R$ {Number(resumoVenda.desconto).toFixed(2)}
                  </div>
                )}
                {resumoVenda.cargo_aplicado && (
                  <div className='col-auto'>
                    <span className='badge bg-warning text-dark'>
                      Cargo: {resumoVenda.cargo_aplicado}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button className='btn btn-primary btn-lg' onClick={onNovaVenda}>
              Nova Venda
            </button>
          </div>
        </div>
      )}
    </>
  );
}
