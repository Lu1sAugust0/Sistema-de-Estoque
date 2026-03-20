import { useEffect, useState } from "react";
import api from "../services/api";
import Panel from "../components/ui/Panel";

const initialForm = {
  name: "",
  cnpj: "",
  phone: "",
  email: "",
  address: "",
  active: 1,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState("");

  async function loadSuppliers() {
    const response = await api.get("/suppliers");
    setSuppliers(response.data);
  }

  useEffect(() => {
    async function init() {
      try {
        setLoadingPage(true);
        await loadSuppliers();
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar fornecedores.");
      } finally {
        setLoadingPage(false);
      }
    }

    init();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(supplier) {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name || "",
      cnpj: supplier.cnpj || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      active: Number(supplier.active ?? 1),
    });
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setIsModalOpen(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name) {
      setError("O nome do fornecedor é obrigatório.");
      return;
    }

    try {
      setLoadingSave(true);

      const payload = {
        ...form,
        active: Number(form.active),
      };

      if (editingId) {
        await api.put(`/suppliers/${editingId}`, payload);
      } else {
        await api.post("/suppliers", payload);
      }

      await loadSuppliers();
      closeModal();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.details ||
          "Não foi possível salvar o fornecedor."
      );
    } finally {
      setLoadingSave(false);
    }
  }

  async function toggleSupplierStatus(supplier) {
    const nextActive = Number(supplier.active) === 1 ? 0 : 1;

    const confirmed = window.confirm(
      nextActive === 1
        ? `Deseja ativar o fornecedor "${supplier.name}"?`
        : `Deseja desativar o fornecedor "${supplier.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.put(`/suppliers/${supplier.id}`, {
        name: supplier.name,
        cnpj: supplier.cnpj,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        active: nextActive,
      });

      await loadSuppliers();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.details ||
          "Não foi possível alterar o status do fornecedor."
      );
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Fornecedores</h2>
          <p>Controle profissional de fornecedores</p>
        </div>

        <div className="page-actions">
          <button className="primary-btn" onClick={openCreateModal}>
            Adicionar fornecedor
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="form-alert form-alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <Panel title="Fornecedores">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingPage ? (
                <tr>
                  <td colSpan="7">Carregando fornecedores...</td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="7">Nenhum fornecedor encontrado.</td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.id}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.cnpj || "-"}</td>
                    <td>{supplier.email || "-"}</td>
                    <td>{supplier.phone || "-"}</td>
                    <td>
                      {Number(supplier.active) === 1 ? (
                        <span className="movement-badge movement-entry">Ativo</span>
                      ) : (
                        <span className="movement-badge movement-exit">Inativo</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="table-btn table-btn-edit"
                          onClick={() => openEditModal(supplier)}
                        >
                          Editar
                        </button>

                        <button
                          className={
                            Number(supplier.active) === 1
                              ? "table-btn table-btn-delete"
                              : "table-btn table-btn-edit"
                          }
                          onClick={() => toggleSupplierStatus(supplier)}
                        >
                          {Number(supplier.active) === 1 ? "Desativar" : "Ativar"}
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
          <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingId ? "Editar fornecedor" : "Novo fornecedor"}</h3>
                <p>Preencha os dados do fornecedor.</p>
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
                <label>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={form.cnpj}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
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

              <div className="form-group form-group-full">
                <label>Endereço</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              {error && <div className="form-alert form-alert-error">{error}</div>}

              <div className="modal-actions form-group-full">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={loadingSave}>
                  {loadingSave ? "Salvando..." : "Salvar fornecedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}