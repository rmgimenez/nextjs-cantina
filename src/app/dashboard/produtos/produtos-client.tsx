"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import {
  FiEdit,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash,
  FiTrendingDown,
} from "react-icons/fi";

interface TipoProduto {
  id: number;
  descricao: string;
  codigo: string;
  exige_peso: number;
  ativo: number;
}
interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco_unitario: number;
  codigo_barra?: string;
  estoque_minimo?: number;
  ativo: number;
  tipo_descricao: string;
  tipo_codigo: string;
  estoque_atual: number;
}

interface Props {
  initialProdutos: Produto[];
  initialTipos: TipoProduto[];
}

// Helper seguro para formatar preços (aceita number|string|null)
function formatCurrency(value: any) {
  const n = Number(value);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

type OptimisticAction =
  | { type: "add-produto"; produto: Produto }
  | { type: "update-produto"; id: number; patch: Partial<Produto> }
  | { type: "delete-produto"; id: number };

export default function ProdutosClient({
  initialProdutos,
  initialTipos,
}: Props) {
  const [tipos, setTipos] = useState<TipoProduto[]>(initialTipos);
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [isPending, startTransition] = useTransition();
  const [showFormProduto, setShowFormProduto] = useState(false);
  const [showFormTipo, setShowFormTipo] = useState(false);
  const [showFormMov, setShowFormMov] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const [optimisticProdutos, applyOptimistic] = useOptimistic<
    Produto[],
    OptimisticAction
  >(produtos, (state, action) => {
    switch (action.type) {
      case "add-produto":
        return [action.produto, ...state];
      case "update-produto":
        return state.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p
        );
      case "delete-produto":
        return state.filter((p) => p.id !== action.id);
      default:
        return state;
    }
  });

  const filtered = useMemo(() => {
    if (!search) return optimisticProdutos;
    return optimisticProdutos.filter(
      (p) =>
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.codigo_barra || "").includes(search)
    );
  }, [optimisticProdutos, search]);

  const reloadProdutos = useCallback(async () => {
    startTransition(async () => {
      const res = await fetch("/api/produtos");
      if (res.ok) {
        const data = await res.json();
        setProdutos(data.produtos);
      }
    });
  }, []);

  const reloadTipos = useCallback(async () => {
    const res = await fetch("/api/produtos/tipos");
    if (res.ok) {
      const data = await res.json();
      setTipos(data.tipos);
    }
  }, []);

  // Fallback: se a página foi renderizada sem tipos (ex: navegação cliente ou
  // SSR sem cookie), buscar tipos ao montar o componente para popular o select
  useEffect(() => {
    if (!tipos || tipos.length === 0) {
      reloadTipos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateTipo(form: FormData) {
    const descricao = form.get("descricao")?.toString().trim();
    const codigo = form.get("codigo")?.toString().trim();
    const exige_peso = form.get("exige_peso") === "on";
    if (!descricao || !codigo) return;
    const res = await fetch("/api/produtos/tipos", {
      method: "POST",
      body: JSON.stringify({ descricao, codigo, exigePeso: exige_peso }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      reloadTipos();
      setShowFormTipo(false);
    }
  }

  async function handleCreateProduto(form: FormData) {
    const tipoId = Number(form.get("tipoId"));
    const nome = form.get("nome")?.toString().trim() || "";
    const precoUnitario = Number(form.get("preco"));
    const codigoBarra =
      form.get("codigo_barra")?.toString().trim() || undefined;
    const estoqueMinimo = form.get("estoque_minimo")
      ? Number(form.get("estoque_minimo"))
      : 0;
    if (!tipoId || !nome) return;
    const tempId = Date.now() * -1;
    const tipo = tipos.find((t) => t.id === tipoId)!;
    applyOptimistic({
      type: "add-produto",
      produto: {
        id: tempId,
        nome,
        preco_unitario: precoUnitario || 0,
        codigo_barra: codigoBarra,
        estoque_minimo: estoqueMinimo,
        ativo: 1,
        descricao: "",
        tipo_descricao: tipo.descricao,
        tipo_codigo: tipo.codigo,
        estoque_atual: 0,
      },
    });
    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoId,
        nome,
        precoUnitario,
        codigoBarra,
        estoqueMinimo,
      }),
    });
    if (res.ok) {
      reloadProdutos();
      setShowFormProduto(false);
    } else {
      reloadProdutos();
    }
  }

  async function handleEditProduto(form: FormData) {
    if (!selectedProduto) return;
    const patch: any = {};
    const nome = form.get("nome")?.toString().trim();
    if (nome) patch.nome = nome;
    const preco = form.get("preco");
    if (preco) patch.preco_unitario = Number(preco);
    const estoqueMinimo = form.get("estoque_minimo");
    if (estoqueMinimo) patch.estoque_minimo = Number(estoqueMinimo);
    applyOptimistic({ type: "update-produto", id: selectedProduto.id, patch });
    const res = await fetch("/api/produtos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedProduto.id, ...patch }),
    });
    if (!res.ok) reloadProdutos();
    setSelectedProduto(null);
  }

  async function handleDeleteProduto(id: number) {
    applyOptimistic({ type: "delete-produto", id });
    const res = await fetch("/api/produtos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) reloadProdutos();
  }

  async function handleMovimentacao(form: FormData) {
    const produtoId = Number(form.get("produtoId"));
    const tipoMov = form.get("tipo_mov")?.toString();
    const quantidade = Number(form.get("quantidade"));
    if (!produtoId || !tipoMov || !quantidade) return;
    const mult = ["ENTRADA", "AJUSTE_POSITIVO"].includes(tipoMov) ? 1 : -1;
    applyOptimistic({
      type: "update-produto",
      id: produtoId,
      patch: {
        estoque_atual:
          (optimisticProdutos.find((p) => p.id === produtoId)?.estoque_atual ||
            0) +
          mult * quantidade,
      },
    });
    const res = await fetch("/api/estoque/movimentacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId, tipoMov, quantidade }),
    });
    if (!res.ok) reloadProdutos();
    else reloadProdutos();
    setShowFormMov(false);
  }

  function getStatusBadge(stock: number, estoqueMinimo?: number) {
    if (stock === 0)
      return <span className="badge bg-danger">Sem Estoque</span>;
    if (stock <= (estoqueMinimo ?? 0))
      return <span className="badge bg-warning text-dark">Baixo</span>;
    return <span className="badge bg-success">OK</span>;
  }

  return (
    <div className="space-y-4">
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <div className="flex-grow-1" style={{ minWidth: 260 }}>
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<FiSearch />}
          />
        </div>
        <Button variant="outline" icon={<FiFilter />}>
          Filtros
        </Button>
        <Button
          variant="secondary"
          icon={<FiPlus />}
          onClick={() => setShowFormTipo(true)}
        >
          Novo Tipo
        </Button>
        <Button
          variant="primary"
          icon={<FiPlus />}
          onClick={() => setShowFormProduto(true)}
        >
          Novo Produto
        </Button>
        <Button
          variant="success"
          icon={<FiTrendingDown />}
          onClick={() => setShowFormMov(true)}
        >
          Movimentação
        </Button>
        <Button
          variant="outline"
          icon={<FiRefreshCw />}
          loading={isPending}
          onClick={reloadProdutos}
        >
          Atualizar
        </Button>
      </div>

      <div className="row g-3">
        <div className="col-sm-6 col-md-3">
          <Card>
            <CardContent className="pt-3">
              <p className="text-muted mb-1">Produtos</p>
              <h5 className="mb-0">{optimisticProdutos.length}</h5>
            </CardContent>
          </Card>
        </div>
        <div className="col-sm-6 col-md-3">
          <Card>
            <CardContent className="pt-3">
              <p className="text-muted mb-1">Baixo Estoque</p>
              <h5 className="mb-0">
                {
                  optimisticProdutos.filter(
                    (p) => p.estoque_atual <= (p.estoque_minimo ?? 0)
                  ).length
                }
              </h5>
            </CardContent>
          </Card>
        </div>
        <div className="col-sm-6 col-md-3">
          <Card>
            <CardContent className="pt-3">
              <p className="text-muted mb-1">Sem Estoque</p>
              <h5 className="mb-0">
                {optimisticProdutos.filter((p) => p.estoque_atual === 0).length}
              </h5>
            </CardContent>
          </Card>
        </div>
        <div className="col-sm-6 col-md-3">
          <Card>
            <CardContent className="pt-3">
              <p className="text-muted mb-1">Valor Total (aprox)</p>
              <h5 className="mb-0">
                R${" "}
                {formatCurrency(
                  optimisticProdutos.reduce(
                    (acc, p) =>
                      acc + Number(p.preco_unitario) * Number(p.estoque_atual),
                    0
                  )
                )}
              </h5>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th style={{ width: 140 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className={p.id < 0 ? "opacity-50" : ""}>
                    <td>
                      {p.nome}
                      {p.codigo_barra && (
                        <div className="text-muted small">
                          Cod: {p.codigo_barra}
                        </div>
                      )}
                    </td>
                    <td>{p.tipo_descricao}</td>
                    <td>R$ {formatCurrency(p.preco_unitario)}</td>
                    <td>{p.estoque_atual}</td>
                    <td>{getStatusBadge(p.estoque_atual, p.estoque_minimo)}</td>
                    <td className="d-flex gap-1">
                      <Button
                        size="small"
                        variant="outline"
                        icon={<FiEdit />}
                        onClick={() => {
                          setSelectedProduto(p);
                          setShowFormProduto(true);
                        }}
                      />
                      <Button
                        size="small"
                        variant="danger"
                        icon={<FiTrash />}
                        onClick={() => handleDeleteProduto(p.id)}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Nenhum produto
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showFormTipo && (
        <div className="modal d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <form action={handleCreateTipo}>
                <div className="modal-header">
                  <h5 className="modal-title">Novo Tipo de Produto</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowFormTipo(false)}
                  />
                </div>
                <div className="modal-body">
                  <Input name="descricao" label="Descrição" required />
                  <Input name="codigo" label="Código" required />
                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="exige_peso"
                      name="exige_peso"
                    />
                    <label className="form-check-label" htmlFor="exige_peso">
                      Exige peso (por kg)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFormTipo(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showFormProduto && (
        <div className="modal d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form
                action={
                  selectedProduto ? handleEditProduto : handleCreateProduto
                }
              >
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedProduto ? "Editar Produto" : "Novo Produto"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowFormProduto(false);
                      setSelectedProduto(null);
                    }}
                  />
                </div>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <Input
                      name="nome"
                      label="Nome"
                      defaultValue={selectedProduto?.nome}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <Input
                      type="number"
                      step="0.01"
                      name="preco"
                      label="Preço"
                      defaultValue={selectedProduto?.preco_unitario}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <Input
                      type="number"
                      step="0.001"
                      name="estoque_minimo"
                      label="Estoque Mínimo"
                      defaultValue={selectedProduto?.estoque_minimo}
                    />
                  </div>
                  {!selectedProduto && (
                    <div className="col-md-4">
                      <label className="form-label">Tipo</label>
                      <select
                        name="tipoId"
                        className="form-select"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Selecione...
                        </option>
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.descricao}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="col-md-4">
                    <Input
                      name="codigo_barra"
                      label="Código Barra"
                      defaultValue={selectedProduto?.codigo_barra}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowFormProduto(false);
                      setSelectedProduto(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showFormMov && (
        <div className="modal d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <form action={handleMovimentacao}>
                <div className="modal-header">
                  <h5 className="modal-title">Movimentação de Estoque</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowFormMov(false)}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label">Produto</label>
                  <select
                    name="produtoId"
                    className="form-select mb-3"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {optimisticProdutos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                  <label className="form-label">Tipo Movimentação</label>
                  <select
                    name="tipo_mov"
                    className="form-select mb-3"
                    required
                    defaultValue="ENTRADA"
                  >
                    <option value="ENTRADA">Entrada</option>
                    <option value="SAIDA">Saída</option>
                    <option value="AJUSTE_POSITIVO">Ajuste +</option>
                    <option value="AJUSTE_NEGATIVO">Ajuste -</option>
                  </select>
                  <Input
                    type="number"
                    step="0.001"
                    name="quantidade"
                    label="Quantidade"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFormMov(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Lançar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
