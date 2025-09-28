import React, { useState } from "react";

export default function ProductCard({ product, onProductClick }) {
  const [imageError, setImageError] = useState(false);

  function handleViewProduct() {
    if (onProductClick) {
      onProductClick(product.id);
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
          background: "white"
        }}>
        <img
          src={`/api/v1/item/${product.id}/download?t=${Date.now()}`}
          alt={product.nome_item}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: imageError ? "none" : "block"
          }}
          onError={() => setImageError(true)}
        />
        {imageError && (
          <div style={{ 
            color: "#999", 
            fontSize: "14px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            background: "#f0f0f0"
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
          onClick={handleViewProduct}
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
          Ver Produto
        </button>
      </div>
    </div>
  );
}
