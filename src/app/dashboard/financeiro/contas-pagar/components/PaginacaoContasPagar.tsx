"use client";

import { Pagination } from "../types";
import { Button } from "@/components/ui/button";

interface PaginacaoContasPagarProps {
  pagination: Pagination;
  setPagination: (pagination: Pagination) => void;
}

export default function PaginacaoContasPagar({
  pagination,
  setPagination,
}: PaginacaoContasPagarProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <div>
        Página {pagination.page} de {pagination.totalPages} ({pagination.total}{" "}
        registros)
      </div>
      <div className="d-flex gap-2">
        <Button
          variant="outline"
          disabled={!pagination.hasPrev}
          onClick={() =>
            setPagination({
              ...pagination,
              page: pagination.page - 1,
            })
          }
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          disabled={!pagination.hasNext}
          onClick={() =>
            setPagination({
              ...pagination,
              page: pagination.page + 1,
            })
          }
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
