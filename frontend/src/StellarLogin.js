import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as StellarSdk from '@stellar/stellar-sdk';
import { ArrowLeft, Key, Star, Shield, User, Building } from 'lucide-react';

function StellarLogin({ onLoginSuccess, onBack }) {
  const [step, setStep] = useState('welcome'); // 'welcome', 'register', 'login', 'loading'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vendorInfo, setVendorInfo] = useState({
    name: '',
    company: '',
    email: ''
  });

  // Verificar se já existe sessão ativa
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const sessionToken = localStorage.getItem('stellar_session_token');
      if (sessionToken) {
        const response = await axios.post('http://localhost:5000/api/auth/verify', {
          sessionToken
        });
        
        if (response.data.success) {
          console.log('✅ Sessão ativa encontrada');
          onLoginSuccess(response.data.vendor, sessionToken);
          return;
        } else {
          localStorage.removeItem('stellar_session_token');
        }
      }
    } catch (error) {
      console.log('ℹ️ Nenhuma sessão ativa');
      localStorage.removeItem('stellar_session_token');
    }
  };

  // Função para converter string para Uint8Array (compatível com browser)
  const stringToUint8Array = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  };

  // Função para converter Uint8Array para hex string
  const uint8ArrayToHex = (uint8Array) => {
    return Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleRegister = async () => {
    if (!vendorInfo.name.trim() || !vendorInfo.company.trim()) {
      setError('Nome e empresa são obrigatórios');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log('🌟 Iniciando registro com Stellar PassKey...');
      
      // 1. Obter challenge do backend
      const challengeResponse = await axios.post('http://localhost:5000/api/auth/challenge', {
        action: 'register'
      });
      
      if (!challengeResponse.data.success) {
        throw new Error(challengeResponse.data.error);
      }
      
      const challenge = challengeResponse.data.challenge;
      console.log('🔐 Challenge obtido:', challenge.id);
      
      // 2. Criar nova wallet Stellar
      console.log('🔑 Gerando wallet Stellar...');
      const keypair = StellarSdk.Keypair.random();
      const publicKey = keypair.publicKey();
      const secretKey = keypair.secret();
      
      console.log('✅ Wallet criada:', publicKey.substring(0, 10) + '...');
      
      // 3. Assinar challenge com private key (usando APIs do browser)
      console.log('✍️ Assinando challenge...');
      const messageBytes = stringToUint8Array(challenge.message);
      const signature = keypair.sign(messageBytes);
      const signatureHex = uint8ArrayToHex(signature);
      
      console.log('✅ Assinatura criada');
      
      // 4. Registrar no backend
      console.log('📤 Enviando registro...');
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        challengeId: challenge.id,
        publicKey: publicKey,
        signature: signatureHex,
        vendorInfo: vendorInfo
      });
      
      if (!registerResponse.data.success) {
        throw new Error(registerResponse.data.error);
      }
      
      console.log('🎉 Registro realizado com sucesso!');
      
      // 5. Salvar chaves localmente (em produção seria mais seguro)
      localStorage.setItem('stellar_public_key', publicKey);
      localStorage.setItem('stellar_secret_key', secretKey);
      
      setSuccess('Conta criada com sucesso! Agora faça login.');
      setStep('login');
      
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      setError(error.response?.data?.error || error.message || 'Erro no registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🚪 Iniciando login com Stellar PassKey...');
      
      // 1. Verificar se existe wallet salva
      const savedPublicKey = localStorage.getItem('stellar_public_key');
      const savedSecretKey = localStorage.getItem('stellar_secret_key');
      
      if (!savedPublicKey || !savedSecretKey) {
        throw new Error('Nenhuma wallet encontrada. Faça o registro primeiro.');
      }
      
      console.log('🔑 Wallet encontrada:', savedPublicKey.substring(0, 10) + '...');
      
      // 2. Obter challenge de login
      const challengeResponse = await axios.post('http://localhost:5000/api/auth/challenge', {
        action: 'login'
      });
      
      if (!challengeResponse.data.success) {
        throw new Error(challengeResponse.data.error);
      }
      
      const challenge = challengeResponse.data.challenge;
      console.log('🔐 Challenge de login obtido:', challenge.id);
      
      // 3. Recriar keypair e assinar (usando APIs do browser)
      const keypair = StellarSdk.Keypair.fromSecret(savedSecretKey);
      const messageBytes = stringToUint8Array(challenge.message);
      const signature = keypair.sign(messageBytes);
      const signatureHex = uint8ArrayToHex(signature);
      
      console.log('✍️ Challenge assinado');
      
      // 4. Fazer login
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        challengeId: challenge.id,
        publicKey: savedPublicKey,
        signature: signatureHex
      });
      
      if (!loginResponse.data.success) {
        throw new Error(loginResponse.data.error);
      }
      
      console.log('🎉 Login realizado com sucesso!');
      
      // 5. Salvar sessão
      const sessionToken = loginResponse.data.sessionToken;
      localStorage.setItem('stellar_session_token', sessionToken);
      
      // 6. Chamar callback de sucesso
      onLoginSuccess(loginResponse.data.vendor, sessionToken);
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setError(error.response?.data?.error || error.message || 'Erro no login');
    } finally {
      setIsLoading(false);
    }
  };

  const renderWelcome = () => (
    <div style={welcomeContainerStyle}>
      <div style={headerStyle}>
        <Star size={48} style={{ color: '#6366f1' }} />
        <h1 style={titleStyle}>Stellar PassKeys</h1>
        <p style={subtitleStyle}>Autenticação sem senhas usando blockchain</p>
      </div>
      
      <div style={featuresStyle}>
        <div style={featureStyle}>
          <Shield size={24} style={{ color: '#10b981' }} />
          <span>Sem senhas para lembrar</span>
        </div>
        <div style={featureStyle}>
          <Key size={24} style={{ color: '#f59e0b' }} />
          <span>Biometria + Blockchain</span>
        </div>
        <div style={featureStyle}>
          <Star size={24} style={{ color: '#6366f1' }} />
          <span>Stellar Network</span>
        </div>
      </div>
      
      <div style={actionsStyle}>
        <button 
          onClick={() => setStep('register')}
          style={primaryButtonStyle}
        >
          <User size={20} />
          Criar Conta
        </button>
        
        <button 
          onClick={() => setStep('login')}
          style={secondaryButtonStyle}
        >
          <Key size={20} />
          Entrar
        </button>
      </div>
      
      {onBack && (
        <button onClick={onBack} style={backButtonStyle}>
          <ArrowLeft size={16} />
          Voltar ao Chat
        </button>
      )}
    </div>
  );

  const renderRegister = () => (
    <div style={formContainerStyle}>
      <div style={formHeaderStyle}>
        <h2 style={formTitleStyle}>Criar Conta</h2>
        <p style={formSubtitleStyle}>Suas informações de vendedor</p>
      </div>
      
      <div style={formStyle}>
        <div style={inputGroupStyle}>
          <User size={20} style={iconStyle} />
          <input
            type="text"
            placeholder="Seu nome"
            value={vendorInfo.name}
            onChange={(e) => setVendorInfo(prev => ({ ...prev, name: e.target.value }))}
            style={inputStyle}
          />
        </div>
        
        <div style={inputGroupStyle}>
          <Building size={20} style={iconStyle} />
          <input
            type="text"
            placeholder="Nome da empresa"
            value={vendorInfo.company}
            onChange={(e) => setVendorInfo(prev => ({ ...prev, company: e.target.value }))}
            style={inputStyle}
          />
        </div>
        
        <div style={inputGroupStyle}>
          <span style={iconStyle}>@</span>
          <input
            type="email"
            placeholder="Email (opcional)"
            value={vendorInfo.email}
            onChange={(e) => setVendorInfo(prev => ({ ...prev, email: e.target.value }))}
            style={inputStyle}
          />
        </div>
        
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        
        <button 
          onClick={handleRegister}
          disabled={isLoading}
          style={submitButtonStyle}
        >
          {isLoading ? (
            <span>Criando wallet Stellar...</span>
          ) : (
            <>
              <Star size={20} />
              Criar com Stellar
            </>
          )}
        </button>
        
        <button 
          onClick={() => setStep('welcome')}
          style={cancelButtonStyle}
        >
          Voltar
        </button>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div style={formContainerStyle}>
      <div style={formHeaderStyle}>
        <h2 style={formTitleStyle}>Entrar</h2>
        <p style={formSubtitleStyle}>Use sua wallet Stellar</p>
      </div>
      
      <div style={loginInfoStyle}>
        <Key size={32} style={{ color: '#6366f1' }} />
        <p>Sua carteira Stellar será usada para autenticação segura</p>
      </div>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      <button 
        onClick={handleLogin}
        disabled={isLoading}
        style={submitButtonStyle}
      >
        {isLoading ? (
          <span>Verificando assinatura...</span>
        ) : (
          <>
            <Star size={20} />
            Entrar com Stellar
          </>
        )}
      </button>
      
      <button 
        onClick={() => setStep('welcome')}
        style={cancelButtonStyle}
      >
        Voltar
      </button>
    </div>
  );

  // Render principal
  return (
    <div style={containerStyle}>
      {step === 'welcome' && renderWelcome()}
      {step === 'register' && renderRegister()}
      {step === 'login' && renderLogin()}
    </div>
  );
}

// ESTILOS (mesmos de antes)
const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem'
};

const welcomeContainerStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '3rem',
  maxWidth: '400px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
};

const headerStyle = {
  marginBottom: '2rem'
};

const titleStyle = {
  margin: '1rem 0 0.5rem 0',
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#1f2937'
};

const subtitleStyle = {
  margin: 0,
  color: '#6b7280',
  fontSize: '1rem'
};

const featuresStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem'
};

const featureStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.75rem',
  background: '#f8fafc',
  borderRadius: '8px'
};

const actionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '1rem'
};

const primaryButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  background: '#6366f1',
  color: '#ffffff',
  border: 'none',
  padding: '1rem 2rem',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const secondaryButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  background: '#e5e7eb',
  color: '#374151',
  border: 'none',
  padding: '1rem 2rem',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const backButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  background: 'transparent',
  color: '#6b7280',
  border: 'none',
  padding: '0.5rem',
  fontSize: '0.9rem',
  cursor: 'pointer'
};

const formContainerStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '2rem',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
};

const formHeaderStyle = {
  textAlign: 'center',
  marginBottom: '2rem'
};

const formTitleStyle = {
  margin: '0 0 0.5rem 0',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#1f2937'
};

const formSubtitleStyle = {
  margin: 0,
  color: '#6b7280'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
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

const iconStyle = {
  color: '#6b7280'
};

const inputStyle = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  outline: 'none',
  fontSize: '1rem'
};

const submitButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  background: '#6366f1',
  color: '#ffffff',
  border: 'none',
  padding: '1rem',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '1rem'
};

const cancelButtonStyle = {
  background: 'transparent',
  color: '#6b7280',
  border: 'none',
  padding: '0.75rem',
  borderRadius: '8px',
  cursor: 'pointer'
};

const loginInfoStyle = {
  textAlign: 'center',
  padding: '2rem 0',
  color: '#6b7280'
};

const errorStyle = {
  background: '#fef2f2',
  color: '#dc2626',
  padding: '0.75rem',
  borderRadius: '8px',
  fontSize: '0.9rem',
  border: '1px solid #fecaca'
};

const successStyle = {
  background: '#f0fdf4',
  color: '#16a34a',
  padding: '0.75rem',
  borderRadius: '8px',
  fontSize: '0.9rem',
  border: '1px solid #bbf7d0'
};

export default StellarLogin;