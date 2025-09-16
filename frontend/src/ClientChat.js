import React, { useState, useEffect, useRef, useCallback } from "react";
import apiService from "./services/api"; // ✅ IMPORTAR API SERVICE
import { Send, MessageCircle, Bot, User, CreditCard } from "lucide-react";
import InlineCheckout from "./InlineCheckout";
import "./App.css";
import stellarPassKey from "./StellarPassKey";
import { getAccountAssets } from "./services/stellar";

function ClientChat({
  vendorId = "demo-empresa",
  productConfig,
  customSystemPrompt,
  initialMessage,
  theme,
  onConversion,
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // ✅ Sempre conectado (local)
  const [products, setProducts] = useState([]);
  const [vendorConfig, setVendorConfig] = useState(null);
  const messagesEndRef = useRef(null);

  // ✅ NOVOS ESTADOS PARA O FLUXO CRIPTO
  const [walletConnected, setWalletConnected] = useState(false);
  const [detectedTokens, setDetectedTokens] = useState([]);
  const [selectedTokenIn, setSelectedTokenIn] = useState(null);
  const [reflectorQuote, setReflectorQuote] = useState(null);
  const [soroswapPreview, setSoroswapPreview] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(null);

  // ✅ useRef para garantir que mensagem inicial seja adicionada apenas uma vez
  const welcomeMessageAdded = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadVendorConfig = useCallback(async () => {
    // ✅ Simular carregamento de config (mock)
    setVendorConfig({
      branding: {
        companyName: theme?.companyName || "ChatCheckout Demo",
      },
    });
  }, [theme]);

  const loadProducts = useCallback(async () => {
    if (productConfig) {
      // Se é uma landing page específica, não carregar lista
      return;
    }

    try {
      // ✅ USAR API SERVICE - Buscar produtos do vendedor
      const result = await apiService.getProducts(vendorId);

      if (result.success) {
        setProducts(result.products || []);
      } else {
        console.error("Erro ao carregar produtos:", result.error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setProducts([]);
    }
  }, [vendorId, productConfig]);

  const checkConnection = useCallback(async () => {
    // ✅ Sempre conectado com API local
    setIsConnected(true);
  }, []);

  // ✅ useEffect 1: Setup geral do chat (SEM mensagem inicial)
  useEffect(() => {
    checkConnection();
    loadVendorConfig();

    if (!productConfig) {
      loadProducts();
    }

    if (productConfig) {
      console.log(
        "🎯 Chat configurado para produto:",
        productConfig.product.name,
      );
    }
  }, [checkConnection, loadVendorConfig, loadProducts, productConfig]);

  // ✅ useEffect 2: Mensagem inicial APENAS (executar UMA vez GARANTIDO)
  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ Dupla proteção: messages.length E welcomeMessageAdded.current
      if (messages.length === 0 && !welcomeMessageAdded.current) {
        const welcomeMessage =
          initialMessage || "Olá! 👋 Bem-vindo! Como posso te ajudar hoje?";
        addBotMessage(welcomeMessage);
        welcomeMessageAdded.current = true; // ✅ Marcar como adicionada
      }
    }, 500);

    // ✅ Cleanup do timer
    return () => clearTimeout(timer);
  }, [initialMessage, messages.length]); // ✅ Dependências necessárias

  const addBotMessage = (text, metadata = {}) => {
    const botMessage = {
      id: Date.now() + Math.random(),
      text,
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
      ...metadata,
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const addUserMessage = (text) => {
    const userMessage = {
      id: Date.now() + Math.random(),
      text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    return userMessage;
  };

  const addCheckoutMessage = (product) => {
    const checkoutMessage = {
      id: Date.now() + Math.random(),
      text: `Perfeito! Vamos finalizar sua compra do ${product.name}. Preencha os dados abaixo:`,
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
      type: "checkout",
      product: product,
    };
    setMessages((prev) => [...prev, checkoutMessage]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    addUserMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      // ✅ USAR API SERVICE - Enviar mensagem para IA
      const response = await apiService.sendChatMessage(
        userMessage,
        messages.slice(-10),
        vendorId,
        productConfig,
      );

      if (response.success) {
        addBotMessage(response.message, {
          model: response.model || "local-ai",
          fallback: response.fallback || false,
        });

        // Rastrear interação se em uma landing page de produto
        if (productConfig && productConfig.linkId) {
          await apiService.updateLinkStats(productConfig.linkId, "interaction");
        }

        // Detectar intenção de compra para trigger do checkout
        if (onConversion && productConfig) {
          const messageText = response.message.toLowerCase();
          const conversionKeywords = [
            "comprar",
            "pagar",
            "pagamento",
            "checkout",
            "finalizar",
            "adquirir",
          ];

          if (
            conversionKeywords.some((keyword) => messageText.includes(keyword))
          ) {
            console.log("🎯 Possível conversão detectada");
            onConversion({
              productId: productConfig.productId,
              linkId: productConfig.linkId,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } else {
        addBotMessage(
          response.message || "Ops! Algo deu errado. Pode tentar novamente? 🔄",
          { error: true },
        );
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      addBotMessage("Ops! Algo deu errado. Pode tentar novamente? 🔄", {
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 1) INICIAR FLUXO CRIPTO
  const startCryptoCheckout = async () => {
    try {
      let wallet = stellarPassKey.getWalletInfo();
      console.log("Info da carteira:", wallet);

      setCheckoutStep("detect");

      // if (!wallet) {
      //   wallet = await stellarPassKey.connectWallet();
      //   addBotMessage(
      //     "⚠️ Nenhuma carteira Stellar detectada. Por favor, instale uma extensão Freighter, Albedo ou conect com Passkey e tente novamente.",
      //     { error: true },
      //   );
      //   setCheckoutStep(null);
      //   return;
      // }

      addBotMessage("🔗 Conectando com sua carteira Stellar...");
      // addBotMessage(`👤 Conta: ${wallet.publicKey}`);

      // getAccountAssets(wallet.publicKey);

      // // TODO: Integrar com Freighter/Albedo
      // // Por enquanto, simular conexão
      // // await new Promise((resolve) => setTimeout(resolve, 1500));

      // if (!walletConnected) {
      //   setWalletConnected(true);
      //   addBotMessage("✅ Carteira conectada! Analisando seus tokens...");
      // }

      addBotMessage("⏳ Detectando tokens na sua carteira...");

      // const wallet_asset = await getAccountAssets(wallet.publicKey);
      addBotMessage(`Detectando tokens... ${wallet_asset.length} encontrados.`);

      // TODO: Detectar tokens reais da carteira
      setDetectedTokens([
        { code: "AQUA", balance: "5000" },
        { code: "XLM", balance: "50" },
        { code: "USDC", balance: "120" },
      ]);

      setCheckoutStep("quote");

      // TODO: Cotação real via Reflector Oracle
      const brl = productConfig?.product?.price || 297;
      const tokenOut = productConfig?.tokenOut || "USDC";
      const rate = await apiService.getExchangeRate("BRL", tokenOut);
      const tokenOutAmount = (brl * (rate.rate || 0.19)).toFixed(2);

      setReflectorQuote({ brl, tokenOut, rate: rate.rate, tokenOutAmount });

      // TODO: Preview real via Soroswap
      const preferred = "AQUA";
      setSelectedTokenIn(preferred);
      const swapResult = await apiService.simulateSwap(
        preferred,
        tokenOut,
        2480.12,
      );
      setSoroswapPreview({
        tokenIn: preferred,
        neededAmount: swapResult.inputAmount?.toFixed(2) || "2480.12",
        slippage: "0.4%",
      });

      // Mensagem no chat com o resumo
      addBotMessage(
        `💎 Para quitar R$ ${brl} (~${tokenOutAmount} ${tokenOut}), você pode pagar com ${preferred}: ~${swapResult.inputAmount?.toFixed(2) || "2480.12"} ${preferred} (slippage ≤ 0.4%). 
        
Clique em "Assinar e Pagar" para finalizar via blockchain.`,
        { checkoutCrypto: true },
      );
      setCheckoutStep("confirm");
    } catch (e) {
      console.error("Erro no crypto checkout:", e);
      addBotMessage(
        "❌ Falha ao preparar o checkout cripto. Tente novamente.",
        { error: true },
      );
      setCheckoutStep(null);
    }
  };

  // ✅ 2) CONFIRMAR E ENVIAR PARA O CONTRATO
  const confirmCryptoCheckout = async () => {
    try {
      setCheckoutStep("submitted");
      addBotMessage("⏳ Processando transação na blockchain Stellar...");

      // ✅ USAR API SERVICE - Processar pagamento cripto
      const paymentResult = await apiService.processPayment({
        amount: soroswapPreview?.neededAmount || 2480.12,
        token: selectedTokenIn,
        tokenOut: reflectorQuote?.tokenOut || "USDC",
        amountBRL: reflectorQuote?.brl || 297,
        productId: productConfig?.productId,
        vendorId: vendorId,
        sessionId: "chat_" + Date.now(),
      });

      if (paymentResult.success) {
        addBotMessage(
          "✅ Pagamento confirmado on-chain! Obrigado pela compra.",
          {
            payment: true,
            success: true,
          },
        );
        setCheckoutStep("done");

        // Acionar analytics existentes
        if (onConversion && productConfig) {
          onConversion({
            productId: productConfig.productId,
            linkId: productConfig.linkId,
            amount: productConfig?.product?.price,
            timestamp: new Date().toISOString(),
            type: "purchase_completed",
          });
        }
      } else {
        throw new Error(paymentResult.error);
      }
    } catch (e) {
      console.error("Erro no pagamento cripto:", e);
      addBotMessage("❌ Erro ao processar sua transação. Tente novamente.", {
        error: true,
      });
      setCheckoutStep("confirm");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startInlineCheckout = (product) => {
    addCheckoutMessage(product);
  };

  const handleInlinePaymentSuccess = (paymentData) => {
    addBotMessage(
      `🎉 PAGAMENTO APROVADO! \n\n` +
      `💰 Produto: ${paymentData.product?.name}\n` +
      `💳 Valor: R$ ${paymentData.amount?.toFixed(2)}\n` +
      `🆔 ID: ${paymentData.transactionId}\n\n` +
      `✅ Obrigado pela compra! Seu produto será processado em breve.`,
      { payment: true, success: true },
    );

    if (onConversion && productConfig) {
      onConversion({
        productId: productConfig.productId,
        linkId: productConfig.linkId,
        amount: paymentData.amount,
        timestamp: new Date().toISOString(),
        type: "purchase_completed",
      });
    }
  };

  const handleInlinePaymentCancel = () => {
    addBotMessage("Sem problemas! Se tiver dúvidas, estou aqui para ajudar.", {
      checkout: false,
    });
  };

  const quickSuggestions = [
    "Quero conhecer os produtos",
    "Como funciona?",
    "Quais as formas de pagamento?",
    "Preciso de ajuda",
  ];

  const sendQuickMessage = (suggestion) => {
    if (!isLoading) {
      setInputValue(suggestion);
      setTimeout(() => {
        if (!isLoading) {
          sendMessage();
        }
      }, 100);
    }
  };

  const companyName =
    productConfig?.vendor?.company ||
    productConfig?.vendor?.name ||
    vendorConfig?.branding?.companyName ||
    "ChatCheckout";

  const displayProducts = productConfig ? [productConfig.product] : products;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <img
            src="/chatcheckout-logo.png"
            alt="ChatCheckout"
            className="chatcheckout-logo"
            style={{ height: "40px", width: "auto", marginRight: "1rem" }}
          />
          <div className="company-info">
            <h1
              style={{
                margin: 0,
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#fdfdfd",
              }}
            >
              {companyName}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                opacity: 0.9,
                color: "#fdfdfd",
              }}
            >
              {productConfig
                ? `Produto: ${productConfig.product.name}`
                : "Powered by ChatCheckout"}
            </p>
          </div>
        </div>
        <div className="online-indicator">
          <div
            className={`status-dot ${isConnected ? "connected" : "disconnected"}`}
          ></div>
          <span>{isConnected ? "Online" : "Conectando..."}</span>
          {isConnected && (
            <Bot size={16} style={{ marginLeft: "5px", opacity: 0.8 }} />
          )}
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
          >
            <div className="message-avatar">
              {message.sender === "user" ? (
                <User size={20} />
              ) : (
                <Bot size={20} />
              )}
            </div>
            <div className="message-content">
              {message.type === "checkout" ? (
                <div>
                  <p>{message.text}</p>
                  <InlineCheckout
                    product={message.product}
                    onSuccess={handleInlinePaymentSuccess}
                    onCancel={handleInlinePaymentCancel}
                    onCryptoCheckout={startCryptoCheckout} // ✅ PASSAR FUNÇÃO CRIPTO
                  />
                </div>
              ) : message.checkoutCrypto ? ( // ✅ RENDERIZAÇÃO CONDICIONAL PARA O CHECKOUT CRIPTO
                <div>
                  <p>{message.text}</p>
                  <button
                    onClick={confirmCryptoCheckout}
                    disabled={
                      checkoutStep === "submitted" || checkoutStep === "done"
                    }
                    style={{
                      padding: "10px 15px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#6366f1",
                      color: "white",
                      cursor: "pointer",
                      marginTop: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {checkoutStep === "submitted"
                      ? "Processando..."
                      : "⭐ Assinar e Pagar"}
                  </button>
                </div>
              ) : (
                <p style={{ whiteSpace: "pre-wrap" }}>{message.text}</p>
              )}

              <div className="message-metadata">
                <span className="timestamp">{message.timestamp}</span>
                {message.success && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 6px",
                      borderRadius: "8px",
                      background: "rgba(34, 197, 94, 0.1)",
                      color: "#22c55e",
                    }}
                  >
                    ✅ Pago
                  </span>
                )}
                {message.error && <span className="error-badge">⚠️</span>}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot-message">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="loading-text">Digitando...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {displayProducts.length > 0 && (
        <div className="quick-suggestions">
          <p>
            💎 {productConfig ? "Opções de pagamento:" : "Nossos produtos:"}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {displayProducts.map((product, index) => (
              <div
                key={index}
                style={{
                  padding: "1rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "12px",
                  background: "#fdfdfd",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <h4 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>
                  {product.name}
                </h4>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    margin: "0 0 0.75rem 0",
                    lineHeight: "1.4",
                  }}
                >
                  {product.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "#24bb8d",
                    }}
                  >
                    R$ {product.price}
                  </span>
                </div>
                {/* ✅ BOTÕES DE CHECKOUT */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => startInlineCheckout(product)}
                    className="checkout-button primary"
                  >
                    <CreditCard size={14} /> Pagar com Cartão/PIX
                  </button>
                  <button
                    onClick={() => startCryptoCheckout()}
                    className="checkout-button secondary"
                  >
                    <MessageCircle size={14} /> Pagar com Cripto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length <= 2 && !isLoading && (
        <div className="quick-suggestions">
          <p>💡 Como posso ajudar:</p>
          <div className="suggestions-grid">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendQuickMessage(suggestion)}
                className="suggestion-button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConnected ? "Digite sua mensagem..." : "Conectando..."
            }
            disabled={isLoading || !isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim() || !isConnected}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientChat;
