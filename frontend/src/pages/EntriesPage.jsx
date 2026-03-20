import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Panel from "../components/ui/Panel";

const emptyItem = {
  product_id: "",
  quantity: "",
  unit_price: "",
};

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    supplier_id: "",
    user_id: 1,
    notes: "",
    items: [{ ...emptyItem }],
  });

  async function loadEntries() {
    const response = await api.get("/entries");
    setEntries(response.data);
  }

  async function loadSuppliers() {
    const response = await api.get("/suppliers?active=1");
    setSuppliers(response.data);
  }

  async function loadProducts() {
    const response = await api.get("/products");
    setProducts(response.data);
  }

  async function loadPageData() {
    try {
      setLoadingPage(true);
      await Promise.all([loadEntries(), loadSuppliers(), loadProducts()]);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados da página de entradas.");
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
      supplier_id: "",
      user_id: 1,
      notes: "",
      items: [{ ...emptyItem }],
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setError("");
    setSuccess("");
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleItemChange(index, field, value) {
    setForm((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      return {
        ...prev,
        items: updatedItems,
      };
    });
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }],
    }));
  }

  function removeItem(index) {
    setForm((prev) => {
      if (prev.items.length === 1) return prev;

      const updatedItems = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: updatedItems,
      };
    });
  }

  const totalPreview = useMemo(() => {
    return form.items.reduce((acc, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unit_price || 0);
      return acc + quantity * unitPrice;
    }, 0);
  }, [form.items]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.supplier_id) {
      setError("Selecione o fornecedor.");
      return;
    }

    const hasInvalidItem = form.items.some(
      (item) =>
        !item.product_id ||
        Number(item.quantity) <= 0 ||
        Number(item.unit_price) < 0
    );

    if (hasInvalidItem) {
      setError("Preencha corretamente todos os itens da entrada.");
      return;
    }

    try {
      setLoadingSave(true);

      const payload = {
        supplier_id: Number(form.supplier_id),
        user_id: Number(form.user_id),
        notes: form.notes || null,
        items: form.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      };

      await api.post("/entries", payload);

      setSuccess("Entrada registrada com sucesso.");
      await loadEntries();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.details ||
          err?.response?.data?.error ||
          "Não foi possível registrar a entrada."
      );
    } finally {
      setLoadingSave(false);
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Entradas</h2>
          <p>Compras e reposições registradas</p>
        </div>

        <div className="page-actions">
          <button className="primary-btn" onClick={openModal}>
            Nova entrada
          </button>
        </div>
      </div>

      <Panel title="Entradas de estoque">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fornecedor</th>
                <th>Usuário</th>
                <th>Data</th>
                <th>Valor total</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {loadingPage ? (
                <tr>
                  <td colSpan="6">Carregando entradas...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="6">Nenhuma entrada encontrada.</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>{entry.supplier_name}</td>
                    <td>{entry.user_name}</td>
                    <td>{entry.entry_date}</td>
                    <td>R$ {Number(entry.total_value).toFixed(2)}</td>
                    <td>{entry.notes || "-"}</td>
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
            className="modal-card modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Nova entrada de estoque</h3>
                <p>Selecione o fornecedor e adicione os produtos recebidos.</p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="entry-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Fornecedor *</label>
                  <select
                    name="supplier_id"
                    value={form.supplier_id}
                    onChange={handleFieldChange}
                  >
                    <option value="">Selecione</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Usuário responsável</label>
                  <input
                    type="text"
                    value="Administrador"
                    disabled
                  />
                </div>

                <div className="form-group form-group-full">
                  <label>Observações</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFieldChange}
                    rows="3"
                    placeholder="Ex: Reposição mensal de estoque"
                  />
                </div>
              </div>

              <div className="entry-items-header">
                <h4>Itens da entrada</h4>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={addItem}
                >
                  Adicionar item
                </button>
              </div>

              <div className="entry-items-list">
                {form.items.map((item, index) => (
                  <div className="entry-item-card" key={index}>
                    <div className="form-grid form-grid-3">
                      <div className="form-group">
                        <label>Produto *</label>
                        <select
                          value={item.product_id}
                          onChange={(e) =>
                            handleItemChange(index, "product_id", e.target.value)
                          }
                        >
                          <option value="">Selecione</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Quantidade *</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          placeholder="0"
                        />
                      </div>

                      <div className="form-group">
                        <label>Preço unitário *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(index, "unit_price", e.target.value)
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="entry-item-footer">
                      <div className="entry-item-subtotal">
                        Subtotal: R${" "}
                        {(
                          Number(item.quantity || 0) *
                          Number(item.unit_price || 0)
                        ).toFixed(2)}
                      </div>

                      <button
                        type="button"
                        className="danger-link-btn"
                        onClick={() => removeItem(index)}
                        disabled={form.items.length === 1}
                      >
                        Remover item
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="entry-total-box">
                <span>Total da entrada</span>
                <strong>R$ {totalPreview.toFixed(2)}</strong>
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
                  {loadingSave ? "Salvando..." : "Salvar entrada"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}