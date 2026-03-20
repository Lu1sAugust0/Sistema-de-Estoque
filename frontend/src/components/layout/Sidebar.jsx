import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Dashboard" },
  { to: "/produtos", label: "Produtos" },
  { to: "/categorias", label: "Categorias" },
  { to: "/fornecedores", label: "Fornecedores" },
  { to: "/movimentacoes", label: "Movimentações" },
  { to: "/entradas", label: "Entradas" },
  { to: "/saidas", label: "Saídas" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand">EstoquePro</div>
        <div className="brand-subtitle">Gestão online</div>

        <nav className="nav-menu">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">Configurações</div>
    </aside>
  );
}