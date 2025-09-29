import React, { useState, useEffect, useCallback } from "react";
import api from "../Services/API";
import { isLoggedIn } from "../Services/auth";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";

export default function ProductDetail({ productId, onBack }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mensagem, setMensagem] = useState("");
  const [corMensagem, setCorMensagem] = useState("black");

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/item/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      setMensagem("❌ Produto não encontrado");
      setCorMensagem("red");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
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
      const clienteId = payload.id || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

      const novoPedido = {
        cliente_id: clienteId,
        itens: [
          {
            item_id: product.id,
            quantidade: quantity
          }
        ]
      };
      
      await api.post("/pedido", novoPedido);

      setMensagem("✅ Item adicionado ao carrinho!");
      setCorMensagem("green");
      setTimeout(() => {
        setMensagem("");
      }, 3000);

    } catch (error) {
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
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px", 
        flexDirection: "column" 
      }}>
        <div style={{ 
          width: "50px", 
          height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid orange",
          borderRadius: "50%",
          animation: "spin 1s linear infinite" 
        }} />
        <p style={{ 
          marginTop: "20px",
          fontSize: "18px" 
        }}>
          Carregando produto...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px", 
        flexDirection: "column",
        textAlign: "center"
      }}>
        <h2 style={{ color: "red", marginBottom: "20px" }}>Produto não encontrado</h2>
        <button 
          onClick={onBack}
          style={{ 
            background: "orange", 
            color: "white", 
            border: "none", 
            padding: "10px 20px", 
            borderRadius: "5px", 
            cursor: "pointer", 
            fontSize: "16px" 
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Botão Voltar */}
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "transparent",
          border: "1px solid #ddd",
          padding: "8px 16px",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px",
          color: "#333"
        }}
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "40px", 
        alignItems: "start" 
      }} className="product-detail-grid">
        {/* Imagem do Produto */}
        <div style={{ 
          background: "white", 
          borderRadius: "8px", 
          padding: "20px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8f9fa",
            borderRadius: "8px"
          }}>
            <img
              src={`/api/v1/item/${product.id}/download?t=${Date.now()}`}
              alt={product.nome_item}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                display: imageError ? "none" : "block"
              }}
              onError={() => setImageError(true)}
            />
            {imageError && (
              <div style={{ 
                color: "#999", 
                fontSize: "16px",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                background: "#f8f9fa"
              }}>
                Sem imagem
              </div>
            )}
          </div>
        </div>

        {/* Informações do Produto */}
        <div style={{ 
          background: "white", 
          borderRadius: "8px", 
          padding: "30px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ 
            fontSize: "28px", 
            marginBottom: "15px", 
            color: "#333",
            fontWeight: "bold"
          }}>
            {product.nome_item}
          </h1>

          <div style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            color: "orange", 
            marginBottom: "20px" 
          }} className="price">
            R$ {product.preco_item.toFixed(2).replace('.', ',')}
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ 
              fontSize: "18px", 
              marginBottom: "10px", 
              color: "#333" 
            }}>
              Descrição
            </h3>
            <p style={{ 
              fontSize: "16px", 
              lineHeight: "1.6", 
              color: "#666",
              margin: 0
            }} className="description">
              {product.descricao_item || "Descrição não disponível."}
            </p>
          </div>

          {/* Seletor de Quantidade */}
          <div style={{ marginBottom: "30px" }} className="quantity-section">
            <h3 style={{ 
              fontSize: "18px", 
              marginBottom: "15px", 
              color: "#333" 
            }}>
              Quantidade
            </h3>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "15px" 
            }}>
              <button
                onClick={() => handleQuantityChange(-1)}
                style={{
                  background: "#f8f9fa",
                  border: "1px solid #ddd",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#333"
                }}
              >
                <Minus size={16} />
              </button>
              
              <span style={{ 
                fontSize: "18px", 
                fontWeight: "bold", 
                minWidth: "30px", 
                textAlign: "center" 
              }}>
                {quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(1)}
                style={{
                  background: "#f8f9fa",
                  border: "1px solid #ddd",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#333"
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Botão Adicionar ao Carrinho */}
          <button
            onClick={handleAddToCart}
            style={{
              width: "100%",
              background: "orange",
              color: "white",
              padding: "15px 30px",
              borderRadius: "8px",
              cursor: "pointer",
              border: "none",
              fontSize: "18px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "background 0.3s"
            }}
            className="add-to-cart-btn"
            onMouseOver={(e) => e.target.style.background = "#e67e00"}
            onMouseOut={(e) => e.target.style.background = "orange"}
          >
            <ShoppingCart size={20} />
            Adicionar ao Carrinho
          </button>

          {/* Mensagem de Status */}
          {mensagem && (
            <div style={{ 
              marginTop: "20px", 
              padding: "10px", 
              borderRadius: "5px", 
              background: corMensagem === "green" ? "#d4edda" : "#f8d7da",
              color: corMensagem === "green" ? "#155724" : "#721c24",
              textAlign: "center",
              fontWeight: "bold"
            }}>
              {mensagem}
            </div>
          )}
        </div>
      </div>
      
      {/* CSS Responsivo */}
      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .product-detail-grid > div {
            padding: 15px !important;
          }
          
          .product-detail-grid h1 {
            font-size: 24px !important;
          }
          
          .product-detail-grid .price {
            font-size: 20px !important;
          }
          
          .product-detail-grid .description {
            font-size: 14px !important;
          }
          
          .product-detail-grid .quantity-section h3 {
            font-size: 16px !important;
          }
          
          .product-detail-grid .add-to-cart-btn {
            font-size: 16px !important;
            padding: 12px 20px !important;
          }
        }
        
        @media (max-width: 480px) {
          .product-detail-grid {
            padding: 10px !important;
          }
          
          .product-detail-grid > div {
            padding: 10px !important;
          }
          
          .product-detail-grid h1 {
            font-size: 20px !important;
          }
          
          .product-detail-grid .price {
            font-size: 18px !important;
          }
          
          .product-detail-grid .description {
            font-size: 13px !important;
          }
          
          .product-detail-grid .add-to-cart-btn {
            font-size: 14px !important;
            padding: 10px 15px !important;
          }
        }
      `}</style>
    </div>
  );
}
