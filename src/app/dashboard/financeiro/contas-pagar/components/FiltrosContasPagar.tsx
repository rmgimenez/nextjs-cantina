"use client";

import { FiltrosContas, CategoriaFinanceira } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface FiltrosContasPagarProps {
  filtros: FiltrosContas;
  setFiltros: (filtros: FiltrosContas) => void;
  categorias: CategoriaFinanceira[];
}

export default function FiltrosContasPagar({
  filtros,
  setFiltros,
  categorias,
}: FiltrosContasPagarProps) {
  const limparFiltros = () => {
    setFiltros({
      status: "",
      situacao: "",
      categoria_id: "",
      fornecedor: "",
      data_inicio: "",
      data_fim: "",
    });
  };

  return (
    <Card className="mb-4">
      <div className="card-body">
        <div className="row">
          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filtros.status}
              onChange={(e) =>
                setFiltros({ ...filtros, status: e.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="ATRASADO">Atrasado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Situação</label>
            <select
              className="form-select"
              value={filtros.situacao}
              onChange={(e) =>
                setFiltros({ ...filtros, situacao: e.target.value })
              }
            >
              <option value="">Todas</option>
              <option value="vence_hoje">Vence Hoje</option>
              <option value="vence_semana">Vence Esta Semana</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Categoria</label>
            <select
              className="form-select"
              value={filtros.categoria_id}
              onChange={(e) =>
                setFiltros({ ...filtros, categoria_id: e.target.value })
              }
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Fornecedor</label>
            <Input
              type="text"
              value={filtros.fornecedor}
              onChange={(e) =>
                setFiltros({ ...filtros, fornecedor: e.target.value })
              }
              placeholder="Nome do fornecedor"
            />
          </div>
          <div className="col-md-1">
            <label className="form-label">&nbsp;</label>
            <div>
              <Button variant="outline" onClick={limparFiltros}>
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
