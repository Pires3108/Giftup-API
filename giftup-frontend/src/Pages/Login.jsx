import React, { useState, useRef } from "react";
import Button from "../components/Button";
import api from "../Services/API";

export default function Login({ goToRegister, goToHome, setLogado, onLoginSuccess}) {
  const [mensagem, setMensagem] = useState("");
  const [corMensagem, setCorMensagem] = useState("black");

  const inputEmail = useRef();
  const inputSenha = useRef();

  async function loginCliente() {
    try {
      console.log("=== INÍCIO LOGIN ===");
      
      const novoLogin = {
        email_cliente: inputEmail.current.value,
        senha: inputSenha.current.value,
      };
      
      console.log("Dados do login:", novoLogin);
      console.log("URL da API:", api.defaults.baseURL);
  
      const response = await api.post('/cliente/login', novoLogin);
      
      console.log("Resposta da API:", response);
      console.log("Token recebido:", response.data.token);
  
      localStorage.setItem('token', response.data.token);
      setMensagem("✅ Login feito com sucesso!");
      setCorMensagem("green");
      setLogado(true);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      setTimeout(() => {
        setMensagem("");
        goToHome();
      }, 1000);
  
      inputEmail.current.value = "";
      inputSenha.current.value = "";
      
      console.log("=== FIM LOGIN SUCESSO ===");
    } catch (error) {
      console.error("=== ERRO NO LOGIN ===");
      console.error("Erro completo:", error);
      console.error("Status do erro:", error.response?.status);
      console.error("Dados do erro:", error.response?.data);
      console.error("Mensagem do erro:", error.message);
      
      let errorMessage = "❌ Email ou senha inválidos!";
      
      if (error.response?.data?.message) {
        errorMessage = `❌ ${error.response.data.message}`;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
          errorMessage = `❌ ${errors[errorKeys[0]][0]}`;
        }
      }
      
      setMensagem(errorMessage);
      setCorMensagem("red");
      setTimeout(() => setMensagem(""), 3000);
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
      <div style={{ width: "256px", marginBottom: "10px" }}>
        <label style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "14px",
          color: "#666",
          fontWeight: "500"
        }}>
          Email
        </label>
        <input
          ref={inputEmail}
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            width: "100%",
            boxSizing: "border-box"
          }}
          placeholder="Ex: joao@email.com"
        />
      </div>
      
      <div style={{ width: "256px", marginBottom: "10px" }}>
        <label style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "14px",
          color: "#666",
          fontWeight: "500"
        }}>
          Senha
        </label>
        <input
          type="password"
          ref={inputSenha}
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            width: "100%",
            boxSizing: "border-box"
          }}
          placeholder="Ex: MinhaSenh@123"
        />
      </div>
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
