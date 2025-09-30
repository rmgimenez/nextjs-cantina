interface HeaderBarProps {
  onNovaConta: () => void;
}

export function HeaderBar({ onNovaConta }: HeaderBarProps) {
  return (
    <div className='d-flex justify-content-between align-items-center mb-4'>
      <div>
        <h1 className='h3 mb-0'>Contas de Funcionários</h1>
        <p className='text-muted'>
          Configure limites de crédito e acompanhe o consumo dos funcionários da escola.
        </p>
      </div>
      <button className='btn btn-primary' onClick={onNovaConta}>
        Nova conta
      </button>
    </div>
  );
}
