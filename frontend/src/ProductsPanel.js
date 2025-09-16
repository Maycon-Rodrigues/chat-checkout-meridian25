import React, { useState, useEffect } from "react";
import apiService from "./services/api"; // ✅ IMPORTAR API SERVICE
import {
  Package,
  Plus,
  Edit3,
  Link as LinkIcon,
  Copy,
  Eye,
  TrendingUp,
  DollarSign,
  Settings,
  Trash2,
  ExternalLink,
  RefreshCcw,
  Save,
  X,
} from "lucide-react";

function ProductsPanel({ vendor, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    aiPrompt: "",
    tokenOut: "BRL",
    platformFeeBps: 300, // 3% padrão
  });

  // Adicionar classe CSS para permitir scroll
  useEffect(() => {
    document.body.classList.add("dashboard-open");
    return () => {
      document.body.classList.remove("dashboard-open");
    };
  }, []);

  useEffect(() => {
    loadProducts();
  }, [vendor]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const vendorId = vendor?.id || "demo-empresa";

      // ✅ USAR API SERVICE
      const result = await apiService.getProductsByMerchant(
        (merchantId = vendorId),
      );

      if (result.success) {
        setProducts(result.data || []);
      } else {
        console.error("Erro ao carregar produtos:", result.error);
        setProducts([]);
      }
    } catch (err) {
      console.error("Erro ao carregar produtos", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Nome e preço são obrigatórios");
      return;
    }

    try {
      // ✅ USAR API SERVICE
      const result = await apiService.createProduct({
        vendorId: vendor.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        currency: newProduct.tokenOut || "BRL",
        description: newProduct.description,
        aiPrompt:
          newProduct.aiPrompt ||
          `Você é especialista em ${newProduct.name}. Destaque os benefícios.`,
        platformFeeBps: Number(newProduct.platformFeeBps),
      });

      if (!result.success) {
        throw new Error(result.error || "Falha ao criar");
      }

      setNewProduct({
        name: "",
        price: "",
        description: "",
        aiPrompt: "",
        tokenOut: "BRL",
        platformFeeBps: 300,
      });
      setShowAddForm(false);
      await loadProducts();
      alert("✅ Produto criado!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao criar produto: " + err.message);
    }
  };

  const startEdit = (p) => {
    setEditingProduct({
      id: p.id,
      name: p.name,
      price: p.price_brl ?? p.price,
      description: p.description,
      aiPrompt: p.ai_prompt ?? p.aiPrompt,
      tokenOut: p.token_out ?? p.tokenOut ?? "BRL",
      platformFeeBps: p.platform_fee_bps ?? p.platformFeeBps ?? 300,
    });
  };

  const handleEditProduct = async (productId) => {
    if (!editingProduct.name || !editingProduct.price) {
      alert("Nome e preço são obrigatórios");
      return;
    }

    try {
      // ✅ USAR API SERVICE
      const result = await apiService.updateProduct(productId, {
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        description: editingProduct.description,
        aiPrompt: editingProduct.aiPrompt,
        tokenOut: editingProduct.tokenOut,
        platformFeeBps: Number(editingProduct.platformFeeBps),
      });

      if (!result.success) {
        throw new Error(result.error || "Falha ao atualizar");
      }

      setEditingProduct(null);
      await loadProducts();
      alert("✅ Produto atualizado!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao editar produto: " + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Excluir este produto?")) return;

    try {
      // ✅ USAR API SERVICE
      const result = await apiService.deleteProduct(productId);

      if (!result.success) {
        throw new Error(result.error || "Falha ao excluir");
      }

      await loadProducts();
      alert("✅ Produto excluído!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao excluir produto: " + err.message);
    }
  };

  const handleGenerateLink = async (product) => {
    try {
      // ✅ USAR API SERVICE
      const result = await apiService.generateProductLink(
        vendor.id,
        {
          id: product.id,
          name: product.name,
          price: product.price_brl || product.price,
          description: product.description,
          aiPrompt: product.ai_prompt || product.aiPrompt,
          vendorName: vendor.display_name || vendor.name,
          company: vendor.company,
        },
        {
          customMessage: `Olá! Interessado no ${product.name}?`,
          tokenOut: product.token_out ?? product.tokenOut ?? "BRL",
          platformFeeBps:
            product.platform_fee_bps ?? product.platformFeeBps ?? 300,
          vendorWallet:
            vendor?.stellar_public_key ?? vendor?.stellarPublicKey ?? "",
        },
      );

      if (!result.success) {
        throw new Error(result.error || "Falha ao gerar link");
      }

      await loadProducts();

      // ✅ ABRIR LINK EM NOVA ABA PARA TESTE IMEDIATO
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao criar link: " + err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Copiado!");
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const getTokenSymbol = (token) => {
    const symbols = { BRL: "R$", USDC: "$", XLM: "XLM" };
    return symbols[token] || token;
  };

  const getTokenColor = (token) => {
    const colors = {
      BRL: "#10b981",
      USDC: "#2563eb",
      XLM: "#8b5cf6",
    };
    return colors[token] || "#6b7280";
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <h2>Carregando produtos...</h2>
        <p>Preparando catálogo de produtos</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <button onClick={onBack} style={backButtonStyle}>
            ← Dashboard
          </button>
          <div>
            <h1 style={titleStyle}>📦 Gerenciar Produtos</h1>
            <p style={subtitleStyle}>
              {vendor.display_name || vendor.name} • {vendor.company}
            </p>
          </div>
        </div>
        <div style={headerActionsStyle}>
          <button onClick={loadProducts} style={refreshButtonStyle}>
            <RefreshCcw size={16} />
            Atualizar
          </button>
          <button onClick={() => setShowAddForm(true)} style={addButtonStyle}>
            <Plus size={16} />
            Novo Produto
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={formContainerStyle}>
          <div style={formHeaderStyle}>
            <h3 style={formTitleStyle}>
              <Package size={20} />
              Novo Produto
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              style={closeButtonStyle}
            >
              <X size={16} />
            </button>
          </div>

          <div style={formGridStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Nome do Produto *</label>
              <input
                style={inputStyle}
                placeholder="Ex: Curso de JavaScript"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Preço *</label>
              <input
                style={inputStyle}
                type="number"
                placeholder="197.00"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, price: e.target.value }))
                }
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Moeda de Recebimento</label>
              <select
                style={selectStyle}
                value={newProduct.tokenOut}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, tokenOut: e.target.value }))
                }
              >
                <option value="BRL">🇧🇷 Real Brasileiro (BRL)</option>
                <option value="USDC">💰 USD Coin (USDC)</option>
                <option value="XLM">⭐ Stellar Lumens (XLM)</option>
              </select>
            </div>

            <div style={{ ...inputGroupStyle, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Descrição</label>
              <textarea
                style={textareaStyle}
                placeholder="Descreva seu produto..."
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div style={{ ...inputGroupStyle, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Prompt para IA (Opcional)</label>
              <textarea
                style={textareaStyle}
                placeholder="Instruções para o assistente de vendas..."
                value={newProduct.aiPrompt}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, aiPrompt: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>

          <div style={formActionsStyle}>
            <button
              onClick={() => setShowAddForm(false)}
              style={cancelButtonStyle}
            >
              Cancelar
            </button>
            <button onClick={handleAddProduct} style={saveButtonStyle}>
              <Save size={16} />
              Criar Produto
            </button>
          </div>
        </div>
      )}

      <div style={productsGridStyle}>
        {products.length === 0 ? (
          <div style={emptyStateStyle}>
            <Package size={48} style={{ color: "#9ca3af" }} />
            <h3 style={{ color: "#6b7280", margin: "1rem 0 0.5rem 0" }}>
              Nenhum produto encontrado
            </h3>
            <p style={{ color: "#9ca3af", margin: 0 }}>
              Comece criando seu primeiro produto
            </p>
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} style={productCardStyle}>
              <div style={productHeaderStyle}>
                <div style={productInfoStyle}>
                  <h3 style={productNameStyle}>{p.name}</h3>
                  <div style={productMetaStyle}>
                    <span style={productPriceStyle}>
                      {formatCurrency(p.price_brl || p.price)}
                    </span>
                    <span
                      style={{
                        ...tokenBadgeStyle,
                        background: `${getTokenColor(p.token_out || p.tokenOut || "BRL")}20`,
                        color: getTokenColor(
                          p.token_out || p.tokenOut || "BRL",
                        ),
                      }}
                    >
                      {getTokenSymbol(p.token_out || p.currency || "BRL")}{" "}
                      {p.token_out || p.currency || "BRL"}
                    </span>
                  </div>
                  {p.description && (
                    <p style={productDescriptionStyle}>{p.description}</p>
                  )}
                </div>
                <div style={productActionsStyle}>
                  <button onClick={() => startEdit(p)} style={editButtonStyle}>
                    <Edit3 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleGenerateLink(p)}
                    style={linkButtonStyle}
                  >
                    <LinkIcon size={16} />
                    Abrir Link
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    style={deleteButtonStyle}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>

              {Array.isArray(p.links) && p.links.length > 0 && (
                <div style={linksContainerStyle}>
                  <h4 style={linksSectionTitleStyle}>Links Gerados:</h4>
                  <div style={linksListStyle}>
                    {p.links.map((l) => (
                      <div key={l.linkId} style={linkItemStyle}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkUrlStyle}
                        >
                          {l.url}
                        </a>
                        <button
                          onClick={() => copyToClipboard(l.url)}
                          style={copyLinkButtonStyle}
                        >
                          <Copy size={14} />
                          Copiar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {editingProduct && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={formHeaderStyle}>
              <h3 style={formTitleStyle}>
                <Edit3 size={20} />
                Editar Produto
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                style={closeButtonStyle}
              >
                <X size={16} />
              </button>
            </div>

            <div style={formGridStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Nome do Produto *</label>
                <input
                  style={inputStyle}
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Preço *</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct((p) => ({ ...p, price: e.target.value }))
                  }
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Moeda de Recebimento</label>
                <select
                  style={selectStyle}
                  value={editingProduct.tokenOut}
                  onChange={(e) =>
                    setEditingProduct((p) => ({
                      ...p,
                      tokenOut: e.target.value,
                    }))
                  }
                >
                  <option value="BRL">🇧🇷 Real Brasileiro (BRL)</option>
                  <option value="USDC">💰 USD Coin (USDC)</option>
                  <option value="XLM">⭐ Stellar Lumens (XLM)</option>
                </select>
              </div>

              <div style={{ ...inputGroupStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Descrição</label>
                <textarea
                  style={textareaStyle}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div style={{ ...inputGroupStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Prompt para IA</label>
                <textarea
                  style={textareaStyle}
                  value={editingProduct.aiPrompt}
                  onChange={(e) =>
                    setEditingProduct((p) => ({
                      ...p,
                      aiPrompt: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>
            </div>

            <div style={formActionsStyle}>
              <button
                onClick={() => setEditingProduct(null)}
                style={cancelButtonStyle}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEditProduct(editingProduct.id)}
                style={saveButtonStyle}
              >
                <Save size={16} />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ESTILOS (mantendo os mesmos)
const containerStyle = {
  padding: "1.5rem",
  maxWidth: "1200px",
  margin: "0 auto",
  background: "#f8fafc",
  minHeight: "auto",
  paddingBottom: "3rem",
};

const loadingContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "2rem",
};

const loadingSpinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #6366f1",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginBottom: "1rem",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "2rem",
  borderRadius: "16px",
  color: "#ffffff",
  boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
};

const headerContentStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2rem",
};

const backButtonStyle = {
  background: "rgba(255, 255, 255, 0.2)",
  color: "#ffffff",
  border: "none",
  padding: "0.75rem 1.5rem",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const titleStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: "bold",
};

const subtitleStyle = {
  margin: "0.5rem 0 0 0",
  opacity: 0.9,
};

const headerActionsStyle = {
  display: "flex",
  gap: "0.75rem",
};

const refreshButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "rgba(255, 255, 255, 0.2)",
  color: "#ffffff",
  border: "none",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const addButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "#10b981",
  color: "#ffffff",
  border: "none",
  padding: "0.75rem 1.5rem",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "all 0.2s ease",
};

const formContainerStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginBottom: "2rem",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const formHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1.5rem 1.5rem 0 1.5rem",
};

const formTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: "600",
  color: "#1f2937",
};

const closeButtonStyle = {
  background: "#f3f4f6",
  border: "none",
  padding: "0.5rem",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "1.5rem",
  padding: "1.5rem",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const labelStyle = {
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  padding: "0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "1rem",
  transition: "border-color 0.2s ease",
};

const selectStyle = {
  padding: "0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "1rem",
  background: "#ffffff",
  cursor: "pointer",
};

const textareaStyle = {
  padding: "0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "1rem",
  resize: "vertical",
  minHeight: "80px",
};

const formActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
  padding: "0 1.5rem 1.5rem 1.5rem",
  borderTop: "1px solid #e5e7eb",
  marginTop: "1rem",
  paddingTop: "1rem",
};

const cancelButtonStyle = {
  padding: "0.75rem 1.5rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#374151",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const saveButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "8px",
  background: "#10b981",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
  transition: "all 0.2s ease",
};

const productsGridStyle = {
  display: "grid",
  gap: "1.5rem",
};

const emptyStateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "4rem 2rem",
  background: "#ffffff",
  borderRadius: "12px",
  border: "2px dashed #d1d5db",
};

const productCardStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const productHeaderStyle = {
  padding: "1.5rem",
};

const productInfoStyle = {
  marginBottom: "1rem",
};

const productNameStyle = {
  margin: "0 0 0.5rem 0",
  fontSize: "1.25rem",
  fontWeight: "600",
  color: "#1f2937",
};

const productMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "0.5rem",
  flexWrap: "wrap",
};

const productPriceStyle = {
  fontSize: "1.1rem",
  fontWeight: "700",
  color: "#10b981",
};

const tokenBadgeStyle = {
  padding: "0.25rem 0.5rem",
  borderRadius: "6px",
  fontSize: "0.8rem",
  fontWeight: "600",
};

const productDescriptionStyle = {
  margin: "0.5rem 0 0 0",
  color: "#6b7280",
  fontSize: "0.9rem",
  lineHeight: "1.5",
};

const productActionsStyle = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const editButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  background: "#ffffff",
  color: "#374151",
  cursor: "pointer",
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
};

const linkButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "6px",
  background: "#3b82f6",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
};

const deleteButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "6px",
  background: "#ef4444",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
};

const linksContainerStyle = {
  borderTop: "1px solid #e5e7eb",
  padding: "1rem 1.5rem",
};

const linksSectionTitleStyle = {
  margin: "0 0 0.75rem 0",
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#6b7280",
};

const linksListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const linkItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.5rem",
  background: "#f8fafc",
  borderRadius: "6px",
};

const linkUrlStyle = {
  flex: 1,
  color: "#3b82f6",
  textDecoration: "none",
  fontSize: "0.9rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const copyLinkButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.25rem 0.5rem",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  background: "#ffffff",
  color: "#6b7280",
  cursor: "pointer",
  fontSize: "0.8rem",
  transition: "all 0.2s ease",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1rem",
};

const modalContentStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  maxWidth: "600px",
  width: "100%",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
};

export default ProductsPanel;
