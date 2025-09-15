import React, { useState, useEffect, useCallback } from "react";
import api from "../Services/API";
import { isLoggedIn } from "../Services/auth";

export default function ProductCard({ product }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [corMensagem, setCorMensagem] = useState("black");

  const fetchImage = useCallback(async () => {
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
      setImageUrl(null);
    } finally {
      setLoadingImage(false);
    }
  }, [product.id]);

  useEffect(() => {
    if (product.id) {
      fetchImage();
    }

    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [fetchImage, product.id]);

  async function handleAddToCart() {
    console.log("=== INÍCIO handleAddToCart ===");
    console.log("Product:", product);
    
    if (!isLoggedIn()) {
      console.log("Usuário não está logado");
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
      
      console.log("Token encontrado:", token.substring(0, 20) + "...");
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const clienteId = payload.id || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      
      console.log("Cliente ID extraído:", clienteId);

      const novoPedido = {
        cliente_id: clienteId,
        itens: [
          {
            item_id: product.id,
            quantidade: 1
          }
        ]
      };

      console.log("Enviando pedido:", novoPedido);
      
      const response = await api.post("/pedido", novoPedido);
      console.log("Resposta da API:", response);

      setMensagem("✅ Item adicionado ao carrinho!");
      setCorMensagem("green");
      setTimeout(() => {
        setMensagem("");
      }, 3000);

    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      console.error("Detalhes do erro:", error.response?.data);
      console.error("Status do erro:", error.response?.status);
      
      let errorMessage = "Erro desconhecido";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMensagem(`❌ Erro ao adicionar item no carrinho: ${errorMessage}`);
      setCorMensagem("red");
      setTimeout(() => {
        setMensagem("");
      }, 3000);
    }
    
    console.log("=== FIM handleAddToCart ===");
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
          background: "white"
        }}>
        {loadingImage ? (
          <div style={{ color: "#666" }}>
            Carregando imagem...
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nome_item}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div style={{ 
            color: "#999", 
            fontSize: "14px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%"
          }}>
            Sem imagem
          </div>
        )}
      </div>
      <div style={{
        background: "rgb(253, 253, 253)",
        color: "black",
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
