import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";
import MovementsPage from "./pages/MovementsPage";
import EntriesPage from "./pages/EntriesPage";
import StockExitPage from "./pages/StockExitPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/fornecedores" element={<SuppliersPage />} />
        <Route path="/movimentacoes" element={<MovementsPage />} />
        <Route path="/entradas" element={<EntriesPage />} />
        <Route path="/saidas" element={<StockExitPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}