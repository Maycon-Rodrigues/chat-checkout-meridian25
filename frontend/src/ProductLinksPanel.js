import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Link as LinkIcon,
  Plus,
  Copy,
  QrCode,
  BarChart3,
  Eye,
  ShoppingBag,
  TrendingUp,
  Settings,
  Share2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';

function ProductLinksPanel({ vendor, onBack }) {
  const [links, setLinks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    customMessage: ''
  });

  useEffect(() => {
    loadLinksData();
  }, [vendor]);

  const loadLinksData = async () => {
    try {
      console.log('🔗 Carregando links do vendedor:', vendor.id);
      
      // Carregar links
      const linksResponse = await axios.get(`http://localhost:5000/api/links/vendor/${vendor.id}`);
      if (linksResponse.data.success) {
        setLinks(linksResponse.data.links);
      }
      
      // Carregar analytics
      const analyticsResponse = await axios.get(`http://localhost:5000/api/links/analytics/${vendor.id}`);
      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.analytics);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados de links:', error);
      // Dados simulados em caso de erro
      setLinks(generateMockLinks());
      setAnalytics(generateMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const generateMockLinks = () => [
    {
      linkId: 'abc12345',
      product: {
        name: 'Curso Web3 Básico',
        price: 297,
        description: 'Aprenda blockchain do zero'
      },
      url: 'http://localhost:3000/l/abc12345',
      analytics: {
        totalClicks: 156,
        conversions: 12,
        revenue: 3564,
        conversionRate: 7.7
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      linkId: 'def67890',
      product: {
        name: 'Consultoria Tech',
        price: 150,
        description: 'Consultoria personalizada 1h'
      },
      url: 'http://localhost:3000/l/def67890',
      analytics: {
        totalClicks: 89,
        conversions: 8,
        revenue: 1200,
        conversionRate: 9.0
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ];

  const generateMockAnalytics = () => ({
    summary: {
      totalLinks: 2,
      activeLinks: 2,
      totalClicks: 245,
      totalConversions: 20,
      totalRevenue: 4764,
      averageConversionRate: 8.2
    },
    dailyData: [
      { date: '2025-01-15', clicks: 23, conversions: 2, revenue: 447 },
      { date: '2025-01-16', clicks: 31, conversions: 3, revenue: 891 },
      { date: '2025-01-17', clicks: 28, conversions: 1, revenue: 150 },
      { date: '2025-01-18', clicks: 45, conversions: 4, revenue: 1188 },
      { date: '2025-01-19', clicks: 52, conversions: 5, revenue: 1485 },
      { date: '2025-01-20', clicks: 41, conversions: 3, revenue: 447 },
      { date: '2025-01-21', clicks: 25, conversions: 2, revenue: 297 }
    ]
  });

  const handleCreateLink = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Nome e preço são obrigatórios');
      return;
    }

    setCreating(true);
    
    try {
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        vendorName: vendor.name,
        company: vendor.company
      };

      const settings = {
        customMessage: newProduct.customMessage || `Olá! Interessado no ${newProduct.name}?`
      };

      console.log('🔗 Criando link para produto:', productData);

      const response = await axios.post('http://localhost:5000/api/links/generate', {
        vendorId: vendor.id,
        productData: productData,
        settings: settings
      });

      if (response.data.success) {
        console.log('✅ Link criado com sucesso:', response.data.link.linkId);
        
        // Recarregar lista
        await loadLinksData();
        
        // Limpar formulário
        setNewProduct({ name: '', price: '', description: '', customMessage: '' });
        setShowCreateForm(false);
        
        alert(`✅ Link criado com sucesso!\nID: ${response.data.link.linkId}\nURL: ${response.data.url}`);
      } else {
        alert('❌ Erro ao criar link: ' + response.data.error);
      }

    } catch (error) {
      console.error('❌ Erro ao criar link:', error);
      alert('❌ Erro ao criar link. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Link copiado para área de transferência!');
  };

  const openLink = (url) => {
    window.open(url, '_blank');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <h2>Carregando links...</h2>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <button onClick={onBack} style={backButtonStyle}>
            ← Voltar
          </button>
          <div>
            <h1 style={titleStyle}>🔗 Links de Produtos</h1>
            <p style={subtitleStyle}>{vendor.name} • Compartilhe e venda</p>
          </div>
        </div>
        <div style={headerActionsStyle}>
          <button onClick={loadLinksData} style={refreshButtonStyle}>
            <RefreshCcw size={16} />
            Atualizar
          </button>
          <button 
            onClick={() => setShowCreateForm(true)}
            style={createButtonStyle}
          >
            <Plus size={16} />
            Criar Link
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div style={analyticsGridStyle}>
          <div style={analyticCardStyle}>
            <div style={analyticHeaderStyle}>
              <LinkIcon size={24} style={{ color: '#6366f1' }} />
              <span>Total Links</span>
            </div>
            <div style={analyticValueStyle}>{analytics.summary.totalLinks}</div>
            <div style={analyticSubtextStyle}>{analytics.summary.activeLinks} ativos</div>
          </div>

          <div style={analyticCardStyle}>
            <div style={analyticHeaderStyle}>
              <Eye size={24} style={{ color: '#10b981' }} />
              <span>Total Cliques</span>
            </div>
            <div style={analyticValueStyle}>{analytics.summary.totalClicks}</div>
            <div style={analyticSubtextStyle}>Últimos 30 dias</div>
          </div>

          <div style={analyticCardStyle}>
            <div style={analyticHeaderStyle}>
              <ShoppingBag size={24} style={{ color: '#f59e0b' }} />
              <span>Conversões</span>
            </div>
            <div style={analyticValueStyle}>{analytics.summary.totalConversions}</div>
            <div style={analyticSubtextStyle}>{analytics.summary.averageConversionRate}% taxa</div>
          </div>

          <div style={analyticCardStyle}>
            <div style={analyticHeaderStyle}>
              <TrendingUp size={24} style={{ color: '#8b5cf6' }} />
              <span>Receita</span>
            </div>
            <div style={analyticValueStyle}>{formatCurrency(analytics.summary.totalRevenue)}</div>
            <div style={analyticSubtextStyle}>Pelos links</div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Criar Link de Produto</h3>
            
            <div style={formStyle}>
              <div style={inputGroupStyle}>
                <ShoppingBag size={20} style={inputIconStyle} />
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <span style={inputIconStyle}>R$</span>
                <input
                  type="number"
                  placeholder="Preço"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <textarea
                  placeholder="Descrição do produto (opcional)"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  style={textareaStyle}
                  rows={3}
                />
              </div>

              <div style={inputGroupStyle}>
                <textarea
                  placeholder="Mensagem personalizada (opcional)"
                  value={newProduct.customMessage}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, customMessage: e.target.value }))}
                  style={textareaStyle}
                  rows={2}
                />
              </div>
            </div>

            <div style={modalActionsStyle}>
              <button 
                onClick={() => setShowCreateForm(false)}
                style={cancelButtonStyle}
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateLink}
                disabled={creating}
                style={submitButtonStyle}
              >
                {creating ? 'Criando...' : '🔗 Criar Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Links List */}
      <div style={linksContainerStyle}>
        <h3 style={sectionTitleStyle}>📋 Seus Links de Produtos</h3>
        
        {links.length === 0 ? (
          <div style={emptyStateStyle}>
            <LinkIcon size={48} style={{ color: '#9ca3af' }} />
            <h3>Nenhum link criado ainda</h3>
            <p>Crie seu primeiro link de produto para começar a vender!</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              style={createButtonStyle}
            >
              <Plus size={16} />
              Criar Primeiro Link
            </button>
          </div>
        ) : (
          <div style={linksGridStyle}>
            {links.map((link) => (
              <div key={link.linkId} style={linkCardStyle}>
                <div style={linkHeaderStyle}>
                  <div>
                    <h4 style={linkProductNameStyle}>{link.product.name}</h4>
                    <p style={linkProductPriceStyle}>{formatCurrency(link.product.price)}</p>
                  </div>
                  <div style={linkStatusStyle}>
                    {link.status === 'active' ? (
                      <CheckCircle size={20} style={{ color: '#10b981' }} />
                    ) : (
                      <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                    )}
                  </div>
                </div>

                <div style={linkDescriptionStyle}>
                  {link.product.description}
                </div>

                <div style={linkStatsStyle}>
                  <div style={linkStatStyle}>
                    <Eye size={16} />
                    <span>{link.analytics.totalClicks} cliques</span>
                  </div>
                  <div style={linkStatStyle}>
                    <ShoppingBag size={16} />
                    <span>{link.analytics.conversions} vendas</span>
                  </div>
                  <div style={linkStatStyle}>
                    <TrendingUp size={16} />
                    <span>{link.analytics.conversionRate}%</span>
                  </div>
                </div>

                <div style={linkUrlStyle}>
                  <code style={linkCodeStyle}>/l/{link.linkId}</code>
                </div>

                <div style={linkActionsStyle}>
                  <button 
                    onClick={() => copyToClipboard(link.url)}
                    style={actionButtonStyle}
                    title="Copiar link"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={() => openLink(link.url)}
                    style={actionButtonStyle}
                    title="Abrir link"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button 
                    style={actionButtonStyle}
                    title="QR Code"
                  >
                    <QrCode size={16} />
                  </button>
                  <button 
                    style={actionButtonStyle}
                    title="Analytics"
                  >
                    <BarChart3 size={16} />
                  </button>
                </div>

                <div style={linkMetaStyle}>
                  Criado em {formatDate(link.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ESTILOS
// ESTILOS COMPLETOS
const containerStyle = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
  background: '#f8fafc',
  minHeight: '100vh'
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: '#f8fafc'
};

const loadingSpinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #e2e8f0',
  borderTop: '4px solid #6366f1',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '1rem'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  padding: '2rem',
  borderRadius: '16px',
  color: '#ffffff'
};

const headerContentStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '2rem'
};

const backButtonStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem'
};

const titleStyle = {
  margin: 0,
  fontSize: '2rem',
  fontWeight: 'bold'
};

const subtitleStyle = {
  margin: '0.5rem 0 0 0',
  opacity: 0.9
};

const headerActionsStyle = {
  display: 'flex',
  gap: '0.5rem'
};

const refreshButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'rgba(255, 255, 255, 0.2)',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  cursor: 'pointer'
};

const createButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: '#10b981',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600'
};

const analyticsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const analyticCardStyle = {
  background: '#ffffff',
  padding: '1.5rem',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
};

const analyticHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1rem',
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#6b7280'
};

const analyticValueStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '0.5rem'
};

const analyticSubtextStyle = {
  fontSize: '0.8rem',
  color: '#6b7280'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '2rem',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto'
};

const modalTitleStyle = {
  margin: '0 0 1.5rem 0',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#1f2937'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '1.5rem'
};

const inputGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  background: '#f9fafb'
};

const inputIconStyle = {
  color: '#6b7280'
};

const inputStyle = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  outline: 'none',
  fontSize: '1rem'
};

const textareaStyle = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  outline: 'none',
  fontSize: '1rem',
  resize: 'vertical',
  minHeight: '60px'
};

const modalActionsStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end'
};

const cancelButtonStyle = {
  background: '#e5e7eb',
  color: '#374151',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer'
};

const submitButtonStyle = {
  background: '#6366f1',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600'
};

const linksContainerStyle = {
  background: '#ffffff',
  padding: '1.5rem',
  borderRadius: '12px',
  border: '1px solid #e2e8f0'
};

const sectionTitleStyle = {
  margin: '0 0 1.5rem 0',
  fontSize: '1.2rem',
  fontWeight: '600',
  color: '#1f2937'
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem 2rem',
  textAlign: 'center',
  color: '#6b7280'
};

const linksGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '1.5rem'
};

const linkCardStyle = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '1.5rem',
  transition: 'all 0.2s ease'
};

const linkHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1rem'
};

const linkProductNameStyle = {
  margin: '0 0 0.25rem 0',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#1f2937'
};

const linkProductPriceStyle = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: '#10b981'
};

const linkStatusStyle = {
  display: 'flex',
  alignItems: 'center'
};

const linkDescriptionStyle = {
  fontSize: '0.9rem',
  color: '#6b7280',
  marginBottom: '1rem',
  lineHeight: '1.4'
};

const linkStatsStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1rem'
};

const linkStatStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.8rem',
  color: '#6b7280'
};

const linkUrlStyle = {
  marginBottom: '1rem'
};

const linkCodeStyle = {
  background: '#e5e7eb',
  color: '#374151',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.8rem',
  fontFamily: 'monospace'
};

const linkActionsStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '1rem'
};

const actionButtonStyle = {
  background: '#e5e7eb',
  color: '#374151',
  border: 'none',
  padding: '0.5rem',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease'
};

const linkMetaStyle = {
  fontSize: '0.7rem',
  color: '#9ca3af',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '0.75rem'
};

export default ProductLinksPanel;