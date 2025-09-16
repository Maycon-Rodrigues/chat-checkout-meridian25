// StellarPassKey.js - Tentativa com Node 18
class StellarPassKey {
  constructor() {
    this.passkeyKit = null;
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Tentar importar passkey-kit
      const { PasskeyKit } = await import('passkey-kit');
      
      this.passkeyKit = new PasskeyKit({
        rpcUrl: 'https://soroban-testnet.stellar.org',
        networkPassphrase: 'Test SDF Network ; September 2015',
        factoryContractId: 'CDJZ4JPYWTHCSKTBDHGHZDZF4AAWHV4KFPMZPFHNQR3JZEF3YODOFYZX'
      });
      
      this.initialized = true;
      console.log('PasskeyKit carregado com sucesso');
      return true;
      
    } catch (error) {
      console.warn('Erro ao carregar PasskeyKit:', error);
      // Fallback para WebAuthn básico
      this.initialized = true;
      return false;
    }
  }

  async createWalletWithPassKey(userInfo) {
    try {
      const hasPasskeyKit = await this.initialize();
      
      if (hasPasskeyKit && this.passkeyKit) {
        // Usar PasskeyKit real
        console.log('Criando Smart Wallet...');
        
        const result = await this.passkeyKit.createWallet({
          name: userInfo.name,
          email: userInfo.email
        });
        
        if (result && result.contractId) {
          const walletData = {
            contractId: result.contractId,
            publicKey: result.publicKey,
            userInfo: userInfo,
            createdAt: new Date().toISOString(),
            type: 'smart-wallet'
          };
          
          localStorage.setItem('stellar_passkey_wallet', JSON.stringify(walletData));
          
          return {
            success: true,
            stellarPublicKey: result.publicKey,
            contractId: result.contractId,
            walletCreated: true
          };
        }
      } else {
        // Fallback para WebAuthn básico + Stellar
        console.log('Usando fallback WebAuthn...');
        return await this.createBasicPasskeyWallet(userInfo);
      }
      
    } catch (error) {
      console.error('Erro ao criar carteira:', error);
      throw error;
    }
  }

  async createBasicPasskeyWallet(userInfo) {
    // Import dinâmico do Stellar SDK
    const StellarSdk = await import('@stellar/stellar-sdk');
    
    // Criar carteira Stellar tradicional
    const stellarKeypair = StellarSdk.Keypair.random();
    const publicKey = stellarKeypair.publicKey();
    const secretKey = stellarKeypair.secret();
    
    // Criar PassKey básico
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: challenge,
        rp: { name: "ChatCheckout", id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(publicKey),
          name: userInfo.email || 'user@stellar.com',
          displayName: userInfo.name || 'Stellar User',
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
      }
    });

    const walletData = {
      credentialId: credential.id,
      stellarPublicKey: publicKey,
      stellarSecretKey: secretKey,
      userInfo: userInfo,
      createdAt: new Date().toISOString(),
      type: 'basic-passkey'
    };
    
    localStorage.setItem('stellar_passkey_wallet', JSON.stringify(walletData));
    
    return {
      success: true,
      stellarPublicKey: publicKey,
      walletCreated: true
    };
  }

  async authenticateAndGetWallet() {
    const walletData = this.getStoredWallet();
    if (!walletData) throw new Error('Nenhuma carteira encontrada');

    try {
      if (walletData.type === 'smart-wallet' && this.passkeyKit) {
        // Autenticar Smart Wallet
        const authResult = await this.passkeyKit.authenticate({
          contractId: walletData.contractId
        });
        
        if (authResult && authResult.success) {
          return {
            success: true,
            contractId: walletData.contractId,
            publicKey: walletData.publicKey,
            userInfo: walletData.userInfo
          };
        }
      } else {
        // Autenticar PassKey básico
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            allowCredentials: [{
              id: Uint8Array.from(atob(walletData.credentialId), c => c.charCodeAt(0)),
              type: 'public-key'
            }],
            userVerification: "required",
            timeout: 60000,
          }
        });

        if (assertion) {
          return {
            success: true,
            publicKey: walletData.stellarPublicKey,
            userInfo: walletData.userInfo
          };
        }
      }
      
      throw new Error('Falha na autenticação');
      
    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw error;
    }
  }

  async getWalletBalance() {
    const walletData = this.getStoredWallet();
    if (!walletData) return null;

    try {
      if (walletData.type === 'smart-wallet' && this.passkeyKit) {
        // Obter balance de Smart Wallet
        const balance = await this.passkeyKit.getBalance(walletData.contractId);
        return {
          publicKey: walletData.publicKey,
          contractId: walletData.contractId,
          balances: balance?.balances || [],
          accountExists: balance?.exists || false,
          smartWallet: true
        };
      } else {
        // Obter balance de carteira tradicional
        const StellarSdk = await import('@stellar/stellar-sdk');
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        
        try {
          const account = await server.loadAccount(walletData.stellarPublicKey);
          return {
            publicKey: walletData.stellarPublicKey,
            balances: account.balances.map(b => ({
              asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
              balance: parseFloat(b.balance)
            })),
            accountExists: true
          };
        } catch (error) {
          if (error.response?.status === 404) {
            return {
              publicKey: walletData.stellarPublicKey,
              balances: [],
              accountExists: false,
              needsFunding: true
            };
          }
          throw error;
        }
      }
      
    } catch (error) {
      console.error('Erro ao obter balance:', error);
      return {
        publicKey: walletData.stellarPublicKey || walletData.publicKey,
        balances: [],
        accountExists: false,
        error: error.message
      };
    }
  }

  async fundTestnetAccount() {
    const walletData = this.getStoredWallet();
    if (!walletData) throw new Error('Nenhuma carteira encontrada');

    try {
      const publicKey = walletData.stellarPublicKey || walletData.publicKey;
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      
      if (response.ok) {
        console.log('Conta financiada na testnet');
        return { success: true, funded: true };
      } else {
        throw new Error('Falha no funding');
      }
      
    } catch (error) {
      console.error('Erro no funding:', error);
      throw error;
    }
  }

  hasWallet() {
    return !!localStorage.getItem('stellar_passkey_wallet');
  }

  getStoredWallet() {
    const data = localStorage.getItem('stellar_passkey_wallet');
    return data ? JSON.parse(data) : null;
  }

  getWalletInfo() {
    const walletData = this.getStoredWallet();
    if (!walletData) return null;
    
    return {
      publicKey: walletData.stellarPublicKey || walletData.publicKey,
      contractId: walletData.contractId,
      userInfo: walletData.userInfo,
      createdAt: walletData.createdAt,
      type: walletData.type
    };
  }

  clearWallet() {
    localStorage.removeItem('stellar_passkey_wallet');
    this.passkeyKit = null;
    this.initialized = false;
  }
}

export default new StellarPassKey();