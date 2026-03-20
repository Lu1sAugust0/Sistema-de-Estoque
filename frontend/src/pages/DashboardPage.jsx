import { useEffect, useState } from "react";
import api from "../services/api";
import StatCard from "../components/ui/StatCard";
import Panel from "../components/ui/Panel";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totals: {
      products: 0,
      active_products: 0,
      low_stock_products: 0,
      entries: 0,
      exits: 0,
    },
    last_movements: [],
    top_entry_products: [],
    low_stock_list: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard/summary");
        setSummary(response.data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("pt-BR");
  }

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Visão geral do estoque e movimentações recentes</p>
        </div>

        <div className="page-actions">
          <button className="primary-btn">Buscar produto</button>
          <button className="secondary-btn">Adicionar produto</button>
        </div>
      </div>

      {error && (
        <div className="form-alert form-alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Total de produtos"
          value={loading ? "..." : summary.totals.products}
          hint="Produtos cadastrados no sistema"
        />

        <StatCard
          title="Produtos ativos"
          value={loading ? "..." : summary.totals.active_products}
          hint="Disponíveis para operação"
        />

        <StatCard
          title="Estoque baixo"
          value={loading ? "..." : summary.totals.low_stock_products}
          hint="Precisam de reposição"
        />

        <StatCard
          title="Entradas registradas"
          value={loading ? "..." : summary.totals.entries}
          hint="Compras e reposições"
        />
      </div>

      <div className="dashboard-grid">
        <Panel title="Últimas movimentações">
          <div className="list-block">
            {loading ? (
              <div className="empty-text">Carregando...</div>
            ) : summary.last_movements.length === 0 ? (
              <div className="empty-text">Nenhuma movimentação encontrada.</div>
            ) : (
              summary.last_movements.map((item) => (
                <div className="list-row" key={item.id}>
                  <div>
                    <div className="list-title">{item.product_name}</div>
                    <div className="list-subtitle">
                      {item.user_name} • {formatDate(item.movement_date)}
                    </div>
                    {item.observation ? (
                      <div className="list-subtitle">{item.observation}</div>
                    ) : null}
                  </div>

                  <div
                    className={
                      item.movement_type === "ENTRY"
                        ? "movement-badge movement-entry"
                        : "movement-badge movement-exit"
                    }
                  >
                    {item.movement_type === "ENTRY"
                      ? `+${item.quantity}`
                      : `-${item.quantity}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Produtos com mais entradas">
          <div className="list-block">
            {loading ? (
              <div className="empty-text">Carregando...</div>
            ) : summary.top_entry_products.length === 0 ? (
              <div className="empty-text">Nenhum produto encontrado.</div>
            ) : (
              summary.top_entry_products.map((item) => (
                <div className="list-row" key={item.id}>
                  <div>
                    <div className="list-title">{item.name}</div>
                    <div className="list-subtitle">{item.sku}</div>
                  </div>

                  <div className="badge">{item.total_entry} un.</div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 18 }}>
        <Panel title="Produtos com estoque baixo">
          <div className="list-block">
            {loading ? (
              <div className="empty-text">Carregando...</div>
            ) : summary.low_stock_list.length === 0 ? (
              <div className="empty-text">
                Nenhum produto com estoque baixo no momento.
              </div>
            ) : (
              summary.low_stock_list.map((item) => (
                <div className="list-row" key={item.id}>
                  <div>
                    <div className="list-title">{item.name}</div>
                    <div className="list-subtitle">{item.sku}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="list-title">{item.current_quantity} un.</div>
                    <div className="list-subtitle">
                      mín. {item.minimum_stock}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Resumo operacional">
          <div className="list-block">
            <div className="list-row">
              <div>
                <div className="list-title">Total de saídas</div>
                <div className="list-subtitle">Baixas registradas</div>
              </div>
              <div className="badge">{loading ? "..." : summary.totals.exits}</div>
            </div>

            <div className="list-row">
              <div>
                <div className="list-title">Entradas registradas</div>
                <div className="list-subtitle">Reposições no histórico</div>
              </div>
              <div className="badge">{loading ? "..." : summary.totals.entries}</div>
            </div>

            <div className="list-row">
              <div>
                <div className="list-title">Produtos ativos</div>
                <div className="list-subtitle">Catálogo operacional</div>
              </div>
              <div className="badge">
                {loading ? "..." : summary.totals.active_products}
              </div>
            </div>

            <div className="list-row">
              <div>
                <div className="list-title">Produtos com alerta</div>
                <div className="list-subtitle">Abaixo do mínimo</div>
              </div>
              <div className="badge">
                {loading ? "..." : summary.totals.low_stock_products}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}