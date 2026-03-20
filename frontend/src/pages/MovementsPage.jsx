import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Panel from "../components/ui/Panel";

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  async function loadMovements() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/stock/movements");
      setMovements(response.data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar movimentações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovements();
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const matchesSearch =
        movement.product_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        movement.user_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        movement.observation
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "ALL" || movement.movement_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [movements, search, typeFilter]);

  const totals = useMemo(() => {
    let entries = 0;
    let exits = 0;

    for (const item of movements) {
      if (item.movement_type === "ENTRY") entries += 1;
      if (item.movement_type === "EXIT") exits += 1;
    }

    return {
      total: movements.length,
      entries,
      exits,
    };
  }, [movements]);

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("pt-BR");
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Movimentações</h2>
          <p>Histórico completo de entradas e saídas do estoque</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-pill">Total</div>
          <div className="stat-value">{totals.total}</div>
          <div className="stat-hint">Movimentações registradas</div>
        </div>

        <div className="stat-card">
          <div className="stat-pill">Entradas</div>
          <div className="stat-value">{totals.entries}</div>
          <div className="stat-hint">Reposições e compras</div>
        </div>

        <div className="stat-card">
          <div className="stat-pill">Saídas</div>
          <div className="stat-value">{totals.exits}</div>
          <div className="stat-hint">Vendas, uso interno ou perdas</div>
        </div>

        <div className="stat-card">
          <div className="stat-pill">Exibindo</div>
          <div className="stat-value">{filteredMovements.length}</div>
          <div className="stat-hint">Resultados filtrados</div>
        </div>
      </div>

      {error && (
        <div className="form-alert form-alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <Panel title="Extrato de movimentações">
        <div className="movement-toolbar">
          <div className="movement-search">
            <input
              type="text"
              placeholder="Buscar por produto, usuário ou observação"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="movement-filter">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">Todos os tipos</option>
              <option value="ENTRY">Somente entradas</option>
              <option value="EXIT">Somente saídas</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Usuário</th>
                <th>Data</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Carregando movimentações...</td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="7">Nenhuma movimentação encontrada.</td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.id}</td>
                    <td>{movement.product_name}</td>
                    <td>
                      <span
                        className={
                          movement.movement_type === "ENTRY"
                            ? "movement-badge movement-entry"
                            : "movement-badge movement-exit"
                        }
                      >
                        {movement.movement_type === "ENTRY" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td>{movement.quantity}</td>
                    <td>{movement.user_name}</td>
                    <td>{formatDate(movement.movement_date)}</td>
                    <td>{movement.observation || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}