import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import api from "../Services/API";

export default function Itens() {
  const [itens, setItens] = useState([]);
  const [editando, setEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");
  
  const nextNewItemId = useRef(-1);

  const fetchItens = async () => {
    try {
      setCarregando(true);
      console.log("Iniciando busca de itens...");
      const response = await api.get("/item");
      console.log("Resposta da API:", response.data);
      console.log("Status da resposta:", response.status);
      
      if (Array.isArray(response.data)) {
        setItens(response.data);
        console.log("Itens carregados com sucesso:", response.data.length);
      } else {
        console.error("Resposta não é um array:", response.data);
        setItens([]);
        setMensagem("Erro: Formato de dados inválido da API.");
        setTimeout(() => setMensagem(""), 5000);
      }
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      console.error("Detalhes do erro:", error.response?.data);
      setItens([]);
      setMensagem("Erro ao carregar itens. Verifique se o backend está rodando.");
      setTimeout(() => setMensagem(""), 5000);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchItens();
  }, []);

  const handleChange = (id, field, value) => {
    if (field === "preco_item") {
      if (value === "" || value === "0") {
        setItens((prev) =>
          prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
        return;
      }
      
      if (/[a-zA-Z]/.test(value)) {
        setMensagem("O preço deve conter apenas números. Use ponto (.) para decimais.");
        setTimeout(() => setMensagem(""), 3000);
        return;
      }
      
      if (value.includes(", ")) {
        setMensagem("Use ponto (.) em vez de vírgula (,) para decimais.");
        setTimeout(() => setMensagem(""), 3000);
        return;
      }
      
      if (value.includes(",")) {
        setMensagem("Use ponto (.) em vez de vírgula (,) para decimais.");
        setTimeout(() => setMensagem(""), 3000);
        return;
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue) && value !== "") {
        setMensagem("Digite um preço válido (apenas números e ponto para decimais).");
        setTimeout(() => setMensagem(""), 3000);
        return;
      }
    }
    
    setItens((prev) => {
      const item = prev.find(p => p.id === id);
      if (item && item[field] === value) {
        return prev;
      }
      return prev.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    });
  };

  const handleImageChange = (id, file) => {
    const preview = URL.createObjectURL(file);
    setItens((prev) =>
      prev.map((p) => (p.id === id ? { ...p, foto_item: preview, file } : p))
    );
  };

  const handleSave = useCallback(async (item) => {
    try {
      const preco = parseFloat(item.preco_item);
      if (isNaN(preco) || preco < 0) {
        setMensagem("Digite um preço válido (apenas números positivos).");
        setTimeout(() => setMensagem(""), 3000);
        return;
      }

      const formData = new FormData();
      formData.append("nome_item", item.nome_item);
      formData.append("preco_item", preco.toString());
      formData.append("descricao_item", item.descricao_item || "");
      if (item.file) formData.append("foto_item", item.file);

      if (item.id < 0) {
        await api.post("/item", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.put(`/item/${item.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setEditando(null);
      
      if (item.id < 0) {
        fetchItens();
      } else {
        const updatedItem = { ...item, id: item.id };
        setItens((prev) => prev.map((p) => (p.id === item.id ? updatedItem : p)));
      }
      
      setMensagem("Item salvo com sucesso!");
      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      setMensagem("Erro ao salvar item. Verifique se o backend está rodando.");
      setTimeout(() => setMensagem(""), 5000);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/item/${id}`);
      setItens((prev) => prev.filter((p) => p.id !== id));
      setMensagem("Item excluído com sucesso!");
      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      setMensagem("Erro ao excluir item. Verifique se o backend está rodando.");
      setTimeout(() => setMensagem(""), 5000);
    }
  };

  const handleAdd = () => {
    const newItem = {
      id: nextNewItemId.current,
      nome_item: "Novo Produto",
      preco_item: 0,
      descricao_item: "Descrição do produto",
      foto_item: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vdm88L3RleHQ+PC9zdmc+",
    };
    setItens((prev) => [...prev, newItem]);
    setEditando(newItem.id);
    nextNewItemId.current--;
  };

  const handleCancel = (id) => {
    if (id < 0) {
      setItens((prev) => prev.filter((p) => p.id !== id));
    }
    setEditando(null);
  };

  const itensRenderizados = useMemo(() => {
    return itens.map((item) => (
      <div
        key={item.id}
        style={{
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ position: "relative", height: "180px" }}>
          <img
            src={
              item.foto_item?.startsWith("Storage")
                ? `/api/v1/item/${item.id}/download?t=${Date.now()}`
                : item.foto_item
            }
            alt={item.nome_item}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div style={{
            display: "none",
            width: "100%",
            height: "100%",
            backgroundColor: "#f0f0f0",
            color: "#999",
            fontSize: "14px",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 0,
            left: 0
          }}>
            Sem imagem
          </div>
          {editando === item.id && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(item.id, e.target.files[0])
              }
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
          )}
        </div>

        <div style={{ padding: "20px", flex: "1", boxSizing: "border-box" }}>
          {editando === item.id ? (
            <>
              <input
                type="text"
                value={item.nome_item}
                onChange={(e) =>
                  handleChange(item.id, "nome_item", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  marginBottom: "12px",
                  border: "1px rgb(126, 126, 126)",
                  borderRadius: "10px",
                  fontSize: "16px",
                  backgroundColor: "#fff",
                  color: "#333",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(255, 107, 26, 0.1)"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#ff8c42";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 26, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ff6b1a";
                  e.target.style.boxShadow = "0 2px 8px rgba(255, 107, 26, 0.1)";
                }}
              />
              <input
                type="text"
                placeholder="Ex: 10.50"
                value={item.preco_item}
                onChange={(e) =>
                  handleChange(item.id, "preco_item", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  marginBottom: "12px",
                  border: "1px rgb(126, 126, 126)",
                  borderRadius: "10px",
                  fontSize: "16px",
                  backgroundColor: "#fff",
                  color: "#333",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(255, 107, 26, 0.1)"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#ff8c42";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 26, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ff6b1a";
                  e.target.style.boxShadow = "0 2px 8px rgba(255, 107, 26, 0.1)";
                }}
              />
              <textarea
                placeholder="Descrição do produto"
                value={item.descricao_item || ""}
                onChange={(e) =>
                  handleChange(item.id, "descricao_item", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px rgb(126, 126, 126)",
                  borderRadius: "10px",
                  fontSize: "16px",
                  backgroundColor: "#fff",
                  color: "#333",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(255, 107, 26, 0.1)",
                  minHeight: "80px",
                  resize: "vertical"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#ff8c42";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 26, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ff6b1a";
                  e.target.style.boxShadow = "0 2px 8px rgba(255, 107, 26, 0.1)";
                }}
              />
            </>
          ) : (
            <>
              <h3 style={{ margin: "0 0 5px 0" }}>{item.nome_item}</h3>
              <p style={{ margin: "0 0 5px 0", color: "#666" }}>
                R$ {Number(item.preco_item).toFixed(2)}
              </p>
              <p style={{ margin: 0, color: "#888", fontSize: "14px", lineHeight: "1.4" }}>
                {item.descricao_item || "Sem descrição"}
              </p>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "15px 20px",
            borderTop: "1px solid #eee",
            boxSizing: "border-box"
          }}
        >
          {editando === item.id ? (
            <>
              <button
                onClick={() => handleSave(item)}
                style={{
                  flex: 1,
                  background: "blue",
                  color: "white",
                  border: "none",
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "400",
                  fontSize: "14px"
                }}
              >
                💾 Salvar
              </button>
              <button
                onClick={() => handleCancel(item.id)}
                style={{
                  flex: 1,
                  background: "gray",
                  color: "white",
                  border: "none",
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "400",
                  fontSize: "14px"
                }}
              >
                ❌ Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditando(item.id)}
              style={{
                flex: 1,
                background: "orange",
                color: "white",
                border: "none",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "400",
                fontSize: "14px"
              }}
            >
              ✏️ Atualizar
            </button>
          )}
          <button
            onClick={() => handleDelete(item.id)}
            style={{
              flex: 1,
              background: "red",
              color: "white",
              border: "none",
              padding: "8px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "400",
              fontSize: "14px"
            }}
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    ));
  }, [itens, editando, handleSave]);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Mensagem */}
      {mensagem && (
        <div
          style={{
            background: mensagem.includes("sucesso") ? "#d4edda" : "#f8d7da",
            color: mensagem.includes("sucesso") ? "#155724" : "#721c24",
            padding: "12px 20px",
            margin: "10px 20px",
            borderRadius: "6px",
            border: `1px solid ${mensagem.includes("sucesso") ? "#c3e6cb" : "#f5c6cb"}`,
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {mensagem}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "25px",
          background: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
          marginBottom: "10px"
        }}
      >
        <h2 style={{ 
          margin: 0, 
          color: "black", 
          fontSize: "28px",
          fontWeight: "400",
          fontStyle: "italic"
        }}>
          Painel do Administrador
        </h2>
        <button
          onClick={handleAdd}
          style={{
            background: "green",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "400",
            fontSize: "14px"
          }}
        >
          ➕ Adicionar Produto
        </button>
      </div>

      {/* Grid de Itens */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          padding: "20px",
          maxWidth: "1400px",
          margin: "0 auto",
          boxSizing: "border-box",
          background: "#f5f5f5"
        }}
      >
        {carregando ? (
          <div style={{ 
            gridColumn: "1 / -1", 
            textAlign: "center", 
            padding: "40px",
            fontSize: "18px",
            color: "#666"
          }}>
            Carregando itens...
          </div>
        ) : (
          itensRenderizados
        )}
      </div>
    </div>
  );
}
