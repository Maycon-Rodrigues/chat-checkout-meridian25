import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Star,
  Eye,
  RefreshCcw,
  Copy,
  ExternalLink,
  CreditCard,
  Zap,
  Key,
} from "lucide-react";
import stellarPassKey from "./StellarPassKey"; // ✅ IMPORT PASSKEY

// ===============================================================================
// 🎭 MOCK DATA - Dados financeiros realistas para demonstração
// ===============================================================================

const mockFinancialData = {
  success: true,
  balances: {
    available: 3247.89,
    pending: 567.45,
    totalEarned: 15670.34,
  },
  stellarWallet: {
    usdcBalance: 1204.56,
    xlmBalance: 289.78,
    publicKey: "GABC1234567890DEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    lastSync: new Date().toISOString(),
  },
  monthlyStats: {
    thisMonth: {
      revenue: 4890.67,
      transactions: 23,
      avgTicket: 212.64,
      growth: 15.7,
    },
    lastMonth: {
      revenue: 4234.12,
      transactions: 19,
      avgTicket: 222.85,
    },
  },
  recentTransactions: [
    {
      id: "tx_001",
      type: "sale",
      amount: 297.0,
      net: 285.12,
      product: "Curso JavaScript Avançado",
      customer: "João Silva",
      date: "2025-01-15T14:30:00.000Z",
      status: "completed",
    },
    {
      id: "tx_002",
      type: "sale",
      amount: 150.0,
      net: 142.5,
      product: "E-book React Hooks",
      customer: "Maria Santos",
      date: "2025-01-14T09:15:00.000Z",
      status: "completed",
    },
    {
      id: "tx_003",
      type: "withdrawal",
      amount: -500.0,
      net: -500.0,
      product: "Saque PIX: 123.456.789-00",
      customer: "",
      date: "2025-01-13T16:45:00.000Z",
      status: "processing",
    },
    {
      id: "tx_004",
      type: "sale",
      amount: 89.9,
      net: 85.41,
      product: "Template Landing Page",
      customer: "Pedro Costa",
      date: "2025-01-12T11:20:00.000Z",
      status: "completed",
    },
    {
      id: "tx_005",
      type: "sale",
      amount: 199.0,
      net: 189.05,
      product: "Consultoria 1h",
      customer: "Ana Lima",
      date: "2025-01-11T15:00:00.000Z",
      status: "completed",
    },
    {
      id: "tx_006",
      type: "sale",
      amount: 47.0,
      net: 44.65,
      product: "Pack de Ícones Premium",
      customer: "Carlos Ferreira",
      date: "2025-01-10T08:30:00.000Z",
      status: "completed",
    },
    {
      id: "tx_007",
      type: "withdrawal",
      amount: -800.0,
      net: -800.0,
      product: "Saque PIX: carlos@email.com",
      customer: "",
      date: "2025-01-09T13:15:00.000Z",
      status: "completed",
    },
    {
      id: "tx_008",
      type: "sale",
      amount: 320.0,
      net: 304.0,
      product: "Mentoria em Grupo",
      customer: "Lucia Oliveira",
      date: "2025-01-08T17:45:00.000Z",
      status: "completed",
    },
  ],
};

// ===============================================================================
// 🎭 MOCK SERVICES - APIs simuladas para funcionalidade completa
// ===============================================================================

const mockApiService = {
  getFinancialData: async (vendorId) => {
    console.log("🎭 Mock: Carregando dados financeiros para", vendorId);
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return mockFinancialData;
  },

  saveStellarWallet: async (vendorId, publicKey) => {
    console.log("🎭 Mock: Salvando carteira Stellar", {
      vendorId,
      publicKey: publicKey.substring(0, 10) + "...",
    });
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
  },

  withdrawFunds: async (amount, pixKey) => {
    console.log("🎭 Mock: Processando saque", { amount, pixKey });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true };
  },
};

const mockStellarPassKey = {
  createWalletWithPassKey: async (userInfo) => {
    console.log("🎭 Mock: Criando carteira com PassKey para", userInfo.name);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return {
      success: true,
      stellarPublicKey: "GMOCKED123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ987654321",
    };
  },

  fundTestnetAccount: async () => {
    console.log("🎭 Mock: Financiando conta na testnet");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  },
};

// ===============================================================================
// 🎯 COMPONENTE PRINCIPAL
// ===============================================================================

function FinancialPanel({ vendor, onBack }) {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [stellarPubKey, setStellarPubKey] = useState(
    vendor?.stellar_public_key || vendor?.stellarPublicKey || "",
  );
  const [savingWallet, setSavingWallet] = useState(false);

  // Adicionar classe CSS para permitir scroll
  useEffect(() => {
    document.body.classList.add("dashboard-open");
    return () => {
      document.body.classList.remove("dashboard-open");
    };
  }, []);

  useEffect(() => {
    console.log("🔍 DEBUG: useEffect executado, vendor =", vendor);
    loadFinancialData();
  }, []); // Array vazio - executar só uma vez

  useEffect(() => {
    setStellarPubKey(
      vendor?.stellar_public_key || vendor?.stellarPublicKey || "",
    );
  }, [vendor]);

  const loadFinancialData = async () => {
    console.log("🔍 DEBUG: Iniciando loadFinancialData");
    console.log("🔍 DEBUG: vendor =", vendor);

    try {
      setLoading(true);
      setError("");

      // 🎭 MOCK: Carregar dados financeiros simulados
      const result = await mockApiService.getFinancialData(
        vendor?.id || "demo-vendor",
      );

      if (result.success) {
        setFinancialData(result);
        console.log("✅ DEBUG: Dados financeiros carregados:", result);
      } else {
        throw new Error(result.error || "Erro ao carregar dados financeiros");
      }
    } catch (err) {
      console.error("❌ Erro ao carregar dados financeiros:", err);
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
      console.log("✅ DEBUG: loadFinancialData COMPLETO!");
    }
  };

  const saveStellarWallet = async () => {
    if (!stellarPubKey?.trim()) {
      alert("Informe uma Stellar Public Key");
      return;
    }

    try {
      setSavingWallet(true);

      // 🎭 MOCK: Salvar carteira Stellar simulada
      const result = await mockApiService.saveStellarWallet(
        vendor.id,
        stellarPubKey,
      );

      if (result.success) {
        alert("✅ Carteira Stellar atualizada!");
      } else {
        throw new Error(result.error || "Falha ao salvar wallet");
      }
    } catch (err) {
      console.error("Erro ao salvar wallet:", err);
      alert("❌ Erro ao salvar wallet: " + err.message);
    } finally {
      setSavingWallet(false);
    }
  };

  const createWithPasskeyKit = async () => {
    try {
      console.log("🔐 Criando carteira com PassKey real...");

      const userInfo = {
        name: vendor?.name || vendor?.display_name || "Vendor",
        email: vendor?.email || "vendor@stellar.com",
      };

      // USAR PASSKEY REAL
      const result = await stellarPassKey.createWalletWithPassKey(userInfo);

      if (result.success) {
        console.log("✅ Carteira criada:", result.stellarPublicKey);

        // FINANCIAR NA TESTNET
        await stellarPassKey.fundTestnetAccount();

        // ATUALIZAR O CAMPO COM A PUBLIC KEY REAL
        setStellarPubKey(result.stellarPublicKey);

        alert(
          `✅ Carteira Stellar criada com sucesso!\n\nPublic Key: ${result.stellarPublicKey.substring(0, 20)}...\n\nCarteira protegida por biometria e financiada na testnet.`,
        );
      }
    } catch (error) {
      console.error("❌ Erro ao criar carteira:", error);
      alert("❌ Erro ao criar carteira: " + error.message);
    }
  };

  // const createWithPasskeyKit = async () => {
  //   try {
  //     console.log("🔐 Criando carteira com PassKey real...");
  //
  //     const userInfo = {
  //       name: vendor?.name || vendor?.display_name || "Vendor",
  //       email: vendor?.email || "vendor@stellar.com",
  //     };
  //
  //     // 🎭 MOCK: Simular criação de carteira com PassKey
  //     const result = await mockStellarPassKey.createWalletWithPassKey(userInfo);
  //
  //     if (result.success) {
  //       console.log("✅ Carteira criada (mock):", result.stellarPublicKey);
  //
  //       // 🎭 MOCK: Simular financiamento na testnet
  //       await mockStellarPassKey.fundTestnetAccount();
  //
  //       // ATUALIZAR O CAMPO COM A PUBLIC KEY REAL
  //       setStellarPubKey(result.stellarPublicKey);
  //
  //       alert(
  //         `✅ Carteira Stellar criada com sucesso!\n\nPublic Key: ${result.stellarPublicKey.substring(0, 20)}...\n\nCarteira protegida por biometria e financiada na testnet.`,
  //       );
  //     }
  //   } catch (error) {
  //     console.error("❌ Erro ao criar carteira:", error);
  //     alert("❌ Erro ao criar carteira: " + error.message);
  //   }
  // };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError("Digite um valor válido para saque");
      return;
    }
    if (!pixKey.trim()) {
      setError("Digite sua chave PIX");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > financialData?.balances?.available) {
      setError("Saldo insuficiente");
      return;
    }

    setWithdrawing(true);
    setError("");

    try {
      console.log("💸 Processando saque:", {
        amount,
        pixKey,
        vendor: vendor.id,
      });

      // 🎭 MOCK: Processar saque simulado
      const result = await mockApiService.withdrawFunds(amount, pixKey);

      if (result.success) {
        // Atualizar dados localmente (simulação)
        setFinancialData((prev) => ({
          ...prev,
          balances: {
            ...prev.balances,
            available: prev.balances.available - amount,
            pending: prev.balances.pending + amount,
          },
          recentTransactions: [
            {
              id: "tx_" + Date.now(),
              type: "withdrawal",
              amount: -amount,
              fee: 0.0,
              net: -amount,
              customer: "",
              product: `Saque PIX: ${pixKey}`,
              date: new Date().toISOString(),
              status: "processing",
            },
            ...prev.recentTransactions,
          ],
        }));

        setWithdrawAmount("");
        setPixKey("");
        alert(
          `✅ Saque de R$ ${amount.toFixed(2)} solicitado com sucesso!\nProcessamento: Instantâneo\nChave PIX: ${pixKey}`,
        );
      } else {
        throw new Error(result.error || "Erro no saque");
      }
    } catch (error) {
      console.error("❌ Erro no saque:", error);
      setError("Erro ao processar saque. Tente novamente.");
    } finally {
      setWithdrawing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copiado para área de transferência!");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatCrypto = (value, symbol) => {
    return `${value.toFixed(4)} ${symbol}`;
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <h2>Carregando dados financeiros...</h2>
        <p>Preparando informações da carteira</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={loadingContainerStyle}>
        <h2>❌ Erro</h2>
        <p>{error}</p>
        <button onClick={loadFinancialData} style={refreshButtonStyle}>
          <RefreshCcw size={16} />
          Tentar Novamente
        </button>
        <button onClick={onBack} style={backButtonStyle}>
          ← Voltar
        </button>
      </div>
    );
  }

  if (!financialData || !financialData.balances) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <h2>Carregando dados financeiros...</h2>
        <p>Preparando informações da carteira</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <button onClick={onBack} style={backButtonStyle}>
            ← Voltar
          </button>
          <div>
            <h1 style={titleStyle}>💰 Painel Financeiro</h1>
            <p style={subtitleStyle}>
              {vendor?.display_name ||
                vendor?.name ||
                financialData.vendor?.name}{" "}
              •{vendor?.company || financialData.vendor?.company}
            </p>
          </div>
        </div>
        <button onClick={loadFinancialData} style={refreshButtonStyle}>
          <RefreshCcw size={16} />
          Atualizar
        </button>
      </div>

      <div style={stellarWalletSectionStyle}>
        <h3 style={sectionTitleStyle}>
          ⭐ Carteira Stellar para recebimento (tokenOut)
        </h3>
        <p style={sectionDescriptionStyle}>
          Informe sua <strong>Stellar Public Key</strong> (ou crie uma com
          Passkey Kit). Esta carteira receberá os pagamentos já convertidos.
        </p>
        <div style={stellarInputContainerStyle}>
          <input
            style={stellarInputStyle}
            placeholder="G... (Stellar Public Key)"
            value={stellarPubKey}
            onChange={(e) => setStellarPubKey(e.target.value)}
          />
          <button
            onClick={saveStellarWallet}
            disabled={savingWallet}
            style={saveButtonStyle}
          >
            {savingWallet ? "Salvando..." : "Salvar"}
          </button>
          <button onClick={createWithPasskeyKit} style={passkeyButtonStyle}>
            <Key size={16} /> Criar via Passkey
          </button>
        </div>
      </div>

      <div style={balancesGridStyle}>
        <div style={balanceCardStyle}>
          <div style={balanceHeaderStyle}>
            <Wallet size={24} style={{ color: "#10b981" }} />
            <span>Saldo Disponível</span>
          </div>
          <div style={balanceValueStyle}>
            {formatCurrency(financialData.balances.available)}
          </div>
          <div style={balanceSubtextStyle}>Pronto para saque</div>
        </div>

        <div style={balanceCardStyle}>
          <div style={balanceHeaderStyle}>
            <ArrowUpCircle size={24} style={{ color: "#f59e0b" }} />
            <span>Aguardando</span>
          </div>
          <div style={balanceValueStyle}>
            {formatCurrency(financialData.balances.pending)}
          </div>
          <div style={balanceSubtextStyle}>Processando</div>
        </div>

        <div style={balanceCardStyle}>
          <div style={balanceHeaderStyle}>
            <TrendingUp size={24} style={{ color: "#6366f1" }} />
            <span>Total Ganho</span>
          </div>
          <div style={balanceValueStyle}>
            {formatCurrency(financialData.balances.totalEarned)}
          </div>
          <div style={balanceSubtextStyle}>Histórico completo</div>
        </div>

        <div style={balanceCardStyle}>
          <div style={balanceHeaderStyle}>
            <Star size={24} style={{ color: "#8b5cf6" }} />
            <span>Stellar Wallet</span>
          </div>
          <div style={balanceValueStyle}>
            {formatCrypto(financialData.stellarWallet.usdcBalance, "USDC")}
          </div>
          <div style={balanceSubtextStyle}>
            {formatCrypto(financialData.stellarWallet.xlmBalance, "XLM")}
          </div>
        </div>
      </div>

      <div style={statsContainerStyle}>
        <h3 style={sectionTitleStyle}>📊 Performance Mensal</h3>
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Este Mês</div>
            <div style={statValueStyle}>
              {formatCurrency(financialData.monthlyStats.thisMonth.revenue)}
            </div>
            <div style={statMetaStyle}>
              {financialData.monthlyStats.thisMonth.transactions} transações •
              Ticket médio:{" "}
              {formatCurrency(financialData.monthlyStats.thisMonth.avgTicket)}
            </div>
            <div
              style={statGrowthStyle(
                financialData.monthlyStats.thisMonth.growth,
              )}
            >
              <TrendingUp size={14} />+
              {financialData.monthlyStats.thisMonth.growth}% vs mês anterior
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Mês Anterior</div>
            <div style={statValueStyle}>
              {formatCurrency(financialData.monthlyStats.lastMonth.revenue)}
            </div>
            <div style={statMetaStyle}>
              {financialData.monthlyStats.lastMonth.transactions} transações •
              Ticket médio:{" "}
              {formatCurrency(financialData.monthlyStats.lastMonth.avgTicket)}
            </div>
          </div>
        </div>
      </div>

      <div style={withdrawalContainerStyle}>
        <h3 style={sectionTitleStyle}>💸 Sacar Dinheiro</h3>
        <div style={withdrawalFormStyle}>
          <div style={withdrawalInputsStyle}>
            <div style={inputGroupStyle}>
              <DollarSign size={20} style={inputIconStyle} />
              <input
                type="number"
                placeholder="Valor do saque"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={inputStyle}
                max={financialData.balances.available}
              />
            </div>

            <div style={inputGroupStyle}>
              <Zap size={20} style={inputIconStyle} />
              <input
                type="text"
                placeholder="Chave PIX (CPF, email, telefone)"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            style={withdrawButtonStyle}
          >
            {withdrawing ? "Processando..." : "💸 Sacar via PIX"}
          </button>

          <div style={withdrawalInfoStyle}>
            <p>• Taxa: R$ 0,00 (PIX gratuito)</p>
            <p>• Processamento: Instantâneo</p>
            <p>• Limite: R$ 10,00 a R$ 5.000,00</p>
          </div>
        </div>
      </div>

      <div style={transactionsContainerStyle}>
        <h3 style={sectionTitleStyle}>📋 Transações Recentes</h3>
        <div style={transactionsListStyle}>
          {financialData.recentTransactions.map((tx, index) => (
            <div key={tx.id} style={transactionItemStyle}>
              <div style={transactionIconStyle}>
                {tx.type === "sale" ? (
                  <ArrowUpCircle size={20} style={{ color: "#10b981" }} />
                ) : (
                  <ArrowDownCircle size={20} style={{ color: "#ef4444" }} />
                )}
              </div>

              <div style={transactionDetailsStyle}>
                <div style={transactionMainStyle}>
                  <span style={transactionProductStyle}>{tx.product}</span>
                  <span style={transactionAmountStyle(tx.type)}>
                    {tx.type === "sale" ? "+" : ""}
                    {formatCurrency(tx.net)}
                  </span>
                </div>
                <div style={transactionMetaStyle}>
                  {tx.customer && <span>{tx.customer} • </span>}
                  {new Date(tx.date).toLocaleDateString("pt-BR")} •
                  <span style={transactionStatusStyle(tx.status)}>
                    {" "}
                    {tx.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={stellarInfoStyle}>
        <h3 style={sectionTitleStyle}>⭐ Informações da Wallet Stellar</h3>
        <div style={stellarDetailsStyle}>
          <div style={stellarRowStyle}>
            <span>Public Key:</span>
            <div style={stellarKeyStyle}>
              <span>
                {(
                  stellarPubKey || financialData.stellarWallet.publicKey
                )?.substring(0, 20)}
                ...
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    stellarPubKey || financialData.stellarWallet.publicKey,
                  )
                }
                style={copyButtonStyle}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
          <div style={stellarRowStyle}>
            <span>Última sincronização:</span>
            <span>
              {new Date(financialData.stellarWallet.lastSync).toLocaleString(
                "pt-BR",
              )}
            </span>
          </div>
          <div style={stellarRowStyle}>
            <span>Taxa de rede:</span>
            <span>$0.000001 XLM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ESTILOS (mantendo os mesmos existentes)
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
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  padding: "2rem",
  borderRadius: "16px",
  color: "#ffffff",
  boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
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

const stellarWalletSectionStyle = {
  background: "#fff",
  marginBottom: "2rem",
  padding: "1.5rem",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const sectionDescriptionStyle = {
  color: "#6b7280",
  marginBottom: "1rem",
  fontSize: "0.9rem",
};

const stellarInputContainerStyle = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "center",
  flexWrap: "wrap",
};

const stellarInputStyle = {
  flex: 1,
  minWidth: "300px",
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "1rem",
};

const saveButtonStyle = {
  padding: "10px 16px",
  background: "#24bb8d",
  color: "#fff",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
  transition: "all 0.2s ease",
};

const passkeyButtonStyle = {
  padding: "10px 16px",
  background: "#f3f4f6",
  color: "#1f2937",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "all 0.2s ease",
};

const balancesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1.5rem",
  marginBottom: "2rem",
};

const balanceCardStyle = {
  background: "#ffffff",
  padding: "1.5rem",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s ease",
};

const balanceHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "1rem",
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#6b7280",
};

const balanceValueStyle = {
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#1f2937",
  marginBottom: "0.5rem",
};

const balanceSubtextStyle = {
  fontSize: "0.8rem",
  color: "#6b7280",
};

const statsContainerStyle = {
  background: "#ffffff",
  padding: "1.5rem",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginBottom: "2rem",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const sectionTitleStyle = {
  margin: "0 0 1rem 0",
  fontSize: "1.2rem",
  fontWeight: "600",
  color: "#1f2937",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "1.5rem",
};

const statCardStyle = {
  padding: "1rem",
  background: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const statLabelStyle = {
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#6b7280",
  marginBottom: "0.5rem",
};

const statValueStyle = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#1f2937",
  marginBottom: "0.5rem",
};

const statMetaStyle = {
  fontSize: "0.8rem",
  color: "#6b7280",
  marginBottom: "0.5rem",
};

const statGrowthStyle = (growth) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  fontSize: "0.8rem",
  fontWeight: "600",
  color: growth > 0 ? "#10b981" : "#ef4444",
});

const withdrawalContainerStyle = {
  background: "#ffffff",
  padding: "1.5rem",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginBottom: "2rem",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const withdrawalFormStyle = {
  maxWidth: "500px",
};

const withdrawalInputsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1rem",
};

const inputGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "1rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#f9fafb",
};

const inputIconStyle = {
  color: "#6b7280",
};

const inputStyle = {
  flex: 1,
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: "1rem",
};

const withdrawButtonStyle = {
  background: "#10b981",
  color: "#ffffff",
  border: "none",
  padding: "1rem 2rem",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  marginBottom: "1rem",
  transition: "all 0.2s ease",
};

const withdrawalInfoStyle = {
  fontSize: "0.8rem",
  color: "#6b7280",
};

const errorStyle = {
  background: "#fef2f2",
  color: "#dc2626",
  padding: "0.75rem",
  borderRadius: "8px",
  marginBottom: "1rem",
  border: "1px solid #fecaca",
};

const transactionsContainerStyle = {
  background: "#ffffff",
  padding: "1.5rem",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginBottom: "2rem",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const transactionsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const transactionItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem",
  background: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  transition: "transform 0.2s ease",
};

const transactionIconStyle = {
  flexShrink: 0,
};

const transactionDetailsStyle = {
  flex: 1,
};

const transactionMainStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.25rem",
};

const transactionProductStyle = {
  fontWeight: "600",
  color: "#1f2937",
};

const transactionAmountStyle = (type) => ({
  fontWeight: "bold",
  color: type === "sale" ? "#10b981" : "#ef4444",
});

const transactionMetaStyle = {
  fontSize: "0.8rem",
  color: "#6b7280",
};

const transactionStatusStyle = (status) => ({
  fontWeight: "600",
  color:
    status === "completed"
      ? "#10b981"
      : status === "processing"
        ? "#f59e0b"
        : "#ef4444",
});

const stellarInfoStyle = {
  background: "#ffffff",
  padding: "1.5rem",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const stellarDetailsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const stellarRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem",
  background: "#f8fafc",
  borderRadius: "6px",
};

const stellarKeyStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const copyButtonStyle = {
  background: "#e5e7eb",
  border: "none",
  padding: "0.25rem",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

export default FinancialPanel;
