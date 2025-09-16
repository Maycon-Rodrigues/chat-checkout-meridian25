import React from 'react';
import { CheckCircle, Star, Copy, ExternalLink, DollarSign } from 'lucide-react';

function PaymentSuccess({ paymentData, onClose }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('📋 Copiado para a área de transferência!');
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
        {/* Success Header */}
        <div style={headerStyle}>
          <div style={successIconStyle}>
            <CheckCircle size={48} style={{ color: '#10b981' }} />
          </div>
          <h2 style={titleStyle}>Pagamento Aprovado!</h2>
          <p style={subtitleStyle}>
            Transação processada via Stellar Blockchain ⭐
          </p>
        </div>

        {/* Transaction Details */}
        <div style={detailsStyle}>
          <h3 style={sectionTitleStyle}>📋 Detalhes da Transação</h3>
          
          <div style={detailItemStyle}>
            <span style={labelStyle}>ID da Transação:</span>
            <div style={valueWithCopyStyle}>
              <span style={valueStyle}>{paymentData.transactionId}</span>
              <button 
                onClick={() => copyToClipboard(paymentData.transactionId)}
                style={copyButtonStyle}
                title="Copiar ID"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div style={detailItemStyle}>
            <span style={labelStyle}>Produto:</span>
            <span style={valueStyle}>{paymentData.product?.name}</span>
          </div>

          <div style={detailItemStyle}>
            <span style={labelStyle}>Valor Total:</span>
            <span style={{...valueStyle, color: '#24bb8d', fontWeight: 'bold'}}>
              {formatCurrency(paymentData.amount)}
            </span>
          </div>

          <div style={detailItemStyle}>
            <span style={labelStyle}>Método:</span>
            <span style={valueStyle}>
              {paymentData.method === 'pix' ? '📱 PIX' : '💳 Cartão de Crédito'}
            </span>
          </div>
        </div>

        {/* Stellar Details */}
        {paymentData.stellar && (
          <div style={stellarDetailsStyle}>
            <h3 style={sectionTitleStyle}>⭐ Detalhes Stellar</h3>
            
            <div style={conversionInfoStyle}>
              <Star size={20} style={{ color: '#ffd700' }} />
              <div>
                <div style={conversionTitleStyle}>Conversão Blockchain</div>
                <div style={conversionValueStyle}>
                  {formatCurrency(paymentData.amount)} → USDC
                </div>
              </div>
            </div>

            <div style={feesBreakdownStyle}>
              <h4 style={feesHeaderStyle}>💰 Breakdown de Taxas:</h4>
              {paymentData.stellar.fees && Object.entries(paymentData.stellar.fees).map(([key, value]) => (
                <div key={key} style={feeItemStyle}>
                  <span>{key}:</span>
                  <span style={feeValueStyle}>{value}</span>
                </div>
              ))}
            </div>

            <div style={vendorAmountStyle}>
              <DollarSign size={20} style={{ color: '#10b981' }} />
              <div>
                <div style={vendorLabelStyle}>Valor líquido para o vendedor:</div>
                <div style={vendorValueStyle}>{paymentData.stellar.vendorAmount}</div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div style={nextStepsStyle}>
          <h3 style={sectionTitleStyle}>🚀 Próximos Passos</h3>
          <ul style={stepListStyle}>
            <li>✅ Pagamento confirmado na blockchain</li>
            <li>📧 Recibo enviado por email</li>
            <li>🚚 Produto será processado em breve</li>
            <li>⭐ Obrigado por usar Stellar!</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={actionsStyle}>
          <button
            onClick={() => copyToClipboard(JSON.stringify(paymentData, null, 2))}
            style={secondaryButtonStyle}
          >
            📋 Copiar Detalhes
          </button>
          
          <button
            onClick={onClose}
            style={primaryButtonStyle}
          >
            🎉 Fechar
          </button>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <Star size={16} style={{ color: '#ffd700' }} />
          <span>Obrigado por escolher pagamentos via Stellar Blockchain!</span>
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
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.3s ease-in-out'
};

const modalStyle = {
  backgroundColor: '#fdfdfd',
  borderRadius: '16px',
  padding: '2rem',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
  animation: 'modalSlideIn 0.4s ease-out'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
  paddingBottom: '1.5rem',
  borderBottom: '2px solid #e9ecef'
};

const successIconStyle = {
  marginBottom: '1rem',
  animation: 'checkmark 0.6s ease-in-out'
};

const titleStyle = {
  color: '#10b981',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  margin: '0 0 0.5rem 0'
};

const subtitleStyle = {
  color: '#6b7280',
  fontSize: '1rem',
  margin: 0
};

const detailsStyle = {
  marginBottom: '1.5rem',
  padding: '1rem',
  background: '#f8f9fa',
  borderRadius: '12px',
  border: '1px solid #e9ecef'
};

const sectionTitleStyle = {
  color: '#374151',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const detailItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.75rem',
  padding: '0.5rem 0'
};

const labelStyle = {
  color: '#6b7280',
  fontSize: '0.9rem',
  fontWeight: '500'
};

const valueStyle = {
  color: '#374151',
  fontSize: '0.9rem',
  fontWeight: 'bold'
};

const valueWithCopyStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const copyButtonStyle = {
  background: 'none',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  padding: '0.25rem',
  cursor: 'pointer',
  color: '#6b7280',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s ease'
};

const stellarDetailsStyle = {
  marginBottom: '1.5rem',
  padding: '1rem',
  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
  borderRadius: '12px',
  border: '1px solid #bae6fd'
};

const conversionInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem',
  background: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '8px',
  marginBottom: '1rem'
};

const conversionTitleStyle = {
  fontSize: '0.9rem',
  color: '#6b7280',
  fontWeight: '500'
};

const conversionValueStyle = {
  fontSize: '1rem',
  color: '#374151',
  fontWeight: 'bold'
};

const feesBreakdownStyle = {
  marginBottom: '1rem'
};

const feesHeaderStyle = {
  fontSize: '0.95rem',
  color: '#374151',
  marginBottom: '0.5rem'
};

const feeItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.25rem 0.5rem',
  fontSize: '0.85rem',
  borderRadius: '4px',
  transition: 'all 0.2s ease'
};

const feeValueStyle = {
  fontWeight: 'bold',
  color: '#24bb8d'
};

const vendorAmountStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem',
  background: 'rgba(16, 185, 129, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(16, 185, 129, 0.2)'
};

const vendorLabelStyle = {
  fontSize: '0.9rem',
  color: '#6b7280',
  fontWeight: '500'
};

const vendorValueStyle = {
  fontSize: '1.1rem',
  color: '#10b981',
  fontWeight: 'bold'
};

const nextStepsStyle = {
  marginBottom: '1.5rem',
  padding: '1rem',
  background: '#f8f9fa',
  borderRadius: '12px',
  border: '1px solid #e9ecef'
};

const stepListStyle = {
  margin: 0,
  paddingLeft: '1rem',
  color: '#374151'
};

const actionsStyle = {
  display: 'flex',
  gap: '0.75rem',
  marginBottom: '1rem'
};

const primaryButtonStyle = {
  flex: 1,
  padding: '0.75rem 1.5rem',
  background: 'linear-gradient(135deg, #10b981, #059669)',
  color: '#fdfdfd',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const secondaryButtonStyle = {
  flex: 1,
  padding: '0.75rem 1.5rem',
  background: '#f8f9fa',
  color: '#374151',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem',
  color: '#6b7280',
  fontStyle: 'italic',
  paddingTop: '1rem',
  borderTop: '1px solid #e9ecef'
};

export default PaymentSuccess;