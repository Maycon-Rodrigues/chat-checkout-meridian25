import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, CreditCard, Smartphone, Star, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

function StellarPayment({ product, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [amount, setAmount] = useState(product?.price || 100);
  const [fees, setFees] = useState(null);
  const [conversion, setConversion] = useState(null);
  const [stellarStatus, setStellarStatus] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Carregar status do Stellar e calcular fees
  useEffect(() => {
    loadStellarData();
  }, [amount, paymentMethod]);

  const loadStellarData = async () => {
    try {
      // Status da rede Stellar
      const statusResponse = await axios.get('http://localhost:5000/api/stellar/status');
      setStellarStatus(statusResponse.data.stellar);

      // Calcular fees
      const feesResponse = await axios.post('http://localhost:5000/api/stellar/calculate-fees', {
        amount: amount,
        paymentMethod: paymentMethod
      });
      setFees(feesResponse.data.fees);

      // Conversão para USDC
      const conversionResponse = await axios.post('http://localhost:5000/api/stellar/convert-currency', {
        amount: amount
      });
      setConversion(conversionResponse.data.conversion);

    } catch (error) {
      console.error('❌ Erro ao carregar dados Stellar:', error);
    }
  };

  const handlePayment = async () => {
    if (!userInfo.name || !userInfo.email) {
      alert('Por favor, preencha nome e email!');
      return;
    }

    setProcessing(true);

    try {
      // Processar pagamento com Stellar
      const response = await axios.post('http://localhost:5000/api/payment', {
        method: paymentMethod,
        amount: amount,
        userInfo: userInfo,
        product: product,
        clientId: 'demo-empresa'
      });

      if (response.data.success) {
        onSuccess({
          ...response.data,
          stellar: response.data.stellar
        });
      } else {
        alert('❌ ' + response.data.message);
      }

    } catch (error) {
      console.error('❌ Erro no pagamento:', error);
      alert('Erro no pagamento: ' + error.message);
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
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={20} style={{ color: '#24bb8d' }} />
            <h2>Checkout Blockchain</h2>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        {/* Status Stellar */}
        {stellarStatus && (
          <div style={stellarStatusStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {stellarStatus.online ? (
                <CheckCircle size={16} style={{ color: '#10b981' }} />
              ) : (
                <AlertCircle size={16} style={{ color: '#ef4444' }} />
              )}
              <span style={{ fontSize: '0.9rem' }}>
                Stellar {stellarStatus.network}: {stellarStatus.online ? 'Online' : 'Offline'}
              </span>
            </div>
            {stellarStatus.latestLedger && (
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                Ledger: {stellarStatus.latestLedger}
              </span>
            )}
          </div>
        )}

        {/* Produto */}
        <div style={productStyle}>
          <h3>{product?.name || 'Produto'}</h3>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            {product?.description || 'Descrição do produto'}
          </p>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#24bb8d' }}>
            {formatCurrency(amount)}
          </div>
        </div>

        {/* Dados do Cliente */}
        <div style={sectionStyle}>
          <h4>📋 Seus Dados</h4>
          <div style={inputGroupStyle}>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Seu email"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="tel"
              placeholder="Seu telefone (opcional)"
              value={userInfo.phone}
              onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Método de Pagamento */}
        <div style={sectionStyle}>
          <h4>💳 Método de Pagamento</h4>
          <div style={paymentMethodsStyle}>
            <button
              onClick={() => setPaymentMethod('pix')}
              style={{
                ...paymentButtonStyle,
                ...(paymentMethod === 'pix' ? activePaymentStyle : {})
              }}
            >
              <Smartphone size={20} />
              <div>
                <div>PIX</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Aprovação instantânea</div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('credit_card')}
              style={{
                ...paymentButtonStyle,
                ...(paymentMethod === 'credit_card' ? activePaymentStyle : {})
              }}
            >
              <CreditCard size={20} />
              <div>
                <div>Cartão</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Até 12x sem juros</div>
              </div>
            </button>
          </div>
        </div>

        {/* Breakdown de Custos */}
        {fees && conversion && (
          <div style={sectionStyle}>
            <h4>💰 Detalhamento Financeiro</h4>
            
            {/* Conversão */}
            <div style={conversionStyle}>
              <TrendingUp size={16} style={{ color: '#24bb8d' }} />
              <span>
                {formatCurrency(conversion.brlAmount)} = {conversion.usdcAmount} USDC
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                (Taxa: R$ {conversion.exchangeRate})
              </span>
            </div>

            {/* Fees */}
            <div style={feesBreakdownStyle}>
              {Object.entries(fees.breakdown).map(([key, value]) => (
                <div key={key} style={feeItemStyle}>
                  <span>{key}:</span>
                  <span style={{ fontWeight: 'bold' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={totalFeeStyle}>
              <span>Taxa Total: {fees.totalFeePercentage}%</span>
              <span style={{ color: '#24bb8d', fontWeight: 'bold' }}>
                Pagamento via Blockchain ⭐
              </span>
            </div>
          </div>
        )}

        {/* Botão de Pagamento */}
        <button
          onClick={handlePayment}
          disabled={processing || !userInfo.name || !userInfo.email}
          style={{
            ...payButtonStyle,
            ...(processing ? processingButtonStyle : {})
          }}
        >
          {processing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={spinnerStyle}></div>
              Processando pagamento...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} />
              Pagar {formatCurrency(amount)} via Stellar
            </div>
          )}
        </button>

        {/* Footer */}
        <div style={footerStyle}>
          <Star size={14} style={{ color: '#24bb8d' }} />
          <span>Pagamento seguro via Stellar Blockchain</span>
        </div>
      </div>
    </div>
  );
}

// Estilos
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: '#fdfdfd',
  borderRadius: '12px',
  padding: '1.5rem',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  paddingBottom: '1rem',
  borderBottom: '2px solid #e9ecef'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#666'
};

const stellarStatusStyle = {
  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
  padding: '0.75rem',
  borderRadius: '8px',
  marginBottom: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid #bae6fd'
};

const productStyle = {
  textAlign: 'center',
  padding: '1rem',
  background: '#f8f9fa',
  borderRadius: '8px',
  marginBottom: '1.5rem'
};

const sectionStyle = {
  marginBottom: '1.5rem'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  marginTop: '0.5rem'
};

const inputStyle = {
  padding: '0.75rem',
  border: '2px solid #e9ecef',
  borderRadius: '6px',
  fontSize: '1rem'
};

const paymentMethodsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
  marginTop: '0.5rem'
};

const paymentButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '1rem',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  background: '#fdfdfd',
  cursor: 'pointer',
  textAlign: 'left'
};

const activePaymentStyle = {
  borderColor: '#24bb8d',
  background: 'rgba(36, 187, 141, 0.05)'
};

const conversionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem',
  background: '#f0f9ff',
  borderRadius: '6px',
  marginBottom: '0.75rem'
};

const feesBreakdownStyle = {
  background: '#f8f9fa',
  padding: '1rem',
  borderRadius: '6px',
  marginBottom: '0.5rem'
};

const feeItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '0.5rem'
};

const totalFeeStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 'bold',
  padding: '0.5rem 0',
  borderTop: '1px solid #e9ecef'
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
  marginBottom: '1rem'
};

const processingButtonStyle = {
  opacity: 0.7,
  cursor: 'not-allowed'
};

const spinnerStyle = {
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid #fdfdfd',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem',
  color: '#666',
  fontStyle: 'italic'
};

export default StellarPayment;