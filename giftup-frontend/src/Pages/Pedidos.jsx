import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import api from "../Services/API";

export default function Pedidos({ goToHome }) {
  const [pedidos, setPedidos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [corMensagem, setCorMensagem] = useState("black");
  const [loading, setLoading] = useState(true);
  const [erroAutenticacao, setErroAutenticacao] = useState(false);

  const fetchPedidos = async () => {
    setLoading(true);
    setMensagem("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");

      const response = await api.get("pedido/Cliente", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPedidos(response.data);
      setErroAutenticacao(false);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error.response || error.message);

      if (!localStorage.getItem("token") || error.response?.status === 401) {
        setErroAutenticacao(true);
      } else if (error.response?.status === 500) {
        setMensagem("❌ Erro no servidor. Tente mais tarde.");
        setCorMensagem("red");
      } else {
        setMensagem("❌ Erro ao carregar pedidos.");
        setCorMensagem("red");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const cancelarPedido = async (id) => {
    setMensagem("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");

      await api.delete(`/pedido/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensagem("❌ Pedido cancelado!");
      setCorMensagem("red");
      setTimeout(() => setMensagem(""), 1500);
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao excluir pedido:", error.response || error.message);
      setMensagem("❌ Não foi possível cancelar o pedido.");
      setCorMensagem("red");
    }
  };

  const concluirPedido = async (pedidoId) => {
    setMensagem("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");

      await api.delete(`/pedido/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensagem("✅ Pedido concluído com sucesso!");
      setCorMensagem("green");
      setTimeout(() => setMensagem(""), 1500);
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao concluir pedido:", error.response || error.message);
      setMensagem("❌ Não foi possível concluir o pedido.");
      setCorMensagem("red");
    }
  };

  const alterarQuantidade = async (pedidoId, itemId, mudanca) => {
    setMensagem("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");

      const pedidoAtual = pedidos.find(p => p.id === pedidoId);
      if (!pedidoAtual) {
        setMensagem("❌ Pedido não encontrado.");
        setCorMensagem("red");
        return;
      }

      const itemEncontrado = pedidoAtual.items.find(item => item.item_id === itemId);

      if (!itemEncontrado) {
        setMensagem("❌ Item não encontrado no pedido.");
        setCorMensagem("red");
        return;
      }

      const novaQuantidade = itemEncontrado.quantidade + mudanca;
      
      if (novaQuantidade < 1) {
        setMensagem("❌ Quantidade não pode ser menor que 1.");
        setCorMensagem("red");
        return;
      }

      const itensAtualizados = pedidoAtual.items.map(item => {
        if (item.item_id === itemId) {
          return { ...item, quantidade: novaQuantidade };
        }
        return item;
      });

      const payload = JSON.parse(atob(token.split('.')[1]));
      const clienteId = payload.id;

      const dadosAtualizacao = {
        cliente_id: clienteId,
        itens: itensAtualizados.map(item => ({
          item_id: item.item_id,
          quantidade: item.quantidade
        }))
      };

      await api.put("/pedido/Cliente", dadosAtualizacao, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensagem(`✅ Quantidade ${mudanca > 0 ? 'aumentada' : 'diminuída'} com sucesso!`);
      setCorMensagem("green");
      setTimeout(() => setMensagem(""), 1500);
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao alterar quantidade:", error.response || error.message);
      setMensagem("❌ Não foi possível alterar a quantidade.");
      setCorMensagem("red");
    }
  };

  if (loading) return <p>Carregando pedidos...</p>;

  if (erroAutenticacao) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "18px", fontWeight: "bold", color: "red" }}>
          ❌ Você não está autenticado.
        </p>
        <Button
          onClick={() => (window.location.href = "/login")}
          style={{ marginTop: "15px", background: "orange", color: "#fff" }}
        >
          Ir para Login
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
      <h2
        style={{
          textAlign: "center",
          color: "orange",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Meus Pedidos
      </h2>

      {mensagem && (
        <p style={{ marginTop: "15px", color: corMensagem, fontWeight: "bold" }}>
          {mensagem}
        </p>
      )}

      {pedidos.length > 0 ? (
        pedidos.map((pedido) => {
          const total = (pedido.items || []).reduce(
            (acc, item) => acc + item.preco * item.quantidade,
            0
          );

          return (
            <div
              key={pedido.id}
              style={{
                background: "#eee",
                borderRadius: "16px",
                padding: "15px",
                marginBottom: "15px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ fontWeight: "bold" }}>Pedido #{pedido.id}</h3>

              {(pedido.items || []).map((item, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: "8px",
                  padding: "8px",
                  background: "#f8f9fa",
                  borderRadius: "8px"
                }}>
                  <div>
                    <p style={{ margin: "0", fontWeight: "bold" }}>{item.nome}</p>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                      Qtd: {item.quantidade} - R$ {item.preco.toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <Button
                      onClick={() => alterarQuantidade(pedido.id, item.item_id, -1)}
                      style={{ 
                        background: "#dc3545", 
                        color: "white", 
                        padding: "4px 8px",
                        fontSize: "12px",
                        minWidth: "auto"
                      }}
                    >
                      -1
                    </Button>
                    <Button
                      onClick={() => alterarQuantidade(pedido.id, item.item_id, 1)}
                      style={{ 
                        background: "orange", 
                        color: "white", 
                        padding: "4px 8px",
                        fontSize: "12px",
                        minWidth: "auto"
                      }}
                    >
                      +1
                    </Button>
                  </div>
                </div>
              ))}

              <p>
                <strong>Preço total: R$ {total.toFixed(2)}</strong>
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <Button
                  onClick={() => concluirPedido(pedido.id)}
                  style={{ background: "green", color: "#fff" }}
                >
                  Concluir ✔
                </Button>
                <Button
                  onClick={() => cancelarPedido(pedido.id)}
                  style={{ background: "red", color: "#fff" }}
                >
                  Cancelar ✖
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ textAlign: "center" }}>
          <h3 style={{ color: "#666" }}>Nenhum pedido encontrado.</h3>
          <Button
            className="button-stylish"
            onClick={goToHome}
            style={{ background: "orange", color: "#fff" }}
          >
            Continuar comprando
          </Button>
        </div>
      )}
    </div>
  );
}
