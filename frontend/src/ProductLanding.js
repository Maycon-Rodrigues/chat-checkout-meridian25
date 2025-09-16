import React, { useState, useEffect } from 'react';
import ClientChat from './ClientChat';
import apiService from './services/api';

function ProductLanding({ linkId }) {
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🎯 ProductLanding carregado para link:', linkId);
    loadLinkData();
  }, [linkId]);

  const loadLinkData = async () => {
    try {
      console.log('🔗 Buscando dados reais do link:', linkId);
      
      // ✅ USAR API SERVICE para buscar dados reais
      const result = await apiService.getProductLink(linkId);
      
      if (result.success) {
        setLinkData(result.link);
        console.log('✅ Dados reais carregados:', result.link.product.name);
        
        // Rastrear primeira interação
        await apiService.updateLinkStats(linkId, 'interaction');
      } else {
        console.log('ℹ️ Link não encontrado, usando fallback');
        // Fallback mockado
        const mockData = generateMockLinkData(linkId);
        setLinkData(mockData);
      }
      
    } catch (err) {
      console.log('⚠ Erro:', err.message);
      // Em caso de erro, usar dados mockados para demo
      console.log('🎭 Usando dados simulados para demo');
      const mockData = generateMockLinkData(linkId);
      setLinkData(mockData);
    } finally {
      // ✅ SEMPRE PARA O LOADING, INDEPENDENTE DO RESULTADO
      setLoading(false);
    }
  };

  const generateMockLinkData = (linkId) => {
    // Simular dados do produto para demonstração
    const mockData = {
      linkId: linkId,
      product: {
        name: 'Produto Demo',
        price: 297,
        description: 'Este é um produto de demonstração. Em produção, aqui apareceriam os dados reais do produto criado.',
        aiPrompt: `Você é um assistente de vendas especializado vendendo este produto por R$ 297.

INSTRUÇÕES:
- Seja prestativo e demonstre conhecimento sobre o produto
- Destaque os benefícios e valor entregue
- Conduza naturalmente para a compra
- Use linguagem brasileira e acessível
- Responda dúvidas com confiança

OBJETIVO: Converter o visitante interessado em cliente.`
      },
      vendor: {
        name: 'Vendedor Demo',
        company: 'Empresa Demo'
      },
      settings: {
        customMessage: `Olá! Interessado no nosso produto? Estou aqui para tirar suas dúvidas! 🚀`,
        showProductInfo: true,
        collectEmail: true
      }
    };

    return mockData;
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle}></div>
        <h2>Carregando produto...</h2>
        <p>Preparando chat personalizado</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStyle}>
        <h2>⚠ Link não encontrado</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={buttonStyle}
        >
          Ir para Home
        </button>
      </div>
    );
  }

  // Configuração específica para o chat do produto
  const chatConfig = {
    vendorId: 'demo-empresa',
    productId: linkData.linkId,
    product: linkData.product,
    vendor: linkData.vendor,
    settings: linkData.settings,
    linkId: linkId,
    systemPrompt: linkData.product.aiPrompt,
    initialMessage: linkData.settings.customMessage,
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#10b981',
      companyName: linkData.vendor.company
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header do produto */}
      {linkData.settings.showProductInfo && (
        <div style={productHeaderStyle}>
          <div style={productInfoStyle}>
            <h1 style={productTitleStyle}>{linkData.product.name}</h1>
            <p style={productPriceStyle}>
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(linkData.product.price)}
            </p>
            <p style={productDescStyle}>{linkData.product.description}</p>
          </div>
          <div style={vendorInfoStyle}>
            <strong>{linkData.vendor.company}</strong>
          </div>
        </div>
      )}

      {/* Chat específico do produto */}
      <ClientChat 
        vendorId={chatConfig.vendorId}
        productConfig={chatConfig}
        customSystemPrompt={chatConfig.systemPrompt}
        initialMessage={chatConfig.initialMessage}
        theme={chatConfig.theme}
        onConversion={async (data) => {
          console.log('🎯 Conversão detectada:', data);
          // Rastrear conversão
          if (linkId) {
            await apiService.updateLinkStats(linkId, 'conversion');
          }
        }}
      />
    </div>
  );
}

// ESTILOS
const containerStyle = {
  minHeight: '100vh',
  background: '#f8fafc'
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: '#f8fafc'
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #e2e8f0',
  borderTop: '4px solid #6366f1',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '1rem'
};

const errorStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: '#f8fafc',
  textAlign: 'center',
  padding: '2rem'
};

const buttonStyle = {
  background: '#6366f1',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  marginTop: '1rem'
};

const productHeaderStyle = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  color: '#ffffff',
  padding: '2rem',
  textAlign: 'center'
};

const productInfoStyle = {
  marginBottom: '1rem'
};

const productTitleStyle = {
  margin: '0 0 0.5rem 0',
  fontSize: '2rem',
  fontWeight: 'bold'
};

const productPriceStyle = {
  margin: '0 0 1rem 0',
  fontSize: '1.5rem',
  fontWeight: '600',
  opacity: 0.9
};

const productDescStyle = {
  margin: 0,
  fontSize: '1.1rem',
  opacity: 0.8,
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto'
};

const vendorInfoStyle = {
  fontSize: '1rem',
  opacity: 0.9
};

export default ProductLanding;