import React, { useState, useEffect, useRef } from "react";
import { Menu, ShoppingCart } from "lucide-react";
import { isLoggedIn } from "./Services/auth";
import Button from "./components/Button";
import { jwtDecode } from "jwt-decode";

import Home from "./Pages/Home";
import Pedidos from "./Pages/Pedidos";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import Itens from "./Pages/Itens";


export default function GiftUpApp() {
  const [screen, setScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [logado, setLogado] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tokenemail, setTokenemail] = useState("");

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const user = token ? jwtDecode(token) : null;
      if (user !== null) {
      const DecodedEmail = user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      if (token) {
        setLogado(isLoggedIn());
        setTokenemail(DecodedEmail);
      } else {
        setLogado(false);
      }
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
    setTokenemail("");
    setScreen("home");
    setMensagem("");
  };

  const handleLoginSuccess = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = jwtDecode(token);
        const DecodedEmail = user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        setLogado(true);
        setTokenemail(DecodedEmail);
        console.log("Login success - Email atualizado:", DecodedEmail);
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
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
            position: "fixed",
            top: 0,
            left: 0,
            width: "200px",
            height: "100vh",
            background: "#666",
            padding: "10px",
            zIndex: 50,
            overflowY: "auto",
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
            {tokenemail === "admin@admin.com" ? (
              <p
                style={{
                  cursor: "pointer",
                  color: screen === "Itens" ? "orange" : "#fff",
                }}
                onClick={() => handleOptionClick("Itens")}
              >
                Itens
              </p>
            ) : (
              <></>
            )}
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
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        {screen === "register" && <Register goToLogin={() => handleOptionClick("login")} />}
        {screen === "profile" && <Profile />}
        {screen === "Itens" && <Itens />}
      </div>
    </div>
  );
}
