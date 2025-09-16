import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import apiService from './services/api'; // ✅ IMPORTAR API SERVICE
import { CreditCard, Loader, CheckCircle, X, User, Mail } from 'lucide-react';

// Carregar Stripe (use sua publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RpyOKRpwHfIvs6nO0uPJmcEmC9nsRtwHg2MaSXO8OrQ9D9PemzGOGUFe670iPxync5wPZko87Q5tuo84m6p2rlO00N3tWMNvS');

// Componente principal do checkout inline
function InlineCheckout({ product, onSuccess, onCancel, onCryptoCheckout }) {
  return (
    <Elements stripe={stripePromise}>
      <InlineCheckoutForm
        product={product}
        onSuccess={onSuccess}
        onCancel={onCancel}
        onCryptoCheckout={onCryptoCheckout} // ✅ NOVO
      />
    </Elements>
  );
}

// Formulário de checkout interno
function InlineCheckoutForm({ product, onSuccess, onCancel, onCryptoCheckout }) {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('info'); // 'info' -> 'payment' -> 'success'
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: ''
  });

  // Criar Payment Intent quando componente carrega
  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      console.log('🚀 Simulando criação de Payment Intent para:', product);

      // ✅ USAR API SERVICE - Simular criação de payment intent
      // Em produção seria integração real com Stripe
      await apiService.delay(800);
      
      const mockClientSecret = 'pi_' + Math.random().toString(36).substring(2, 16) + '_secret_' + Math.random().toString(36).substring(2, 16);
      setClientSecret(mockClientSecret);
      console.log('✅ Payment Intent simulado criado');

    } catch (err) {
      console.error('❌ Erro Payment Intent:', err);
      setError('Erro na conexão com servidor');
    }
  };

  const handleNextStep = () => {
    if (!userInfo.name || !userInfo.email) {
      setError('Por favor, preencha nome e email');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // ✅ USAR API SERVICE - Processar pagamento (simulado)
      console.log('💳 Processando pagamento com dados:', {
        product: product,
        userInfo: userInfo,
        amount: product.price
      });

      const paymentResult = await apiService.processPayment({
        product: product,
        userInfo: userInfo,
        amount: product.price,
        method: 'card'
      });

      if (paymentResult.success) {
        console.log('✅ Pagamento confirmado:', paymentResult.transactionId);
        
        onSuccess({
          ...paymentResult,
          product: product,
          userInfo: userInfo
        });
      } else {
        throw new Error(paymentResult.error || 'Erro no processamento');
      }

    } catch (err) {
      console.error('❌ Erro no pagamento:', err);
      setError(err.message || 'Erro inesperado no pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div style={checkoutContainerStyle}>
      {/* Header compacto */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={16} style={{ color: '#24bb8d' }} />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
            {product.name} - {formatCurrency(product.price)}
          </span>
        </div>
        <button onClick={onCancel} style={closeButtonStyle}>
          <X size={16} />
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div style={errorStyle}>
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Informações do usuário */}
      {step === 'info' && (
        <div style={stepStyle}>
          <div style={inputGroupStyle}>
            <div style={inputContainerStyle}>
              <User size={16} style={iconStyle} />
              <input
                type="text"
                placeholder="Seu nome completo"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={inputContainerStyle}>
              <Mail size={16} style={iconStyle} />
              <input
                type="email"
                placeholder="Seu email"
                value={userInfo.email}
                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>

          {/* ✅ GRUPO DE BOTÕES MODIFICADO */}
          <div style={buttonGroupStyle}>
            <button
              onClick={onCancel}
              style={secondaryButtonStyle}
            >
              Cancelar
            </button>
            <button
              onClick={() => onCryptoCheckout?.()}
              style={{ ...secondaryButtonStyle, flex: 0.8, borderColor: '#24bb8d', color: '#24bb8d' }}
            >
              🔗 Cripto
            </button>
            <button
              onClick={handleNextStep}
              style={{ ...primaryButtonStyle, flex: 1.2 }}
            >
              💳 Pagar com Cartão
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pagamento */}
      {step === 'payment' && (
        <div style={stepStyle}>
          <div style={cardElementContainerStyle}>
            <CardElement
              options={cardElementOptions}
              onChange={(event) => {
                if (event.error) {
                  setError(event.error.message);
                } else {
                  setError('');
                }
              }}
            />
          </div>

          <div style={buttonGroupStyle}>
            <button
              onClick={() => setStep('info')}
              style={secondaryButtonStyle}
              disabled={processing}
            >
              Voltar
            </button>
            <button
              onClick={handlePayment}
              disabled={!stripe || processing}
              style={{
                ...primaryButtonStyle,
                ...(processing ? processingButtonStyle : {})
              }}
            >
              {processing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Processando...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={14} />
                  Pagar {formatCurrency(product.price)}
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer compacto */}
      <div style={footerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckCircle size={12} style={{ color: '#24bb8d' }} />
          <span>Pagamento seguro</span>
        </div>
      </div>
    </div>
  );
}

// Configuração do CardElement
const cardElementOptions = {
  style: {
    base: {
      fontSize: '14px',
      color: '#374151',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

// Estilos compactos para inline
const checkoutContainerStyle = {
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
  marginTop: '0.75rem',
  maxWidth: '100%',
  fontSize: '0.9rem'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem',
  borderBottom: '1px solid #e9ecef',
  background: '#fdfdfd',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#666',
  padding: '0.25rem',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center'
};

const errorStyle = {
  color: '#ef4444',
  background: '#fef2f2',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8rem',
  borderBottom: '1px solid #e9ecef'
};

const stepStyle = {
  padding: '0.75rem'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginBottom: '0.75rem'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const iconStyle = {
  position: 'absolute',
  left: '0.75rem',
  color: '#9ca3af',
  zIndex: 1
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.5rem 0.5rem 2.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '0.9rem',
  fontFamily: 'inherit'
};

const cardElementContainerStyle = {
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  background: '#fdfdfd',
  marginBottom: '0.75rem'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '0.5rem'
};

const primaryButtonStyle = {
  flex: 1,
  padding: '0.5rem 1rem',
  background: 'linear-gradient(135deg, #24bb8d, #2bc1db)',
  color: '#fdfdfd',
  border: 'none',
  borderRadius: '4px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const secondaryButtonStyle = {
  flex: 1,
  padding: '0.5rem 1rem',
  background: '#f8f9fa',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '0.9rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const processingButtonStyle = {
  opacity: 0.7,
  cursor: 'not-allowed'
};

const footerStyle = {
  padding: '0.5rem 0.75rem',
  borderTop: '1px solid #e9ecef',
  background: '#fdfdfd',
  borderBottomLeftRadius: '8px',
  borderBottomRightRadius: '8px',
  fontSize: '0.8rem',
  color: '#666',
  display: 'flex',
  justifyContent: 'center'
};

export default InlineCheckout;