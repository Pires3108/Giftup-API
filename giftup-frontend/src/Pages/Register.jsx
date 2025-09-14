import React, { useRef, useState } from "react";
import Button from "../components/Button";
import api from "../Services/API";

export default function Register({ goToLogin }) {
  const [cliente, setCliente] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [corMensagem, setCorMensagem] = useState("black");

  const inputName = useRef();
  const inputDataNasc = useRef();
  const inputEmail = useRef();
  const inputSenha = useRef();

  async function createUsers() {
    try {
      const novoCliente = {
        nome_cliente: inputName.current.value,
        datanascimento_cliente: inputDataNasc.current.value,
        email_cliente: inputEmail.current.value,
        senha: inputSenha.current.value,
      };

      const response = await api.post("/cliente", novoCliente);
      setCliente(novoCliente);

      setMensagem("✅ Cadastro feito com sucesso! Redirecionando...");
      setCorMensagem("green");
      setTimeout(() => {
        setMensagem("");
        goToLogin();
       }, 1000);

      inputName.current.value = "";
      inputDataNasc.current.value = "";
      inputEmail.current.value = "";
      inputSenha.current.value = "";

    } catch (error) {
      let msg = "❌ Erro ao cadastrar!";
      const status = error.response?.status;
      const data = error.response?.data;
      if (status === 409) {
        msg = "❌ Email já cadastrado. Tente fazer login ou use outro email.";
      } else if (status === 400 && data?.errors) {
        msg = "❌ Dados inválidos. Verifique os campos e tente novamente.";
      }
      setMensagem(msg);
      setCorMensagem("red");
      setTimeout(() => setMensagem(""), 2000);

      console.error(
        "Erro ao cadastrar:",
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
        padding: "20px",
      }}
    >

      <h2 style={{
          textAlign: "center",
          color: "orange",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}>
          Seja Bem Vindo
      </h2>

      <input
        ref={inputName}
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          marginBottom: "10px",
          width: "256px",
        }}
        placeholder="Nome Completo"
      />
      <input
        ref={inputDataNasc}
        type="date"
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          marginBottom: "10px",
          width: "256px",
        }}
        placeholder="Data de Nascimento"
      />
      <input
        ref={inputEmail}
        type="email"
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          marginBottom: "10px",
          width: "256px",
        }}
        placeholder="Email"
      />
      <input
        ref={inputSenha}
        type="password"
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          marginBottom: "20px",
          width: "256px",
        }}
        placeholder="Senha"
      />

      <h3
        style={{
          color: "blue",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        onClick={goToLogin}
      >
        Entrar
      </h3>

      <Button
        style={{ background: "orange", color: "white", width: "256px" }}
        onClick={createUsers}>Cadastrar</Button>
      {mensagem && (
        <p style={{ marginTop: "15px", color: corMensagem, fontWeight: "bold" }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
