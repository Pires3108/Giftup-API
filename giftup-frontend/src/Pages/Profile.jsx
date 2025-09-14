import { useState, useEffect } from "react";
import Button from "../components/Button";
import api from "../Services/API";

export default function Profile() {
  const [form, setForm] = useState({
    nome_cliente: "",
    email_cliente: "",
    datanascimento_cliente: "",
    senha: ""
  });

  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [corMensagem, setCorMensagem] = useState("black");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCliente() {
      setLoading(true);
      setMensagem("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Usuário não autenticado");

        const response = await api.get("/cliente/Cliente", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setForm({
          nome_cliente: response.data.nome_cliente,
          email_cliente: response.data.email_cliente,
          datanascimento_cliente: response.data.datanascimento_cliente,
          senha: ""
        });
      } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error.response?.data || error.message);

        if (error.response) {
          if (error.response.status === 401) {
            setMensagem("❌ Sessão expirada. Faça login novamente.");
          } else if (error.response.status === 500) {
            setMensagem("❌ Erro no servidor. Tente mais tarde.");
          } else {
            setMensagem("❌ Erro ao carregar dados do cliente.");
          }
        } else {
          setMensagem(error.message || "❌ Erro desconhecido.");
        }

        setCorMensagem("red");
      } finally {
        setLoading(false);
      }
    }
    fetchCliente();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");

      await api.put("/cliente/unico", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensagem("✅ Dados atualizados com sucesso!");
      setCorMensagem("green");
      setEditando(false);
      setForm({ ...form, senha: "" });
      setTimeout(() => setMensagem(""), 2000);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error.response?.data || error.message);

      if (error.response) {
        if (error.response.status === 401) {
          setMensagem("❌ Sessão expirada. Faça login novamente.");
        } else if (error.response.status === 500) {
          setMensagem("❌ Erro no servidor. Tente mais tarde.");
        } else {
          setMensagem("❌ Erro ao atualizar os dados!");
        }
      } else {
        setMensagem(error.message || "❌ Erro desconhecido.");
      }

      setCorMensagem("red");
    }
  };

  const handleCancel = () => {
    setEditando(false);
    setMensagem("");
  };

  const handleDeleteAccount = async () => {
    const confirmacao = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.");

    if (!confirmacao) return;

    setMensagem("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");

      await api.delete("/cliente/Cliente", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensagem("✅ Conta excluída com sucesso!");
      setCorMensagem("green");

      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      }, 2000);

    } catch (error) {
      console.error("Erro ao excluir conta:", error.response?.data || error.message);
      setMensagem("❌ Erro ao excluir a conta!");
      setCorMensagem("red");
    }
  };

  if (loading) return <p>Carregando perfil...</p>;

  return (
    <main style={{
      maxWidth: "600px",
      margin: "20px auto",
      padding: "0 20px",
      boxSizing: "border-box",
      minHeight: "calc(100vh - 100px)"
    }}>
      <section style={{
        background: "#f7f7f7",
        borderRadius: "16px",
        padding: "30px",
        boxSizing: "border-box",
        boxShadow: "0 8px 32px rgba(255, 94, 7, 0.18)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "20px",
          borderBottom: "2px solid rgba(163, 162, 162, 0.2)",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px"
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "700",
              color: "black",
              textShadow: "0 2px 4px rgba(54, 54, 54, 0.1)"
            }}>
              Meus dados
            </h2>
            <p style={{
              margin: "8px 0 0",
              color: "rgba(0, 0, 0, 0.9)",
              fontSize: "16px",
              fontWeight: "400"
            }}>
              Edite suas informações pessoais
            </p>
          </div>
          <div style={
            { 
              display: "flex", 
              gap: "12px", 
              flexWrap: "wrap" 
              }
              }>
            {!editando && (
              <Button
                onClick={() => setEditando(true)}
                style={{
                  background: "rgba(250, 246, 246, 0.9)",
                  border: "2px solid rgba(255, 254, 254, 0.3)",
                  color: "#ff6b1a",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "rgba(201, 198, 198, 0.9)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.9)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                ✏️ Editar
              </Button>
            )}
            <Button
              onClick={handleDeleteAccount}
              style={{
                background: "rgba(220, 53, 69, 0.9)",
                border: "2px solid rgba(220, 53, 69, 0.3)",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#dc3545";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(220, 53, 69, 0.9)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              🗑️ Excluir Conta
            </Button>
          </div>
        </div>

        <form style={{ 
          display: "grid", 
          gap: "20px" 
          }} 
          onSubmit={handleSubmit}>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "8px" }}>
            <label style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "rgb(61, 60, 60)",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)"
            }}>
              Nome completo
            </label>
            <input
              type="text"
              name="nome_cliente"
              value={form.nome_cliente}
              onChange={handleChange}
              disabled={!editando}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: `2px solid ${!editando ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.8)"}`,
                borderRadius: "12px",
                fontSize: "16px",
                  backgroundColor: !editando ? "rgba(177, 171, 171, 0.1)" : "rgba(255, 255, 255, 0.95)",
                  color: !editando ? "rgba(170, 166, 166, 0.8)" : "#333",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
            />
          </div>

           <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
             <label style={{
               fontSize: "16px",
               fontWeight: "600",
               color: "rgb(61, 60, 60)",
               textShadow: "0 1px 2px rgba(0,0,0,0.1)"
             }}>
               E-mail
             </label>
             <input
               type="email"
               name="email_cliente"
               value={form.email_cliente}
               onChange={handleChange}
               disabled={!editando}
               placeholder="Digite seu e-mail"
               style={{
                 width: "100%",
                 padding: "14px 16px",
                 border: `2px solid ${!editando ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.8)"}`,
                 borderRadius: "12px",
                 fontSize: "16px",
                 backgroundColor: !editando ? "rgba(177, 171, 171, 0.1)" : "rgba(255, 255, 255, 0.95)",
                 color: !editando ? "rgba(170, 166, 166, 0.8)" : "#333",
                 transition: "all 0.3s ease",
                 boxSizing: "border-box"
               }}
             />
           </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "rgb(61, 60, 60)",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)"
            }}>
              Data de nascimento
            </label>
            <input
              type="date"
              name="datanascimento_cliente"
              value={form.datanascimento_cliente}
              onChange={handleChange}
              disabled={!editando}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: `2px solid ${!editando ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.8)"}`,
                borderRadius: "12px",
                fontSize: "16px",
                backgroundColor: !editando ? "rgba(177, 171, 171, 0.1)" : "rgba(255, 255, 255, 0.95)",
                color: !editando ? "rgba(170, 166, 166, 0.8)" : "#333",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "rgb(61, 60, 60)",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)"
            }}>
              Nova senha (opcional)
            </label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder={"Deixe em branco para manter"}
              disabled={!editando}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: `2px solid ${!editando ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.8)"}`,
                borderRadius: "12px",
                fontSize: "16px",
                backgroundColor: !editando ? "rgba(177, 171, 171, 0.1)" : "rgba(255, 255, 255, 0.95)",
                color: !editando ? "rgba(170, 166, 166, 0.8)" : "#333",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
            />
          </div>

          {editando && (
            <div style={{
              display: "flex",
              gap: "15px",
              justifyContent: "flex-end",
              marginTop: "10px",
              flexWrap: "wrap"
            }}>
              <Button
                type="button"
                onClick={handleCancel}
                style={{
                  background: "rgba(220, 53, 69, 0.9)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontWeight: "600",
                  fontSize: "16px",
                  border: "2px solid rgba(220, 53, 69, 0.3)",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#dc3545";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(220, 53, 69, 0.9)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                ❌ Cancelar
              </Button>
              <Button
                type="submit"
                style={{
                  background: "rgba(40, 167, 69, 0.9)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontWeight: "600",
                  fontSize: "16px",
                  border: "2px solid rgba(40, 167, 69, 0.3)",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#28a745";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(40, 167, 69, 0.9)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                💾 Salvar
              </Button>
            </div>
          )}
        </form>

        {mensagem && (
          <div style={{
            marginTop: "20px",
            padding: "15px 20px",
            borderRadius: "12px",
            backgroundColor: corMensagem === "green" ? "rgba(40, 167, 69, 0.1)" : "rgba(220, 53, 69, 0.1)",
            border: `2px solid ${corMensagem === "green" ? "rgba(40, 167, 69, 0.3)" : "rgba(220, 53, 69, 0.3)"}`,
            color: corMensagem === "green" ? "#155724" : "#721c24",
            fontWeight: "600",
            fontSize: "16px",
            textAlign: "center"
          }}>
            {mensagem}
          </div>
        )}
      </section>
    </main>
  );
}
