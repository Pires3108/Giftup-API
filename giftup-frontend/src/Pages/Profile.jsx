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
    <main style={{ maxWidth: "500px", margin: "30px auto", padding: "0 16px", boxSizing: "border-box" }}>
      <section style={{ background: "#f7f7f7", borderRadius: "12px", padding: "20px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #eee", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Meus dados</h2>
            <p style={{ margin: "2px 0 0", color: "#888", fontSize: "13px" }}>Edite suas informações pessoais</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {!editando && (
              <Button
                onClick={() => setEditando(true)}
                style={{ background: "#fff", border: "1px solid #ddd", color: "#333", padding: "8px 12px", borderRadius: "8px" }}
              >
                Editar
              </Button>
            )}
            <Button
              onClick={handleDeleteAccount}
              style={{ background: "#dc3545", border: "1px solid #dc3545", color: "#fff", padding: "8px 12px", borderRadius: "8px" }}
            >
              Excluir Conta
            </Button>
          </div>
        </div>

        <form style={{ display: "grid", gap: "16px" }} onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500" }}>Nome completo</label>
            <input
              type="text"
              name="nome_cliente"
              value={form.nome_cliente}
              onChange={handleChange}
              disabled={!editando}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", backgroundColor: !editando ? "#f5f5f5" : "#fff" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500" }}>E-mail</label>
            <input
              type="email"
              name="email_cliente"
              value={form.email_cliente}
              onChange={handleChange}
              disabled={!editando}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", backgroundColor: !editando ? "#f5f5f5" : "#fff" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500" }}>Data de nascimento</label>
            <input
              type="date"
              name="datanascimento_cliente"
              value={form.datanascimento_cliente}
              onChange={handleChange}
              disabled={!editando}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", backgroundColor: !editando ? "#f5f5f5" : "#fff" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500" }}>Nova senha (opcional)</label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="Deixe em branco para manter"
              disabled={!editando}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", backgroundColor: !editando ? "#f5f5f5" : "#fff" }}
            />
          </div>

          {editando && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button type="button" onClick={handleCancel} style={{ background: "#dc3545", color: "#fff", borderRadius: "8px" }}>
                Cancelar
              </Button>
              <Button type="submit" style={{ background: "#28a745", color: "#fff", borderRadius: "8px" }}>
                Salvar
              </Button>
            </div>
          )}
        </form>

        {mensagem && <p style={{ marginTop: "15px", color: corMensagem, fontWeight: "bold" }}>{mensagem}</p>}
      </section>
    </main>
  );
}
