import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import api from "../Services/API";

export default function Home({ onProductClick }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/item");
      console.log("Resposta da API (Home):", res.data);
      
      // Verificar se a resposta é um array
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        console.error("Resposta não é um array:", res.data);
        setProducts([]);
        setError("Erro: Formato de dados inválido da API.");
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
      setError("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
          Carregando produtos...
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

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", flexDirection: "column", textAlign: "center" }}>
        <div style={{ color: "red", fontSize: "18px", marginBottom: "20px" }}>⚠️ {error}</div>
        <button 
          onClick={fetchProducts}
          style={{ background: "orange", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", flexDirection: "column", textAlign: "center" }}>
        <div style={{ fontSize: "18px", marginBottom: "20px" }}>📦 Nenhum produto encontrado</div>
        <button 
          onClick={fetchProducts}
          style={{ background: "orange", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
        >
          Recarregar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "20px", 
        background: "#f8f9fa", 
        borderBottom: "1px solid #dee2e6" 
      }}>
        <h2 style={{ 
          margin: 0, 
          color: "#333" 
        }}>
          Produtos
        </h2>
        <button 
          onClick={fetchProducts}
          style={{ background: "orange", color: "white", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer" }}
        >
          Atualizar Pagina
        </button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", padding: "20px" }}>
        {products.map(product => (
          <ProductCard 
          key={product.id}
          product={product}
          onProductClick={onProductClick}
        />
        ))}
      </div>
    </div>
  );
}
