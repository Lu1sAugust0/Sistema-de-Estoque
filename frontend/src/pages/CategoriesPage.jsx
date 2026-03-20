import { useEffect, useState } from "react";
import api from "../services/api";
import Panel from "../components/ui/Panel";

const initialForm = {
  name: "",
  description: "",
  active: 1,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    const response = await api.get("/categories");
    setCategories(response.data);
  }

  useEffect(() => {
    async function init() {
      try {
        setLoadingPage(true);
        await loadCategories();
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar categorias.");
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

  function openEditModal(category) {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      description: category.description || "",
      active: Number(category.active ?? 1),
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
      setError("O nome da categoria é obrigatório.");
      return;
    }

    try {
      setLoadingSave(true);

      const payload = {
        ...form,
        active: Number(form.active),
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post("/categories", payload);
      }

      await loadCategories();
      closeModal();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.details ||
          "Não foi possível salvar a categoria."
      );
    } finally {
      setLoadingSave(false);
    }
  }

  async function toggleCategoryStatus(category) {
    const nextActive = Number(category.active) === 1 ? 0 : 1;

    const confirmed = window.confirm(
      nextActive === 1
        ? `Deseja ativar a categoria "${category.name}"?`
        : `Deseja desativar a categoria "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.put(`/categories/${category.id}`, {
        name: category.name,
        description: category.description,
        active: nextActive,
      });

      await loadCategories();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.details ||
          "Não foi possível alterar o status da categoria."
      );
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Categorias</h2>
          <p>Organização profissional dos produtos</p>
        </div>

        <div className="page-actions">
          <button className="primary-btn" onClick={openCreateModal}>
            Adicionar categoria
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="form-alert form-alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <Panel title="Categorias cadastradas">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingPage ? (
                <tr>
                  <td colSpan="5">Carregando categorias...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhuma categoria encontrada.</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.description || "-"}</td>
                    <td>
                      {Number(category.active) === 1 ? (
                        <span className="movement-badge movement-entry">Ativa</span>
                      ) : (
                        <span className="movement-badge movement-exit">Inativa</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="table-btn table-btn-edit"
                          onClick={() => openEditModal(category)}
                        >
                          Editar
                        </button>

                        <button
                          className={
                            Number(category.active) === 1
                              ? "table-btn table-btn-delete"
                              : "table-btn table-btn-edit"
                          }
                          onClick={() => toggleCategoryStatus(category)}
                        >
                          {Number(category.active) === 1 ? "Desativar" : "Ativar"}
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
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingId ? "Editar categoria" : "Nova categoria"}</h3>
                <p>Preencha os dados da categoria.</p>
              </div>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group form-group-full">
                <label>Nome *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
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

              <div className="form-group form-group-full">
                <label>Status</label>
                <select
                  name="active"
                  value={form.active}
                  onChange={handleChange}
                >
                  <option value={1}>Ativa</option>
                  <option value={0}>Inativa</option>
                </select>
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
                  {loadingSave ? "Salvando..." : "Salvar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}