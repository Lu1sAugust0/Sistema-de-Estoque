import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const navigate = useNavigate();

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    try {
      const res = await api.post("/login", loginForm);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(
        err?.response?.data?.error || "Email ou senha inválidos"
      );
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    try {
      const res = await api.post("/register", registerForm);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(
        err?.response?.data?.error || "Não foi possível realizar o cadastro"
      );
    }
  }

  return (
    <div className="login-page">
      <div className="login-card-auth">
        <div className="auth-switch">
          <button
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("login");
              setError("");
            }}
            type="button"
          >
            Entrar
          </button>

          <button
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("register");
              setError("");
            }}
            type="button"
          >
            Cadastrar
          </button>
        </div>

        <h1>{mode === "login" ? "Login" : "Cadastro"}</h1>

        {error && <div className="form-alert form-alert-error">{error}</div>}

        {mode === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Digite sua senha"
              />
            </div>

            <button className="primary-btn auth-submit-btn" type="submit">
              Entrar
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="Seu nome"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="form-group">
              <label>Confirmar senha</label>
              <input
                type="password"
                name="confirm_password"
                value={registerForm.confirm_password}
                onChange={handleRegisterChange}
                placeholder="Repita a senha"
              />
            </div>

            <button className="primary-btn auth-submit-btn" type="submit">
              Criar conta
            </button>
          </form>
        )}
      </div>
    </div>
  );
}