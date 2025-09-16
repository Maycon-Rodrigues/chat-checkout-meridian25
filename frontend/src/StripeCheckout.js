import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { CreditCard, Smartphone, Loader, CheckCircle, AlertCircle } from 'lucide-react';

// Carregar Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Componente principal do checkout
function StripeCheckout({ product, onSuccess, onCancel }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        product={product} 
        onSuccess={onSuccess} 
        onCancel={onCancel} 
      />
    </Elements>
  );
}

// Formulário de checkout interno
function CheckoutForm({ product, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
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
      console.log('🚀 Criando Payment Intent para:', product);
      
      const response = await axios.post('http://localhost:5000/api/payments/create', {
        amount: product.price,
        currency: 'brl'
      });

      if (response.data.success) {
        setClientSecret(response.data.payment.clientSecret);
        console.log('✅ Payment Intent criado');
      } else {
        setError('Erro ao preparar pagamento');
      }
    } catch (err) {
      console.error('❌ Erro Payment Intent:', err);
      setError('Erro na conexão com servidor');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    if (!userInfo.name || !userInfo.email) {
      setError('Por favor, preencha nome e email');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirmar pagamento com Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: userInfo.name,
            email: userInfo.email,
          },
        },
      });

      if (error) {
        console.error('❌ Erro Stripe:', error);
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ Pagamento confirmado:', paymentIntent.id);
        
        // Processar no backend (conversão + Stellar)
        const backendResponse = await axios.post('http://localhost:5000/api/payments/process', {
          amount: product.price,
          paymentMethod: 'card',
          product: product,
          stripePaymentIntentId: paymentIntent.id,
          userInfo: userInfo
        });

        if (backendResponse.data.success) {
          onSuccess({
            ...backendResponse.data,
            stripePaymentIntent: paymentIntent
          });
        } else {
          setError('Erro no processamento backend');
        }
      }
    } catch (err) {
      console.error('❌ Erro no pagamento:', err);
      setError('Erro inesperado no pagamento');
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
      {/* Header */}
      <div style={headerStyle}>
        <h3>💳 Finalizar Compra</h3>
        <button onClick={onCancel} style={closeButtonStyle}>✕</button>
      </div>

      {/* Produto */}
      <div style={productInfoStyle}>
        <h4>{product.name}</h4>
        <p style={{ color: '#666', margin: '0.5rem 0', fontSize: '0.9rem' }}>
          {product.description}
        </p>
        <div style={{ 
          fontSize: '1.3rem', 
          fontWeight: 'bold', 
          color: '#24bb8d',
          textAlign: 'center',
          margin: '1rem 0'
        }}>
          {formatCurrency(product.price)}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div style={errorStyle}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Dados do cliente */}
        <div style={sectionStyle}>
          <h4>📋 Seus Dados</h4>
          <input
            type="text"
            placeholder="Seu nome completo"
            value={userInfo.name}
            onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
            style={inputStyle}
            required
          />
          <input
            type="email"
            placeholder="Seu email"
            value={userInfo.email}
            onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
            style={inputStyle}
            required
          />
        </div>

        {/* Método de pagamento */}
        <div style={sectionStyle}>
          <h4>💳 Método de Pagamento</h4>
          <div style={paymentMethodsStyle}>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              style={{
                ...paymentButtonStyle,
                ...(paymentMethod === 'card' ? activePaymentStyle : {})
              }}
            >
              <CreditCard size={20} />
              <div>
                <div>Cartão de Crédito</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Visa, Mastercard</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('pix')}
              style={{
                ...paymentButtonStyle,
                ...(paymentMethod === 'pix' ? activePaymentStyle : {})
              }}
            >
              <Smartphone size={20} />
              <div>
                <div>PIX</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Em breve</div>
              </div>
            </button>
          </div>
        </div>

        {/* Stripe Card Element */}
        {paymentMethod === 'card' && (
          <div style={sectionStyle}>
            <h4>💳 Dados do Cartão</h4>
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
          </div>
        )}

        {/* PIX Placeholder */}
        {paymentMethod === 'pix' && (
          <div style={sectionStyle}>
            <div style={pixPlaceholderStyle}>
              <Smartphone size={32} style={{ color: '#24bb8d' }} />
              <p>PIX será implementado em breve!</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                Por enquanto, use cartão de crédito para testar.
              </p>
            </div>
          </div>
        )}

        {/* Botão de pagamento */}
        <button
          type="submit"
          disabled={!stripe || processing || paymentMethod === 'pix'}
          style={{
            ...payButtonStyle,
            ...(processing ? processingButtonStyle : {}),
            ...(paymentMethod === 'pix' ? disabledButtonStyle : {})
          }}
        >
          {processing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Processando...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {paymentMethod === 'pix' ? (
                <>
                  <Smartphone size={16} />
                  PIX em breve
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Pagar {formatCurrency(product.price)}
                </>
              )}
            </div>
          )}
        </button>
      </form>

      {/* Footer */}
      <div style={footerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={14} style={{ color: '#24bb8d' }} />
          <span>Pagamento seguro via Stripe</span>
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Conversão automática para USDC
        </div>
      </div>
    </div>
  );
}

// Configuração do CardElement
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
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

// Estilos
const checkoutContainerStyle = {
  background: '#fdfdfd',
  borderRadius: '12px',
  padding: '1.5rem',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e9ecef',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid #e9ecef'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.2rem',
  cursor: 'pointer',
  color: '#666',
  padding: '0.25rem'
};

const productInfoStyle = {
  textAlign: 'center',
  marginBottom: '1.5rem',
  padding: '1rem',
  background: '#f8f9fa',
  borderRadius: '8px'
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#ef4444',
  background: '#fef2f2',
  padding: '0.75rem',
  borderRadius: '6px',
  marginBottom: '1rem',
  fontSize: '0.9rem'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const inputStyle = {
  padding: '0.75rem',
  border: '2px solid #e9ecef',
  borderRadius: '6px',
  fontSize: '1rem',
  fontFamily: 'inherit'
};

const paymentMethodsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem'
};

const paymentButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  background: '#fdfdfd',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '0.9rem'
};

const activePaymentStyle = {
  borderColor: '#24bb8d',
  background: 'rgba(36, 187, 141, 0.05)'
};

const cardElementContainerStyle = {
  padding: '1rem',
  border: '2px solid #e9ecef',
  borderRadius: '6px',
  background: '#fdfdfd'
};

const pixPlaceholderStyle = {
  textAlign: 'center',
  padding: '2rem',
  color: '#666',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '2px dashed #d1d5db'
};

const payButtonStyle = {
  width: '100%',
  padding: '1rem',
  background: 'linear-gradient(135deg, #24bb8d, #2bc1db)',
  color: '#fdfdfd',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const processingButtonStyle = {
  opacity: 0.7,
  cursor: 'not-allowed'
};

const disabledButtonStyle = {
  opacity: 0.5,
  cursor: 'not-allowed',
  background: '#9ca3af'
};

const footerStyle = {
  marginTop: '1.5rem',
  paddingTop: '1rem',
  borderTop: '1px solid #e9ecef',
  textAlign: 'center',
  fontSize: '0.9rem',
  color: '#666'
};

export default StripeCheckout;