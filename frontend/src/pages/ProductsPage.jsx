import { useEffect, useState } from "react";
import api from "../services/api";
import Panel from "../components/ui/Panel";

const initialForm = {
  name: "",
  sku: "",
  barcode: "",
  description: "",
  cost_price: "",
  sale_price: "",
  minimum_stock: "",
  category_id: "",
  supplier_id: "",
  active: 1,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProducts() {
    const response = await api.get("/products");
    setProducts(response.data);
  }

  async function loadCategories() {
    const response = await api.get("/categories?active=1");
    setCategories(response.data);
  }

  async function loadSuppliers() {
    const response = await api.get("/suppliers?active=1");
    setSuppliers(response.data);
  }

  async function loadPageData() {
    try {
      setLoadingPage(true);
      await Promise.all([loadProducts(), loadCategories(), loadSuppliers()]);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados da página.");
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setError("");
    setSuccess("");
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(product) {
    setEditingId(product.id);
    setError("");
    setSuccess("");
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      description: product.description || "",
      cost_price: product.cost_price || "",
      sale_price: product.sale_price || "",
      minimum_stock: product.minimum_stock || "",
      category_id: product.category_id || "",
      supplier_id: product.supplier_id || "",
      active: Number(product.active ?? 1),
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name ||
      !form.sku ||
      !form.cost_price ||
      !form.sale_price ||
      !form.minimum_stock ||
      !form.category_id
    ) {
      setError("Preencha os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        sku: form.sku,
        barcode: form.barcode || null,
        description: form.description || null,
        cost_price: Number(form.cost_price),
        sale_price: Number(form.sale_price),
        minimum_stock: Number(form.minimum_stock),
        category_id: Number(form.category_id),
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        active: Number(form.active),
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setSuccess("Produto atualizado com sucesso.");
      } else {
        await api.post("/products", payload);
        setSuccess("Produto cadastrado com sucesso.");
      }

      await loadProducts();

      setTimeout(() => {
        closeModal();
      }, 600);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.details ||
          err?.response?.data?.error ||
          err?.message ||
          "Não foi possível salvar o produto."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o produto "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${product.id}`);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.details ||
          "Não foi possível excluir o produto."
      );
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Produtos</h2>
          <p>Lista de produtos cadastrados</p>
        </div>

        <div className="page-actions">
          <button className="primary-btn" onClick={openCreateModal}>
            Adicionar produto
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="form-alert form-alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <Panel title="Produtos">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Preço venda</th>
                <th>Estoque</th>
                <th>Status</th>
                <th style={{ width: 170 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingPage ? (
                <tr>
                  <td colSpan="9">Carregando produtos...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category_name}</td>
                    <td>{product.supplier_name || "-"}</td>
                    <td>R$ {Number(product.sale_price).toFixed(2)}</td>
                    <td>{product.current_quantity ?? 0}</td>
                    <td>{Number(product.active) === 1 ? "Ativo" : "Inativo"}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="table-btn table-btn-edit"
                          onClick={() => openEditModal(product)}
                        >
                          Editar
                        </button>
                        <button
                          className="table-btn table-btn-delete"
                          onClick={() => handleDelete(product)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
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
                <h3>{editingId ? "Editar produto" : "Novo produto"}</h3>
                <p>
                  {editingId
                    ? "Atualize os dados do produto."
                    : "Preencha os dados para cadastrar um produto."}
                </p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Código de barras</label>
                <input
                  type="text"
                  name="barcode"
                  value={form.barcode}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group form-group-full">
                <label>Descrição</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Preço de custo *</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_price"
                  value={form.cost_price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Preço de venda *</label>
                <input
                  type="number"
                  step="0.01"
                  name="sale_price"
                  value={form.sale_price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Estoque mínimo *</label>
                <input
                  type="number"
                  name="minimum_stock"
                  value={form.minimum_stock}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="active"
                  value={form.active}
                  onChange={handleChange}
                >
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Categoria *</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fornecedor</label>
                <select
                  name="supplier_id"
                  value={form.supplier_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && <div className="form-alert form-alert-error">{error}</div>}
              {success && (
                <div className="form-alert form-alert-success">{success}</div>
              )}

              <div className="modal-actions form-group-full">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading
                    ? "Salvando..."
                    : editingId
                    ? "Salvar alterações"
                    : "Salvar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}