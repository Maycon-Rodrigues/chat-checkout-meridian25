import React, { useState, useEffect } from 'react';
import ClientChat from './ClientChat';
import Admin from './Admin';
import VendorDashboard from './VendorDashboard';
import VendorAuth from './VendorAuth'; // ✅ USAR VENDORAUTH EM VEZ DE STELLARLOGIN
import FinancialPanel from './FinancialPanel';
import ProductsPanel from './ProductsPanel';
import ProductLanding from './ProductLanding';
import apiService from './services/api'; // ✅ IMPORTAR API SERVICE

function App() {
  const [currentView, setCurrentView] = useState('vendor-auth'); // ✅ ROTA OFICIAL: LOGIN
  const [vendorSession, setVendorSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Detectar rota e verificar sessão
  useEffect(() => {
    checkRouteAndSession();
    
    // 🔧 TESTE MANUAL: Detectar se URL contém vendor
    const urlContainsVendor = window.location.href.includes('vendor');
    if (urlContainsVendor) {
      console.log('🚨 URL CONTÉM VENDOR - FORÇANDO DETECÇÃO');
      setTimeout(() => {
        setCurrentView('vendor-auth');
        setIsLoadingSession(false);
      }, 100);
    }
    
    // Adicionar listener para mudanças de hash
    const handleHashChange = () => {
      console.log('🔄 Hash mudou para:', window.location.hash);
      checkRouteAndSession();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const checkRouteAndSession = async () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    const fullUrl = window.location.href;

    console.log('🔍 DEBUG COMPLETO:');
    console.log('   - pathname:', path);
    console.log('   - hash:', hash);
    console.log('   - search:', search);
    console.log('   - href:', fullUrl);
    console.log('   - hash inclui vendor?', hash.includes('vendor'));

    // NOVA ROTA: Links de produtos /l/:linkId
    if (path.startsWith('/l/')) {
      const linkId = path.split('/l/')[1];
      console.log('🔗 Link de produto detectado:', linkId);
      setCurrentView('product-landing');
      setIsLoadingSession(false);
      return;
    }

    // Rotas do vendedor - LOGIN (detecção mais robusta)
    const isVendorRoute = (
      path.includes('vendor') ||
      hash === '#vendor' || 
      hash.includes('vendor') ||
      search.includes('vendor')
    );

    if (isVendorRoute) {
      console.log('🔑 ROTA VENDEDOR DETECTADA!');
      setCurrentView('vendor-auth');
      await checkVendorSession();
      return;
    }
    // Rotas que precisam de sessão ativa
    else if (hash === '#admin' || hash === '#dashboard' || hash === '#financial' || hash === '#products') {
      console.log('🔒 Rota protegida detectada:', hash);
      const session = await checkVendorSession();
      if (session) {
        if (hash === '#admin') {
          setCurrentView('admin');
        } else if (hash === '#financial') {
          setCurrentView('financial');
        } else if (hash === '#products') {
          setCurrentView('products');
        } else {
          setCurrentView('dashboard');
        }
      } else {
        console.log('❌ Sem sessão - redirecionando para login');
        // Redirecionar para login se não tiver sessão
        window.location.hash = '#vendor';
        setCurrentView('vendor-auth');
      }
    }
    // Rota cliente (padrão)
    else {
      console.log('👤 Rota padrão -> Login do Vendedor');
      setCurrentView('vendor-auth'); // ✅ ROTA OFICIAL: LOGIN
      setIsLoadingSession(false);
    }
  };

  const checkVendorSession = async () => {
    try {
      // ✅ USAR API SERVICE EM VEZ DE FETCH
      const session = apiService.getCurrentSession();
      if (!session || !session.session_token) {
        console.log('ℹ️ Nenhum token de sessão encontrado');
        setIsLoadingSession(false);
        return null;
      }

      console.log('🔍 Verificando token de sessão...');
      const result = await apiService.verifySession(session.session_token);
      
      if (result.success) {
        console.log('✅ Sessão válida encontrada para:', result.vendor.display_name || result.vendor.name);
        setVendorSession(result.vendor);
        setIsLoadingSession(false);
        return result.vendor;
      } else {
        console.log('❌ Sessão inválida - removendo token');
        apiService.logout();
        setIsLoadingSession(false);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      apiService.logout();
      setIsLoadingSession(false);
      return null;
    }
  };

  const handleVendorLogin = (vendor, sessionToken) => {
    console.log('🎉 Login realizado com sucesso:', vendor.display_name || vendor.name);
    setVendorSession(vendor);
    setCurrentView('products'); // ✅ IR PARA PRODUTOS APÓS LOGIN
    window.location.hash = '#products'; // ✅ IR PARA PRODUTOS APÓS LOGIN
  };

  const handleVendorLogout = () => {
    console.log('👋 Logout realizado');
    apiService.logout(); // ✅ USAR API SERVICE
    setVendorSession(null);
    setCurrentView('vendor-auth');
    window.location.hash = '#vendor';
  };

  const goToClient = () => {
    console.log('👤 Redirecionando para cliente');
    setCurrentView('client');
    window.location.pathname = '/';
    window.location.hash = '';
  };

  // Loading da sessão
  if (isLoadingSession) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle}></div>
        <h2>Verificando sessão...</h2>
      </div>
    );
  }

  console.log('🎯 View atual:', currentView);

  // LANDING PAGE: Cliente clicou em link de produto - PRIORIDADE MÁXIMA
  if (currentView === 'product-landing') {
    const linkId = window.location.pathname.split('/l/')[1];
    console.log('🚀 CARREGANDO PRODUCTLANDING PARA LINK:', linkId);
    return (
      <ProductLanding linkId={linkId} />
    );
  }
  if (currentView === 'vendor-auth') {
    return (
      <VendorAuth 
        onLoginSuccess={handleVendorLogin}
        onBack={goToClient}
      />
    );
  }

  // VENDEDOR: Produtos e Links
  if (currentView === 'products') {
    if (!vendorSession) {
      console.log('❌ Sem sessão - redirecionando para login');
      setCurrentView('vendor-auth');
      return null;
    }
    
    return (
      <ProductsPanel 
        vendor={vendorSession}
        onBack={() => {
          setCurrentView('dashboard');
          window.location.hash = '#dashboard';
        }}
      />
    );
  }

  // VENDEDOR: Painel Financeiro
  if (currentView === 'financial') {
    if (!vendorSession) {
      console.log('❌ Sem sessão - redirecionando para login');
      setCurrentView('vendor-auth');
      return null;
    }
    
    return (
      <FinancialPanel 
        vendor={vendorSession}
        onBack={() => {
          setCurrentView('dashboard');
          window.location.hash = '#dashboard';
        }}
      />
    );
  }

  // VENDEDOR: Dashboard Analytics
  if (currentView === 'dashboard') {
    if (!vendorSession) {
      console.log('❌ Sem sessão - redirecionando para login');
      setCurrentView('vendor-auth');
      return null;
    }
    
    return (
      <VendorDashboard 
        vendor={vendorSession}
        onLogout={handleVendorLogout}
        onBackToChat={goToClient}
      />
    );
  }

  // VENDEDOR: Admin Config
  if (currentView === 'admin') {
    if (!vendorSession) {
      console.log('❌ Sem sessão - redirecionando para login');
      setCurrentView('vendor-auth');
      return null;
    }
    
    return (
      <Admin 
        vendor={vendorSession}
        onLogout={handleVendorLogout}
      />
    );
  }

  // LANDING PAGE: Cliente clicou em link de produto
  if (currentView === 'product-landing') {
    const linkId = window.location.pathname.split('/l/')[1];
    return (
      <ProductLanding linkId={linkId} />
    );
  }

  // CLIENTE: Chat público (padrão)
  return <ClientChat vendorId="demo-empresa" />;
}

// Estilos para loading
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

export default App;