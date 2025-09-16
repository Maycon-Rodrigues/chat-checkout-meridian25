import React, { useState, useEffect } from 'react';
import apiService from './services/api'; // ✅ IMPORTAR API SERVICE
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MessageCircle, 
  Star, 
  Activity, 
  Target, 
  RefreshCcw,
  Eye,
  ShoppingCart,
  LogOut
} from 'lucide-react';

function VendorDashboard({ vendor, onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Adicionar classe CSS para permitir scroll
  useEffect(() => {
    document.body.classList.add('dashboard-open');
    return () => {
      document.body.classList.remove('dashboard-open');
    };
  }, []);

  // Carregar dados do dashboard
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [vendor]);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Carregando dashboard analytics...');
      
      const vendorId = vendor?.id || 'demo-empresa';
      
      // ✅ USAR API SERVICE - Carregar analytics
      const result = await apiService.getDashboardAnalytics(vendorId);
      
      if (result.success) {
        setAnalytics(result.analytics);
        setLastUpdate(new Date());
        setError(null);
        console.log('✅ Analytics carregadas:', result.analytics);
      } else {
        throw new Error(result.error || 'Erro ao carregar dados');
      }
      
    } catch (err) {
      console.error('❌ Erro ao carregar analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  const goToFinancial = () => {
    window.location.hash = '#financial';
    window.location.reload();
  };

  const goToProducts = () => {
    window.location.hash = '#products';
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <h2>Carregando Dashboard...</h2>
        <p>Preparando seus analytics</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorContainerStyle}>
        <h2>❌ Erro ao Carregar Dashboard</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} style={retryButtonStyle}>
          <RefreshCcw size={16} />
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={dashboardContainerStyle} className="dashboard-container">
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={vendorInfoStyle}>
            <h1 style={titleStyle}>📊 Dashboard Analytics</h1>
            <p style={subtitleStyle}>
              {vendor?.display_name || vendor?.name || analytics?.vendor?.name || 'Vendedor Demo'}
            </p>
          </div>
        </div>
        <div style={headerActionsStyle}>
          <div style={lastUpdateStyle}>
            Última atualização: {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={goToFinancial}
              style={financialButtonStyle}
            >
              💰 Financeiro
            </button>
            
            <button 
              onClick={goToProducts}
              style={productsButtonStyle}
            >
              📦 Meus Produtos
            </button>
            
            <button onClick={loadDashboardData} style={refreshButtonStyle}>
              <RefreshCcw size={16} />
              Atualizar
            </button>

            <button onClick={onLogout} style={logoutButtonStyle}>
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div style={realtimeBarStyle}>
        <div style={realtimeItemStyle}>
          <Eye size={16} style={{ color: '#10b981' }} />
          <span>{analytics.realtime.currentVisitors} visitantes online</span>
        </div>
        <div style={realtimeItemStyle}>
          <Activity size={16} style={{ color: '#6366f1' }} />
          <span>{analytics.realtime.activeSessions} sessões ativas</span>
        </div>
        <div style={realtimeItemStyle}>
          <Star size={16} style={{ color: '#f59e0b' }} />
          <span>Stellar: {analytics.stellar.network.status === 'online' ? 'Online' : 'Offline'}</span>
        </div>
        <div style={realtimeItemStyle}>
          <TrendingUp size={16} style={{ color: analytics.realtime.trend === 'up' ? '#10b981' : '#ef4444' }} />
          <span>Tendência: {analytics.realtime.trend === 'up' ? '↗️ Alta' : '↘️ Baixa'}</span>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div style={metricsGridStyle}>
        {/* Revenue Today */}
        <MetricCard
          title="Receita Hoje"
          value={formatCurrency(analytics.sales.today.revenue)}
          change={formatPercentage(analytics.sales.today.growth)}
          changeType={analytics.sales.today.growth > 0 ? 'positive' : 'negative'}
          icon={<DollarSign size={24} />}
          subtitle={`${analytics.sales.today.transactions} transações`}
        />

        {/* Conversion Rate */}
        <MetricCard
          title="Taxa de Conversão"
          value={`${analytics.conversion.overall.rate}%`}
          change={`${analytics.conversion.overall.conversions}/${analytics.conversion.overall.visitors}`}
          changeType="neutral"
          icon={<Target size={24} />}
          subtitle="visitantes → compras"
        />

        {/* Average Ticket */}
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(analytics.sales.today.averageTicket)}
          change={`vs ${formatCurrency(analytics.sales.yesterday.averageTicket)} ontem`}
          changeType={analytics.sales.today.averageTicket > analytics.sales.yesterday.averageTicket ? 'positive' : 'negative'}
          icon={<ShoppingCart size={24} />}
          subtitle="por transação"
        />

        {/* Chat Performance */}
        <MetricCard
          title="Performance Chat"
          value={analytics.chat.performance.averageTime}
          change={`${analytics.chat.conversations.total} conversas`}
          changeType="neutral"
          icon={<MessageCircle size={24} />}
          subtitle={`Score: ${analytics.chat.performance.satisfactionScore}/5`}
        />
      </div>

      {/* Charts Section */}
      <div style={chartsGridStyle}>
        {/* Sales Chart */}
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>📈 Vendas da Semana</h3>
          <SalesChart data={analytics.sales.week} />
        </div>

        {/* Conversion Funnel */}
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>🎯 Funil de Conversão</h3>
          <ConversionFunnel data={analytics.conversion.funnel} />
        </div>
      </div>

      {/* Bottom Section */}
      <div style={bottomGridStyle}>
        {/* Stellar Analytics */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>⭐ Stellar Network</h3>
          <div style={stellarStatsStyle}>
            <div style={stellarStatStyle}>
              <span style={labelStyle}>Transações Hoje:</span>
              <span style={valueStyle}>{analytics.stellar.transactions.today}</span>
            </div>
            <div style={stellarStatStyle}>
              <span style={labelStyle}>Volume USDC:</span>
              <span style={valueStyle}>{analytics.stellar.transactions.volume.toFixed(4)}</span>
            </div>
            <div style={stellarStatStyle}>
              <span style={labelStyle}>Taxa de Rede:</span>
              <span style={valueStyle}>${analytics.stellar.transactions.averageFee.toFixed(6)}</span>
            </div>
            <div style={stellarStatStyle}>
              <span style={labelStyle}>Settlement Médio:</span>
              <span style={valueStyle}>{analytics.stellar.network.averageSettlement}s</span>
            </div>
          </div>
        </div>

        {/* Top Questions */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>💭 Perguntas Frequentes</h3>
          <div style={questionsListStyle}>
            {analytics.chat.topQuestions.slice(0, 4).map((item, index) => (
              <div key={index} style={questionItemStyle}>
                <span style={questionTextStyle}>{item.question}</span>
                <span style={questionCountStyle}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abandonment Analysis */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>🔍 Análise de Abandono</h3>
          <div style={abandonmentListStyle}>
            {analytics.chat.abandonmentReasons.map((item, index) => (
              <div key={index} style={abandonmentItemStyle}>
                <div style={abandonmentBarStyle}>
                  <div 
                    style={{
                      ...abandonmentFillStyle,
                      width: `${(item.count / Math.max(...analytics.chat.abandonmentReasons.map(r => r.count))) * 100}%`
                    }}
                  ></div>
                </div>
                <span style={abandonmentTextStyle}>{item.reason}</span>
                <span style={abandonmentCountStyle}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={footerStyle} className="dashboard-footer">
        <div style={footerInfoStyle}>
          <div>
            <strong>Dados:</strong> {analytics.dataSource === 'simulated' ? 'Simulados' : 'Reais'} 
            | <strong>Gerado:</strong> {new Date(analytics.timestamp).toLocaleString()}
          </div>
          <div style={poweredByStyle}>
            Powered by ChatCheckout Analytics 🚀
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente MetricCard
function MetricCard({ title, value, change, changeType, icon, subtitle }) {
  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={metricCardStyle}>
      <div style={metricHeaderStyle}>
        <div style={metricIconStyle}>
          {icon}
        </div>
        <div style={metricTitleStyle}>{title}</div>
      </div>
      <div style={metricValueStyle}>{value}</div>
      <div style={metricChangeStyle}>
        <span style={{ color: getChangeColor(changeType) }}>
          {changeType === 'positive' && <TrendingUp size={14} />}
          {changeType === 'negative' && <TrendingDown size={14} />}
          {change}
        </span>
      </div>
      <div style={metricSubtitleStyle}>{subtitle}</div>
    </div>
  );
}

// Componente SalesChart (simplificado)
function SalesChart({ data }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div style={salesChartStyle}>
      {data.map((day, index) => (
        <div key={index} style={chartBarContainerStyle}>
          <div 
            style={{
              ...chartBarStyle,
              height: `${(day.revenue / maxRevenue) * 100}%`
            }}
            title={`${day.day}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(day.revenue)}`}
          ></div>
          <div style={chartLabelStyle}>{day.day}</div>
        </div>
      ))}
    </div>
  );
}

// Componente ConversionFunnel (simplificado)
function ConversionFunnel({ data }) {
  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const steps = [
    { label: 'Chat Iniciado', value: data.chatStarted },
    { label: 'Engajado', value: data.engaged },
    { label: 'Checkout', value: data.checkoutInitiated },
    { label: 'Pagamento', value: data.paymentStarted },
    { label: 'Completado', value: data.completed }
  ];

  const maxValue = Math.max(...steps.map(s => s.value));

  return (
    <div style={funnelStyle}>
      {steps.map((step, index) => (
        <div key={index} style={funnelStepStyle}>
          <div style={funnelBarContainerStyle}>
            <div 
              style={{
                ...funnelBarStyle,
                width: `${(step.value / maxValue) * 100}%`
              }}
            ></div>
          </div>
          <div style={funnelLabelStyle}>
            <span>{step.label}</span>
            <span style={funnelValueStyle}>{formatNumber(step.value)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ESTILOS
const dashboardContainerStyle = {
  padding: '1.5rem',
  maxWidth: '1400px',
  margin: '0 auto',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  background: '#f8fafc',
  minHeight: '100vh',
  overflow: 'visible',
  paddingBottom: '3rem'
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: '#f8fafc',
  padding: '2rem'
};

const loadingSpinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #e2e8f0',
  borderTop: '4px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '1rem'
};

const errorContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: '#f8fafc',
  gap: '1rem',
  padding: '2rem'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '2rem',
  borderRadius: '16px',
  color: '#ffffff',
  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
};

const headerLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const vendorInfoStyle = {
  textAlign: 'left'
};

const titleStyle = {
  margin: 0,
  fontSize: '2rem',
  fontWeight: 'bold'
};

const subtitleStyle = {
  margin: '0.5rem 0 0 0',
  opacity: 0.9,
  fontSize: '1.1rem'
};

const headerActionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.5rem'
};

const financialButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: '#10b981',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '600',
  transition: 'all 0.2s ease'
};

const productsButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: '#6366f1',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '600',
  transition: 'all 0.2s ease'
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
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease'
};

const logoutButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: '#ef4444',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '600',
  transition: 'all 0.2s ease'
};

const retryButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem'
};

const lastUpdateStyle = {
  fontSize: '0.8rem',
  opacity: 0.8
};

const realtimeBarStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  background: '#ffffff',
  padding: '1rem',
  borderRadius: '12px',
  marginBottom: '2rem',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0'
};

const realtimeItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem',
  fontWeight: '500'
};

const metricsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const metricCardStyle = {
  background: '#ffffff',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
};

const metricHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1rem'
};

const metricIconStyle = {
  color: '#3b82f6'
};

const metricTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#374151'
};

const metricValueStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#111827',
  marginBottom: '0.5rem'
};

const metricChangeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.9rem',
  fontWeight: '500',
  marginBottom: '0.5rem'
};

const metricSubtitleStyle = {
  fontSize: '0.8rem',
  color: '#6b7280'
};

const chartsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const chartCardStyle = {
  background: '#ffffff',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0'
};

const chartTitleStyle = {
  margin: '0 0 1rem 0',
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#374151'
};

const salesChartStyle = {
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'space-between',
  height: '200px',
  gap: '0.5rem'
};

const chartBarContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  height: '100%'
};

const chartBarStyle = {
  width: '100%',
  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  borderRadius: '4px 4px 0 0',
  minHeight: '4px',
  transition: 'height 0.3s ease'
};

const chartLabelStyle = {
  fontSize: '0.8rem',
  color: '#6b7280',
  marginTop: '0.5rem'
};

const funnelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const funnelStepStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const funnelBarContainerStyle = {
  flex: 1,
  height: '24px',
  background: '#f3f4f6',
  borderRadius: '12px',
  overflow: 'hidden'
};

const funnelBarStyle = {
  height: '100%',
  background: 'linear-gradient(135deg, #10b981, #059669)',
  borderRadius: '12px',
  transition: 'width 0.3s ease'
};

const funnelLabelStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  minWidth: '140px',
  fontSize: '0.9rem'
};

const funnelValueStyle = {
  fontWeight: 'bold',
  color: '#374151'
};

const bottomGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const cardStyle = {
  background: '#ffffff',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0'
};

const cardTitleStyle = {
  margin: '0 0 1rem 0',
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#374151'
};

const stellarStatsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const stellarStatStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const labelStyle = {
  fontSize: '0.9rem',
  color: '#6b7280'
};

const valueStyle = {
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: '#374151'
};

const questionsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const questionItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem',
  background: '#f8fafc',
  borderRadius: '6px'
};

const questionTextStyle = {
  fontSize: '0.9rem',
  color: '#374151'
};

const questionCountStyle = {
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: '#3b82f6',
  background: '#dbeafe',
  padding: '0.25rem 0.5rem',
  borderRadius: '12px'
};

const abandonmentListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const abandonmentItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem'
};

const abandonmentBarStyle = {
  width: '60px',
  height: '8px',
  background: '#f3f4f6',
  borderRadius: '4px',
  overflow: 'hidden'
};

const abandonmentFillStyle = {
  height: '100%',
  background: '#ef4444',
  borderRadius: '4px',
  transition: 'width 0.3s ease'
};

const abandonmentTextStyle = {
  flex: 1,
  fontSize: '0.9rem',
  color: '#374151'
};

const abandonmentCountStyle = {
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: '#ef4444'
};

const footerStyle = {
  background: '#ffffff',
  padding: '1rem',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  marginTop: '1rem'
};

const footerInfoStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.8rem',
  color: '#6b7280'
};

const poweredByStyle = {
  fontWeight: '500',
  color: '#3b82f6'
};

export default VendorDashboard;