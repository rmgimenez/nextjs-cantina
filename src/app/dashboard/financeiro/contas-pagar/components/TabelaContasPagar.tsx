"use client";

import { ContaPagar } from "../types";

interface TabelaContasPagarProps {
  contas: ContaPagar[];
  onEditar: (conta: ContaPagar) => void;
  onExcluir: (conta: ContaPagar) => void;
  onPagar: (conta: ContaPagar) => void;
  onVerPagamentos: (conta: ContaPagar) => void;
}

export default function TabelaContasPagar({
  contas,
  onEditar,
  onExcluir,
  onPagar,
  onVerPagamentos,
}: TabelaContasPagarProps) {
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const getSituacaoBadge = (situacao: string, status: string) => {
    if (status === "PAGO") return "bg-success";
    if (status === "CANCELADO") return "bg-secondary";
    if (situacao.includes("Atrasado")) return "bg-danger";
    if (situacao.includes("Hoje")) return "bg-warning";
    if (situacao.includes("Semana")) return "bg-info";
    return "bg-primary";
  };

  if (contas.length === 0) {
    return <p className="text-muted text-center">Nenhuma conta encontrada</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Fornecedor</th>
            <th>Valor Original</th>
            <th>Valor Pendente</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contas.map((conta) => (
            <tr key={conta.id}>
              <td>{conta.descricao}</td>
              <td>{conta.fornecedor || "-"}</td>
              <td>{formatarMoeda(conta.valor_original)}</td>
              <td
                className={
                  conta.valor_pendente > 0
                    ? "text-danger fw-bold"
                    : "text-success"
                }
              >
                {formatarMoeda(conta.valor_pendente)}
              </td>
              <td>{formatarData(conta.data_vencimento)}</td>
              <td>
                <span
                  className={`badge ${
                    conta.status === "PAGO"
                      ? "bg-success"
                      : conta.status === "ATRASADO"
                      ? "bg-danger"
                      : conta.status === "CANCELADO"
                      ? "bg-secondary"
                      : "bg-warning"
                  }`}
                >
                  {conta.status}
                </span>
              </td>
              <td>
                <span
                  className={`badge ${getSituacaoBadge(
                    conta.situacao,
                    conta.status
                  )}`}
                >
                  {conta.situacao}
                </span>
              </td>
              <td>
                <div className="d-flex gap-1">
                  {conta.status !== "PAGO" && conta.status !== "CANCELADO" && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => onPagar(conta)}
                      title="Registrar Pagamento"
                    >
                      💰
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => onVerPagamentos(conta)}
                    title="Ver Pagamentos"
                  >
                    👁️
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => onEditar(conta)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onExcluir(conta)}
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
