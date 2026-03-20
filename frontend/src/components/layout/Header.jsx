export default function Header() {
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    localStorage.removeItem("user");
    window.location.reload();
  }

  const userName = user?.name || "Usuário";
  const userEmail = user?.email || "Sem email";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">Sistema de Estoque</h1>
        <p className="topbar-subtitle">Controle simples, rápido e organizado</p>
      </div>

      <div className="topbar-user-area">
        <div className="topbar-user">
          <div className="topbar-avatar">{userInitial}</div>

          <div>
            <div className="topbar-user-name">{userName}</div>
            <div className="topbar-user-role">{userEmail}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}