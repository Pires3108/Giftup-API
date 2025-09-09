import React, { useState, useEffect } from "react";
import api from "../Services/API";
import { isLoggedIn } from "../Services/auth";

export default function ProductCard({ product }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [corMensagem, setCorMensagem] = useState("black");

  const fetchImage = async () => {
    try {
      setLoadingImage(true);

      const response = await api.get(`/item/${product.id}/download`, {
        responseType: 'blob'
      });

      const imageBlob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      setImageUrl('https://via.placeholder.com/150x150?text=Sem+Imagem');
    } finally {
      setLoadingImage(false);
    }
  };

  useEffect(() => {
    if (product.id) {
      fetchImage();
    }

    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [product.id]);

  async function handleAddToCart() {
    if (!isLoggedIn()) {
      setMensagem("🔒 Faça login para adicionar ao carrinho");
      setCorMensagem("red");
      setTimeout(() => {
        setMensagem("");
      }, 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const clienteId = payload.id;

      const novoPedido = {
        cliente_id: clienteId,
        itens: [
          {
            item_id: product.id,
            quantidade: 1
          }
        ]
      };

      const response = await api.post("/pedido", novoPedido);

      setMensagem("✅ Item adicionado ao carrinho!");
      setCorMensagem("green");
      setTimeout(() => {
        setMensagem("");
      }, 3000);

    } catch (error) {
      setMensagem("❌ Erro ao adicionar item no carrinho!");
      setCorMensagem("red");
      setTimeout(() => {
        setMensagem("");
      }, 3000);
    }
  };

  return (
    <div
      style={{
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        overflow: "hidden"
      }}>
      <div
        style={{
          height: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5"
        }}>
        {loadingImage ? (
          <div style={{ color: "#666" }}>
            Carregando imagem...
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={product.nome_item}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        )}
      </div>
      <div style={{
        background: "#333",
        color: "#fff",
        padding: "15px"
      }}>
        <p style={{
          fontWeight: "bold",
          margin: "0 0 10px 0",
          fontSize: "14px"
        }}>
          {product.nome_item}
        </p>
        <p style={{
          margin: "0 0 15px 0",
          fontSize: "14px"
        }}>
          Preço: R$ {product.preco_item.toFixed(2).replace('.', ',')}
        </p>
        <button
          onClick={handleAddToCart}
          style={{
            width: "100%",
            marginTop: "10px",
            background: "orange",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            border: "none"
          }}>
          Adicionar ao Carrinho
        </button>
      </div>
      {mensagem && (
        <p style={{ marginTop: "15px", color: corMensagem, fontWeight: "bold" }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
