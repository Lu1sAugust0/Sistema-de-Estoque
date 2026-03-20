import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Panel from "../components/ui/Panel";

export default function StockExitPage() {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    user_id: 1,
    observation: "",
  });

  async function loadProducts() {
    const response = await api.get("/products");
    setProducts(response.data);
  }

  async function loadStock() {
    const response = await api.get("/stock");
    setStock(response.data);
  }

  async function loadPageData() {
    try {
      setLoadingPage(true);
      await Promise.all([loadProducts(), loadStock()]);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados da página de saída.");
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  function openModal() {
    setError("");
    setSuccess("");
    setForm({
      product_id: "",
      quantity: "",
      user_id: 1,
      observation: "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setError("");
    setSuccess("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const selectedStock = useMemo(() => {
    if (!form.product_id) return null;
    return stock.find((item) => Number(item.product_id) === Number(form.product_id)) || null;
  }, [form.product_id, stock]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.product_id || !form.quantity) {
      setError("Selecione o produto e informe a quantidade.");
      return;
    }

    if (Number(form.quantity) <= 0) {
      setError("A quantidade deve ser maior que zero.");
      return;
    }

    try {
      setLoadingSave(true);

      const payload = {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        user_id: Number(form.user_id),
        observation: form.observation || null,
      };

      await api.post("/stock/exit", payload);

      setSuccess("Saída registrada com sucesso.");
      await loadPageData();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.details ||
          err?.response?.data?.error ||
          "Não foi possível registrar a saída."
      );
    } finally {
      setLoadingSave(false);
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Saídas</h2>
          <p>Retiradas e baixas de produtos do estoque</p>
        </div>

        <div className="page-actions">
          <button className="primary-btn" onClick={openModal}>
            Nova saída
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="form-alert form-alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <Panel title="Controle de saídas">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Estoque atual</th>
                <th>Estoque mínimo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingPage ? (
                <tr>
                  <td colSpan="5">Carregando estoque...</td>
                </tr>
              ) : stock.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum item de estoque encontrado.</td>
                </tr>
              ) : (
                stock.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.current_quantity}</td>
                    <td>{item.minimum_stock}</td>
                    <td>{item.stock_status === "LOW" ? "Baixo" : "Normal"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Nova saída de estoque</h3>
                <p>Selecione o produto e informe a quantidade retirada.</p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="exit-form">
              <div className="form-group">
                <label>Produto *</label>
                <select
                  name="product_id"
                  value={form.product_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStock && (
                <div className="stock-preview-box">
                  <div>
                    <span>Estoque atual</span>
                    <strong>{selectedStock.current_quantity}</strong>
                  </div>
                  <div>
                    <span>Estoque mínimo</span>
                    <strong>{selectedStock.minimum_stock}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>
                      {selectedStock.stock_status === "LOW" ? "Baixo" : "Normal"}
                    </strong>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Usuário responsável</label>
                <input type="text" value="Administrador" disabled />
              </div>

              <div className="form-group">
                <label>Observação</label>
                <textarea
                  name="observation"
                  value={form.observation}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Ex: Saída para venda, uso interno, perda..."
                />
              </div>

              {error && <div className="form-alert form-alert-error">{error}</div>}
              {success && (
                <div className="form-alert form-alert-success">{success}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={loadingSave}>
                  {loadingSave ? "Salvando..." : "Salvar saída"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}