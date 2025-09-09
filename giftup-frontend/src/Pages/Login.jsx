import React, { useEffect, useState, useRef } from "react";
import Button from "../components/Button";
import api from "../Services/API";

export default function Login({ goToRegister, goToHome, setLogado}) {
  const [cliente, setCliente] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [corMensagem, setCorMensagem] = useState("black");

  const inputEmail = useRef();
  const inputSenha = useRef();

  async function loginCliente() {
    try {
      const novoLogin = {
        Email: inputEmail.current.value,
        Senha: inputSenha.current.value,
      };
  
      const response = await api.post('/cliente/login', novoLogin);
  
      localStorage.setItem('token', response.data.token);
      setCliente(response.data.cliente);
      setMensagem("✅ Login feito com sucesso!");
      setCorMensagem("green");
      setLogado(true);
      setTimeout(() => {
        setMensagem("");
        goToHome();
      }, 1000);
  
      inputEmail.current.value = "";
      inputSenha.current.value = "";
    } catch (error) {
      setMensagem("❌ Erro ao fazer login!");
      setCorMensagem("red");
      setTimeout(() => setMensagem(""), 1000);
  
      console.error(
        "Erro ao fazer login:",
        error.response?.data || error.message
      );
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px"
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "orange",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Seja Bem Vindo de Volta
      </h2>
      <input
        ref={inputEmail}
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          marginBottom: "10px",
          width: "256px"
        }}
        placeholder="Email:"
      />
      <input
        type="password"
        ref={inputSenha}
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          marginBottom: "10px",
          width: "256px"
        }}
        placeholder="Senha:"
      />
      <h3
        style={{
          color: "blue",
          cursor: "pointer",
          marginBottom: "20px"
        }}
        onClick={goToRegister}
      >cadastrar-se
      </h3>
      <Button style={{
        background: "orange",
        color: "white",
        width: "256px"
      }}
        onClick={loginCliente}>Entrar</Button>
      {mensagem && (
        <p style={{ marginTop: "15px", color: corMensagem, fontWeight: "bold" }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
