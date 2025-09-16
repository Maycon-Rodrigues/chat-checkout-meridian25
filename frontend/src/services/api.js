// frontend/src/services/api.js

/**
 * API SERVICE - Integração com Backend NestJS
 * Implementa todas as requisições para consumir o backend em funcionamento
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getStoredToken();
  }

  // Helper para armazenar/recuperar token
  getStoredToken() {
    const session = localStorage.getItem('session');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.access_token || parsed.session_token;
    }
    return null;
  }

  setToken(token) {
    this.token = token;
  }

  // Helper para fazer requisições
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // AUTENTICAÇÃO
  // ============================================================================

  async login(email, password) {
    const result = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (result.success) {
      const { access_token, refresh_token } = result.data;
      this.setToken(access_token);
      
      // Buscar perfil do usuário para obter dados completos
      const profileResult = await this.getUserProfile();
      if (!profileResult.success) {
        return { success: false, error: 'Falha ao carregar perfil do usuário' };
      }
      
      const user = profileResult.data;
      
      // Armazenar sessão no localStorage
      const session = {
        access_token,
        refresh_token,
        user,
        session_token: access_token // Para compatibilidade com código existente
      };
      localStorage.setItem('session', JSON.stringify(session));
      
      return { success: true, user, sessionToken: access_token };
    }

    return result;
  }

  async refreshToken(refreshToken) {
    const result = await this.makeRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
      skipAuth: true,
    });

    if (result.success) {
      const { access_token } = result.data;
      this.setToken(access_token);
      
      // Atualizar sessão
      const session = JSON.parse(localStorage.getItem('session') || '{}');
      session.access_token = access_token;
      session.session_token = access_token;
      localStorage.setItem('session', JSON.stringify(session));
    }

    return result;
  }

  async verifySession(sessionToken) {
    this.setToken(sessionToken);
    const result = await this.getUserProfile();
    
    if (result.success) {
      // Tentar buscar dados do merchant para o usuário
      let vendor = {
        id: result.data.id,
        name: result.data.email.split('@')[0],
        display_name: result.data.email.split('@')[0],
        email: result.data.email,
        company: 'Empresa',
        stellarPublicKey: '',
        // Incluir dados originais do user
        ...result.data
      };

      try {
        const merchantResult = await this.getMerchantByUserId(result.data.id);
        if (merchantResult.success && merchantResult.data && merchantResult.data.id) {
          // Se encontrou merchant, usar seus dados
          vendor = {
            id: merchantResult.data.id,
            name: merchantResult.data.display_name,
            display_name: merchantResult.data.display_name,
            email: result.data.email,
            company: merchantResult.data.display_name,
            stellarPublicKey: '',
            merchant_id: merchantResult.data.merchant_id,
            logo_url: merchantResult.data.logo_url,
            // Incluir dados originais
            ...result.data,
            ...merchantResult.data
          };
        }
      } catch (error) {
        console.log('Merchant não encontrado, usando dados básicos do usuário');
      }
      
      return { success: true, vendor };
    }
    
    return { success: false, error: 'Sessão inválida' };
  }

  logout() {
    this.token = null;
    localStorage.removeItem('session');
  }

  getCurrentSession() {
    return JSON.parse(localStorage.getItem('session') || 'null');
  }

  // ============================================================================
  // USUÁRIOS
  // ============================================================================

  async registerUser(email, password) {
    return this.makeRequest('/user/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  }

  async getUserProfile() {
    return this.makeRequest('/user/profile');
  }

  async updateUser(id, userData) {
    return this.makeRequest(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.makeRequest(`/user/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // MERCHANTS
  // ============================================================================

  async createMerchant(merchantData) {
    return this.makeRequest('/merchant', {
      method: 'POST',
      body: JSON.stringify(merchantData),
    });
  }

  async getMerchant(id) {
    return this.makeRequest(`/merchant/${id}`);
  }

  async getMerchantByUserId(userId) {
    return this.makeRequest(`/merchant/user/${userId}`);
  }

  async updateMerchant(id, merchantData) {
    return this.makeRequest(`/merchant/${id}`, {
      method: 'PUT',
      body: JSON.stringify(merchantData),
    });
  }

  async deleteMerchant(id) {
    return this.makeRequest(`/merchant/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // PRODUTOS
  // ============================================================================

  async createProduct(productData) {
    return this.makeRequest('/product', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getProducts() {
    return this.makeRequest('/product');
  }

  async getProduct(id) {
    return this.makeRequest(`/product/${id}`);
  }

  async getProductsByMerchant(merchantId) {
    return this.makeRequest(`/product/merchant/${merchantId}`);
  }

  async updateProduct(id, productData) {
    return this.makeRequest(`/product/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.makeRequest(`/product/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // CHAT AI
  // ============================================================================

  async sendChatMessage(message, messageHistory = [], vendorId, productConfig) {
    // ✅ MELHORAR CONTEXTO ENVIADO PARA IA
    const requestBody = {
      message,
      context: {
        messageHistory: messageHistory.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        vendorId,
        productInfo: productConfig ? {
          productName: productConfig.product.name,
          productPrice: productConfig.product.price,
          productDescription: productConfig.product.description,
          aiPrompt: productConfig.product.aiPrompt || productConfig.systemPrompt,
          vendorName: productConfig.vendor?.name || productConfig.vendor?.company
        } : null
      }
    };

    // ✅ LOGS DE DEBUG
    console.log('📤 Enviando mensagem para /chat-ai:', {
      message,
      productName: productConfig?.product?.name,
      historyLength: messageHistory.length
    });

    // ✅ SISTEMA DE RETRY PARA ROBUSTEZ
    let result = await this.makeRequest('/chat-ai', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      skipAuth: true,
    });

    // ✅ RETRY EM CASO DE FALHA (máximo 1 tentativa adicional)
    if (!result.success && !result.data) {
      console.log('🔄 Primeira tentativa falhou, tentando novamente...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1s
      result = await this.makeRequest('/chat-ai', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        skipAuth: true,
      });
    }

    // ✅ LOG DA RESPOSTA COMPLETA
    console.log('📥 Resposta completa do backend:', result);

    if (result.success && result.data) {
      // ✅ MÚLTIPLOS FORMATOS DE RESPOSTA
      const responseMessage = 
        result.data.response || 
        result.data.message || 
        result.data.reply ||
        result.data.text ||
        (typeof result.data === 'string' ? result.data : null);

      if (responseMessage) {
        console.log('✅ Resposta da IA extraída:', responseMessage.substring(0, 100) + '...');
        return { 
          success: true, 
          message: responseMessage,
          model: result.data.model || 'backend-ai',
          fallback: false
        };
      }
    }
    
    // ✅ LOG DE FALLBACK
    console.log('⚠️ Backend falhou ou resposta inválida, usando fallback');
    console.log('Dados recebidos:', result.data);
    
    // Fallback para resposta básica se backend falhar
    return { 
      success: true, 
      message: this.generateFallbackResponse(message, productConfig),
      model: 'fallback',
      fallback: true
    };
  }

  generateFallbackResponse(message, productConfig) {
    const lowerMessage = message.toLowerCase();
    
    // ✅ RESPOSTAS CONTEXTUAIS BASEADAS NA MENSAGEM
    if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('custa')) {
      if (productConfig && productConfig.product) {
        return `O ${productConfig.product.name} custa R$ ${productConfig.product.price}. É um investimento que vale muito a pena! Quer saber mais detalhes?`;
      }
      return "Temos produtos com excelente custo-benefício! Qual produto te interessa?";
    }
    
    if (lowerMessage.includes('comprar') || lowerMessage.includes('pagar') || lowerMessage.includes('adquirir')) {
      return "Perfeito! Você pode finalizar sua compra usando cartão, PIX ou até mesmo criptomoedas. Qual forma de pagamento prefere?";
    }
    
    if (lowerMessage.includes('como funciona') || lowerMessage.includes('funciona')) {
      if (productConfig && productConfig.product) {
        return `O ${productConfig.product.name} é ${productConfig.product.description}. É muito fácil de usar! Quer que eu explique melhor algum aspecto específico?`;
      }
      return "É muito simples! Nossos produtos são criados para facilitar sua vida. Qual aspecto específico gostaria de entender?";
    }

    // ✅ RESPOSTAS ESPECÍFICAS DO PRODUTO
    if (productConfig && productConfig.product) {
      const product = productConfig.product;
      const responses = [
        `Ótima pergunta sobre o ${product.name}! Este produto por R$ ${product.price} ${product.description}. Como posso ajudar você a decidir?`,
        `O ${product.name} é uma excelente escolha! Por R$ ${product.price}, você terá ${product.description}. Quer saber mais detalhes?`,
        `Interessado no ${product.name}? É um produto incrível por R$ ${product.price}. ${product.description}. Posso esclarecer alguma dúvida?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // ✅ RESPOSTAS GERAIS
    const generalResponses = [
      "Obrigado pela sua mensagem! Como posso ajudar você hoje?",
      "Interessante! Conte-me mais sobre o que você precisa.",
      "Estou aqui para ajudar! Qual informação você gostaria de saber?",
      "Que bom ter você aqui! Em que posso ser útil?"
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  // ============================================================================
  // PRODUCT LINKS - Sistema de Links para Produtos
  // ============================================================================

  async generateProductLink(vendorId, productData, settings = {}) {
    try {
      // Gerar ID único para o link
      const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Estrutura completa do link
      const linkData = {
        linkId,
        url: `${window.location.origin}/l/${linkId}`,
        product: {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          description: productData.description,
          aiPrompt: productData.aiPrompt || `Você é um assistente especializado em ${productData.name}. Destaque os benefícios e conduza para a compra.`
        },
        vendor: {
          id: vendorId,
          name: productData.vendorName,
          company: productData.company
        },
        settings: {
          customMessage: settings.customMessage || `Olá! Interessado no ${productData.name}? Estou aqui para ajudar! 🚀`,
          showProductInfo: settings.showProductInfo !== false,
          collectEmail: settings.collectEmail !== false,
          tokenOut: settings.tokenOut || 'BRL',
          platformFeeBps: settings.platformFeeBps || 300,
          vendorWallet: settings.vendorWallet || ''
        },
        createdAt: new Date().toISOString(),
        stats: {
          views: 0,
          interactions: 0,
          conversions: 0
        }
      };

      // Armazenar no localStorage (simulando banco de dados)
      const links = JSON.parse(localStorage.getItem('productLinks') || '{}');
      links[linkId] = linkData;
      localStorage.setItem('productLinks', JSON.stringify(links));

      console.log('✅ Link gerado:', linkData.url);
      
      return { 
        success: true, 
        url: linkData.url, 
        linkId,
        linkData 
      };

    } catch (error) {
      console.error('Erro ao gerar link:', error);
      return { 
        success: false, 
        error: 'Falha ao gerar link do produto' 
      };
    }
  }

  async getProductLink(linkId) {
    try {
      const links = JSON.parse(localStorage.getItem('productLinks') || '{}');
      const linkData = links[linkId];

      if (linkData) {
        // Incrementar views
        linkData.stats.views += 1;
        links[linkId] = linkData;
        localStorage.setItem('productLinks', JSON.stringify(links));

        console.log('✅ Dados do link carregados:', linkData.product.name);
        
        return { 
          success: true, 
          link: linkData 
        };
      }

      return { 
        success: false, 
        error: 'Link não encontrado' 
      };

    } catch (error) {
      console.error('Erro ao buscar link:', error);
      return { 
        success: false, 
        error: 'Falha ao carregar dados do link' 
      };
    }
  }

  async updateLinkStats(linkId, statType) {
    try {
      const links = JSON.parse(localStorage.getItem('productLinks') || '{}');
      const linkData = links[linkId];

      if (linkData) {
        if (statType === 'interaction') {
          linkData.stats.interactions += 1;
        } else if (statType === 'conversion') {
          linkData.stats.conversions += 1;
        }

        links[linkId] = linkData;
        localStorage.setItem('productLinks', JSON.stringify(links));
        
        return { success: true };
      }

      return { success: false, error: 'Link não encontrado' };

    } catch (error) {
      console.error('Erro ao atualizar stats:', error);
      return { success: false, error: 'Falha ao atualizar estatísticas' };
    }
  }

  // ============================================================================
  // MÉTODOS DE COMPATIBILIDADE (para manter código existente funcionando)
  // ============================================================================

  async vendorRegister(name, company, email, password, cpf) {
    // Primeiro registra o usuário
    const userResult = await this.registerUser(email, password);
    if (!userResult.success) {
      return userResult;
    }

    // Depois faz login para obter o token
    const loginResult = await this.login(email, password);
    if (!loginResult.success) {
      return loginResult;
    }

    // Cria o merchant
    const merchantResult = await this.createMerchant({
      userId: loginResult.user.id,
      merchant_id: cpf,
      display_name: name,
      logo_url: '',
    });

    if (merchantResult.success) {
      return { success: true };
    }

    return merchantResult;
  }

  async vendorLogin(email, password) {
    const result = await this.login(email, password);
    if (result.success) {
      // Tentar buscar dados do merchant para o usuário
      let vendor = {
        id: result.user.id,
        name: result.user.email.split('@')[0], // Nome baseado no email
        display_name: result.user.email.split('@')[0],
        email: result.user.email,
        company: 'Empresa',
        stellarPublicKey: '',
        // Incluir dados originais do user
        ...result.user
      };

      try {
        const merchantResult = await this.getMerchantByUserId(result.user.id);
        if (merchantResult.success && merchantResult.data && merchantResult.data.id) {
          // Se encontrou merchant, usar seus dados
          vendor = {
            id: merchantResult.data.id,
            name: merchantResult.data.display_name,
            display_name: merchantResult.data.display_name,
            email: result.user.email,
            company: merchantResult.data.display_name,
            stellarPublicKey: '',
            merchant_id: merchantResult.data.merchant_id,
            logo_url: merchantResult.data.logo_url,
            // Incluir dados originais
            ...result.user,
            ...merchantResult.data
          };
        }
      } catch (error) {
        console.log('Merchant não encontrado, usando dados básicos do usuário');
      }
      
      return {
        success: true,
        vendor,
        sessionToken: result.sessionToken,
      };
    }
    return { success: false, error: result.error };
  }

  async getVendorProducts(vendorId) {
    if (vendorId) {
      const result = await this.getProductsByMerchant(vendorId);
      if (result.success) {
        return { success: true, products: result.data };
      }
      return result;
    }
    
    const result = await this.getProducts();
    if (result.success) {
      return { success: true, products: result.data };
    }
    return result;
  }

  async createVendorProduct(productData) {
    const { vendorId, ...rest } = productData;
    const result = await this.createProduct({
      ...rest,
      merchantId: vendorId,
    });
    
    if (result.success) {
      return { success: true, product: result.data };
    }
    return result;
  }

  // Método placeholder para dados financeiros (não implementado no backend ainda)
  async getFinancialData(vendorId) {
    // Mock data para compatibilidade
    return {
      success: true,
      balances: { available: 0, pending: 0, totalEarned: 0 },
      stellarWallet: { publicKey: '', usdcBalance: 0, xlmBalance: 0 },
      recentTransactions: []
    };
  }

  // ============================================================================
  // MÉTODOS AUXILIARES PARA CRYPTO/PAGAMENTOS
  // ============================================================================

  async getExchangeRate(fromCurrency, toCurrency) {
    // Mock para taxa de câmbio - em produção usar API real
    const rates = {
      'BRL_USDC': 0.19,
      'BRL_XLM': 8.5,
      'USDC_BRL': 5.3,
      'XLM_BRL': 0.12
    };
    
    const key = `${fromCurrency}_${toCurrency}`;
    return {
      success: true,
      rate: rates[key] || 1,
      timestamp: new Date().toISOString()
    };
  }

  async simulateSwap(tokenIn, tokenOut, targetAmount) {
    // Mock para simulação de swap - em produção usar Soroswap API
    const mockRates = {
      'AQUA_USDC': 0.08,
      'XLM_USDC': 0.11,
      'USDC_BRL': 5.3
    };

    const rate = mockRates[`${tokenIn}_${tokenOut}`] || 0.1;
    const inputAmount = targetAmount / rate;
    
    return {
      success: true,
      inputAmount,
      outputAmount: targetAmount,
      rate,
      slippage: 0.4,
      timestamp: new Date().toISOString()
    };
  }

  async processPayment(paymentData) {
    // Mock para processamento de pagamento - em produção integrar com Stellar
    console.log('🔄 Processando pagamento cripto:', paymentData);
    
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular sucesso (95% de chance)
    if (Math.random() > 0.05) {
      return {
        success: true,
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        blockNumber: Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: 'Transação rejeitada pela rede'
      };
    }
  }
}

// Criar instância única do serviço
const apiService = new ApiService();

export default apiService;