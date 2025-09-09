import React, { useState, useEffect, useRef } from "react";
import { Menu, ShoppingCart } from "lucide-react";
import { isLoggedIn } from "./Services/auth";
import Button from "./components/Button";

import Home from "./Pages/Home";
import Pedidos from "./Pages/Pedidos";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";

export default function GiftUpApp() {
  const [screen, setScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [logado, setLogado] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setLogado(isLoggedIn());
      } else {
        setLogado(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleOptionClick = (targetScreen) => {
    setScreen(targetScreen);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLogado(false);
    setScreen("home");
    setMensagem("");
  };

  const handleCartClick = () => {
    if (logado) {
      setScreen("pedidos");
    } else {
      setMensagem("🔒 Faça login para ver seus pedidos.");
      setTimeout(() => setMensagem(""), 3000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#222", color: "#fff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          background: "#fff",
          color: "#000",
        }}
      >
        <Menu
          style={{ cursor: "pointer" }}
          onClick={() => setMenuOpen(!menuOpen)}
        />
        <h1
          style={{ color: "orange", cursor: "pointer" }}
          onClick={() => setScreen("home")}
        >
          GiftUp
        </h1>
        <ShoppingCart style={{ cursor: "pointer" }} onClick={handleCartClick} />
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "200px",
            height: "100vh",
            background: "#666",
            padding: "10px",
            zIndex: 50,
          }}
        >
          <p
            style={{
              cursor: "pointer",
              color: screen === "home" ? "orange" : "#fff",
            }}
            onClick={() => handleOptionClick("home")}
          >
            Produtos
          </p>

          {!logado ? (
            <>
              <p
                style={{
                  cursor: "pointer",
                  color: screen === "register" ? "orange" : "#fff",
                }}
                onClick={() => handleOptionClick("register")}
              >
                Cadastrar
              </p>
              <p
                style={{
                  cursor: "pointer",
                  color: screen === "login" ? "orange" : "#fff",
                }}
                onClick={() => handleOptionClick("login")}
              >
                Entrar
              </p>
            </>
          ) : (
            <>
              <p
                style={{
                  cursor: "pointer",
                  color: screen === "pedidos" ? "orange" : "#fff",
                }}
                onClick={() => handleOptionClick("pedidos")}
              >
                Pedidos
              </p>
              <p
                style={{
                  cursor: "pointer",
                  color: screen === "profile" ? "orange" : "#fff",
                }}
                onClick={() => handleOptionClick("profile")}
              >
                Meu perfil
              </p>
              <p style={{ cursor: "pointer", color: "red" }} onClick={handleLogout}>
                Sair
              </p>
            </>
          )}
        </div>
      )}

      <div style={{ background: "#fff", color: "#000", minHeight: "100vh", padding: "10px" }}>
        {mensagem && (
          <p style={{ color: "orange", fontWeight: "bold", textAlign: "center" }}>
            {mensagem}
          </p>
        )}

        {screen === "home" && <Home />}
        {screen === "pedidos" && <Pedidos goToHome={() => handleOptionClick("home")} />}
        {screen === "login" && (
          <Login
            goToRegister={() => handleOptionClick("register")}
            goToHome={() => handleOptionClick("home")}
            setLogado={setLogado}
          />
        )}
        {screen === "register" && <Register goToLogin={() => handleOptionClick("login")} />}
        {screen === "profile" && <Profile />}
      </div>
    </div>
  );
}
