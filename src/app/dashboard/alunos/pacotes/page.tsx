"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit } from "react-icons/fi";

interface PacoteTipo {
  id: number;
  codigo: string;
  descricao: string;
  dias_validade: number;
  max_usos_dia: number | null;
  preco: number;
  ativo: number;
}
interface PacoteAluno {
  id: number;
  descricao: string;
  codigo: string;
  data_inicio: string;
  data_fim: string;
  usos_totais: number;
  usos_restantes: number;
  status: string;
  max_usos_dia: number | null;
  usos_dia_hoje: number;
}

export default function PacotesPage() {
  const [tipos, setTipos] = useState<PacoteTipo[]>([]);
  const [pacotesAluno, setPacotesAluno] = useState<PacoteAluno[]>([]);
  const [ra, setRa] = useState("");
  const [loadingPacotes, setLoadingPacotes] = useState(false);
  const [formTipoOpen, setFormTipoOpen] = useState(false);
  const [formCompraOpen, setFormCompraOpen] = useState(false);
  const [editTipo, setEditTipo] = useState<PacoteTipo | null>(null);
  const [pacoteUtilizando, setPacoteUtilizando] = useState<number | null>(null);
  const [alunoInfo, setAlunoInfo] = useState<{
    ra: number;
    nome: string;
    fotoUrl: string;
  } | null>(null);

  async function loadTipos() {
    const res = await fetch("/api/pacotes/tipos");
    if (res.ok) {
      const data = await res.json();
      setTipos(data.tipos || []);
    }
  }

  async function loadPacotesAluno() {
    if (!ra) return;
    setLoadingPacotes(true);
    try {
      const res = await fetch(`/api/pacotes/aluno?ra=${ra}`);
      if (res.ok) {
        const data = await res.json();
        setPacotesAluno(data.pacotes || []);
      }
      // Buscar info do aluno
      const resAluno = await fetch(`/api/alunos?q=${ra}`);
      if (resAluno.ok) {
        const dataAluno = await resAluno.json();
        if (dataAluno.alunos && dataAluno.alunos.length > 0) {
          setAlunoInfo(dataAluno.alunos[0]);
        } else {
          setAlunoInfo(null);
        }
      }
    } finally {
      setLoadingPacotes(false);
    }
  }

  useEffect(() => {
    loadTipos();
  }, []);

  async function salvarTipo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      codigo: formData.get("codigo"),
      descricao: formData.get("descricao"),
      diasValidade: Number(formData.get("dias_validade")),
      maxUsosDia: formData.get("max_usos_dia")
        ? Number(formData.get("max_usos_dia"))
        : null,
      preco: Number(formData.get("preco")),
    };
    const res = await fetch("/api/pacotes/tipos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      loadTipos();
      setFormTipoOpen(false);
    }
  }

  async function atualizarTipo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editTipo) return;
    const formData = new FormData(e.currentTarget);
    const payload = {
      id: editTipo.id,
      descricao: formData.get("descricao"),
      diasValidade: Number(formData.get("dias_validade")),
      maxUsosDia: formData.get("max_usos_dia")
        ? Number(formData.get("max_usos_dia"))
        : null,
      preco: Number(formData.get("preco")),
      ativo: formData.get("ativo") === "on" ? 1 : 0,
    };
    const res = await fetch("/api/pacotes/tipos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      loadTipos();
      setEditTipo(null);
      setFormTipoOpen(false);
    }
  }

  async function comprarPacote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ra) return;
    const formData = new FormData(e.currentTarget);
    const pacoteTipoId = formData.get("pacote_tipo_id");
    const dataInicio = formData.get("data_inicio");
    const res = await fetch("/api/pacotes/compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ra, pacoteTipoId, dataInicio }),
    });
    if (res.ok) {
      loadPacotesAluno();
      setFormCompraOpen(false);
    }
  }

  async function utilizarPacote(id: number) {
    setPacoteUtilizando(id);
    const res = await fetch("/api/pacotes/utilizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pacoteAlunoId: id }),
    });
    setPacoteUtilizando(null);
    if (res.ok) loadPacotesAluno();
  }

  return (
    <div className="space-y-4">
      <h4 className="fw-bold">Pacotes de Alimentação</h4>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Pacotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="d-flex flex-wrap gap-2 align-items-end">
            <div style={{ minWidth: 160 }}>
              <Input
                label="RA"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              icon={<FiSearch />}
              onClick={loadPacotesAluno}
            >
              Buscar Pacotes
            </Button>
            <Button
              variant="outline"
              icon={<FiRefreshCw />}
              onClick={loadPacotesAluno}
            />
            <Button
              variant="success"
              icon={<FiPlus />}
              onClick={() => setFormCompraOpen(true)}
            >
              Comprar Pacote
            </Button>
            <Button
              variant="secondary"
              icon={<FiPlus />}
              onClick={() => setFormTipoOpen(true)}
            >
              Novo Tipo
            </Button>
          </div>
          {alunoInfo && (
            <div className="d-flex align-items-center gap-3 mt-3 border rounded p-2 bg-light">
              <img
                src={alunoInfo.fotoUrl}
                alt={alunoInfo.nome}
                style={{
                  width: 72,
                  height: 72,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://via.placeholder.com/72x72?text=Aluno";
                }}
              />
              <div className="flex-grow-1">
                <div className="fw-semibold">{alunoInfo.nome}</div>
                <div className="text-muted small">RA: {alunoInfo.ra}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="row g-3">
        <div className="col-lg-5">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Pacote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="table-responsive" style={{ maxHeight: 400 }}>
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Descrição</th>
                      <th>Dias</th>
                      <th>Max/Dia</th>
                      <th>Preço</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tipos.map((t) => (
                      <tr key={t.id} className={t.ativo ? "" : "text-muted"}>
                        <td>{t.descricao}</td>
                        <td>{t.dias_validade}</td>
                        <td>{t.max_usos_dia ?? "-"}</td>
                        <td>R$ {t.preco.toFixed(2)}</td>
                        <td>
                          <Button
                            size="small"
                            variant="outline"
                            icon={<FiEdit />}
                            onClick={() => {
                              setEditTipo(t);
                              setFormTipoOpen(true);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                    {tipos.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">
                          Nenhum tipo
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-lg-7">
          <Card>
            <CardHeader>
              <CardTitle>Pacotes do Aluno</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPacotes && (
                <div className="text-muted">Carregando...</div>
              )}
              {!loadingPacotes && (
                <div className="table-responsive" style={{ maxHeight: 400 }}>
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Descrição</th>
                        <th>Período</th>
                        <th>Usos</th>
                        <th>Hoje</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacotesAluno.map((p) => (
                        <tr key={p.id}>
                          <td>{p.descricao}</td>
                          <td>
                            {new Date(p.data_inicio).toLocaleDateString()} -{" "}
                            {new Date(p.data_fim).toLocaleDateString()}
                          </td>
                          <td>
                            {p.usos_totais - p.usos_restantes}/{p.usos_totais}
                          </td>
                          <td>
                            {p.usos_dia_hoje}
                            {p.max_usos_dia ? `/${p.max_usos_dia}` : ""}
                          </td>
                          <td>
                            <span
                              className={
                                "badge " +
                                (p.status === "ATIVO"
                                  ? "bg-success"
                                  : p.status === "CONSUMIDO"
                                  ? "bg-secondary"
                                  : "bg-warning text-dark")
                              }
                            >
                              {p.status}
                            </span>
                          </td>
                          <td>
                            {p.status === "ATIVO" && p.usos_restantes > 0 && (
                              <Button
                                size="small"
                                variant="primary"
                                loading={pacoteUtilizando === p.id}
                                onClick={() => utilizarPacote(p.id)}
                              >
                                Usar
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {pacotesAluno.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">
                            Nenhum pacote
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {formTipoOpen && (
        <div className="modal d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={editTipo ? atualizarTipo : salvarTipo}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editTipo ? "Editar Tipo de Pacote" : "Novo Tipo de Pacote"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setFormTipoOpen(false);
                      setEditTipo(null);
                    }}
                  />
                </div>
                <div className="modal-body vstack gap-2">
                  {!editTipo && <Input name="codigo" label="Código" required />}
                  <Input
                    name="descricao"
                    label="Descrição"
                    required
                    defaultValue={editTipo?.descricao}
                  />
                  <Input
                    type="number"
                    name="dias_validade"
                    label="Dias de Validade"
                    required
                    defaultValue={editTipo?.dias_validade}
                  />
                  <Input
                    type="number"
                    name="max_usos_dia"
                    label="Máx usos/dia (opcional)"
                    defaultValue={editTipo?.max_usos_dia ?? ""}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    name="preco"
                    label="Preço"
                    required
                    defaultValue={editTipo?.preco}
                  />
                  {editTipo && (
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ativo"
                        name="ativo"
                        defaultChecked={editTipo.ativo === 1}
                      />
                      <label className="form-check-label" htmlFor="ativo">
                        Ativo
                      </label>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormTipoOpen(false);
                      setEditTipo(null);
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

      {formCompraOpen && (
        <div className="modal d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={comprarPacote}>
                <div className="modal-header">
                  <h5 className="modal-title">Comprar Pacote</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setFormCompraOpen(false)}
                  />
                </div>
                <div className="modal-body vstack gap-2">
                  <label className="form-label">Tipo de Pacote</label>
                  <select
                    name="pacote_tipo_id"
                    className="form-select"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {tipos
                      .filter((t) => t.ativo)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.descricao} ({t.dias_validade}d)
                        </option>
                      ))}
                  </select>
                  <Input type="date" name="data_inicio" label="Data Início" />
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormCompraOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Confirmar
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
