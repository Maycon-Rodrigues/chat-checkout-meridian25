import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Admin({ onBackToChat }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  console.log('🔧 Admin component loaded!');

  // Carregar lista de clientes
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    console.log('🔧 Carregando clientes...');
    try {
      const response = await axios.get('http://localhost:5000/api/admin/clients');
      console.log('🔧 Resposta clientes:', response.data);
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      alert('Erro ao carregar clientes: ' + error.message);
    }
  };

  // Carregar configuração de um cliente
  const loadClientConfig = async (clientId) => {
    console.log('🔧 Cliente clicado:', clientId);
    setLoading(true);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/clients/${clientId}`);
      console.log('🔧 Config carregada:', response.data);
      setConfig(response.data.client);
      setSelectedClient(clientId);
    } catch (error) {
      console.error('❌ Erro ao carregar config:', error);
      alert('Erro ao carregar configuração: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Salvar configuração
  const saveConfig = async () => {
    if (!config || !selectedClient) return;
    
    setSaving(true);
    try {
      await axios.post(`http://localhost:5000/api/admin/clients/${selectedClient}`, config);
      alert('✅ Configuração salva com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('❌ Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Voltar ao chat
  const goBackToChat = () => {
    if (onBackToChat) {
      onBackToChat();
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  };

  // Voltar para lista de clientes
  const goBackToList = () => {
    setSelectedClient(null);
    setConfig(null);
  };

  // Atualizar campo da configuração
  const updateField = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Atualizar campo aninhado
  const updateNestedField = (parent, field, value) => {
    setConfig(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Se carregando config
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Carregando configuração...</h2>
        <button onClick={goBackToList} style={buttonStyle}>
          ← Voltar
        </button>
      </div>
    );
  }

  // Se cliente selecionado, mostrar configuração
  if (selectedClient && config) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <button onClick={goBackToList} style={buttonStyle}>
            ← Voltar para Lista
          </button>
          <h2>Configurando: {config.branding?.companyName || selectedClient}</h2>
          <button onClick={saveConfig} disabled={saving} style={saveButtonStyle}>
            {saving ? 'Salvando...' : '💾 Salvar'}
          </button>
        </div>

        <div style={formStyle}>
          <div style={sectionStyle}>
            <h3>🏢 Informações da Empresa</h3>
            
            <div style={fieldStyle}>
              <label>Nome da Empresa:</label>
              <input
                type="text"
                value={config.branding?.companyName || ''}
                onChange={(e) => updateNestedField('branding', 'companyName', e.target.value)}
                style={inputStyle}
                placeholder="Nome da sua empresa"
              />
            </div>

            <div style={fieldStyle}>
              <label>Slogan/Tagline:</label>
              <input
                type="text"
                value={config.branding?.tagline || ''}
                onChange={(e) => updateNestedField('branding', 'tagline', e.target.value)}
                style={inputStyle}
                placeholder="Slogan da empresa"
              />
            </div>
          </div>

          <div style={sectionStyle}>
            <h3>🤖 Personalidade da IA</h3>
            
            <div style={fieldStyle}>
              <label>Tom de Voz:</label>
              <select
                value={config.aiPersonality?.tone || ''}
                onChange={(e) => updateNestedField('aiPersonality', 'tone', e.target.value)}
                style={inputStyle}
              >
                <option value="">Selecione um tom</option>
                <option value="Amigável e casual">Amigável e casual</option>
                <option value="Profissional e acolhedor">Profissional e acolhedor</option>
                <option value="Formal e respeitoso">Formal e respeitoso</option>
                <option value="Entusiasta e energético">Entusiasta e energético</option>
              </select>
            </div>

            <div style={fieldStyle}>
              <label>Estilo de Abordagem:</label>
              <textarea
                value={config.aiPersonality?.style || ''}
                onChange={(e) => updateNestedField('aiPersonality', 'style', e.target.value)}
                style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                placeholder="Como a IA deve abordar os clientes?"
              />
            </div>
          </div>

          <div style={sectionStyle}>
            <h3>🛍️ Produtos</h3>
            
            {config.products && config.products.length > 0 ? (
              config.products.map((product, index) => (
                <div key={index} style={productStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Produto {index + 1}</strong>
                    <label style={{ fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={product.active || false}
                        onChange={(e) => {
                          const newProducts = [...config.products];
                          newProducts[index].active = e.target.checked;
                          updateField('products', newProducts);
                        }}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Ativo
                    </label>
                  </div>
                  
                  <input
                    type="text"
                    value={product.name || ''}
                    onChange={(e) => {
                      const newProducts = [...config.products];
                      newProducts[index].name = e.target.value;
                      updateField('products', newProducts);
                    }}
                    placeholder="Nome do produto"
                    style={{ ...inputStyle, marginTop: '0.5rem' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="number"
                      value={product.price || ''}
                      onChange={(e) => {
                        const newProducts = [...config.products];
                        newProducts[index].price = parseInt(e.target.value) || 0;
                        updateField('products', newProducts);
                      }}
                      placeholder="Preço"
                      style={{ ...inputStyle, width: '30%' }}
                    />
                    <input
                      type="text"
                      value={product.description || ''}
                      onChange={(e) => {
                        const newProducts = [...config.products];
                        newProducts[index].description = e.target.value;
                        updateField('products', newProducts);
                      }}
                      placeholder="Descrição"
                      style={{ ...inputStyle, width: '70%' }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum produto configurado</p>
            )}
          </div>

          <div style={sectionStyle}>
            <h3>📋 Preview</h3>
            <div style={previewStyle}>
              <strong>Empresa:</strong> {config.branding?.companyName || 'N/A'}<br/>
              <strong>Tom:</strong> {config.aiPersonality?.tone || 'N/A'}<br/>
              <strong>Produtos ativos:</strong> {config.products?.filter(p => p.active).length || 0}<br/>
              <strong>Status:</strong> {config.active ? '✅ Ativo' : '❌ Inativo'}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={goBackToChat} style={chatButtonStyle}>
            🔙 Voltar ao Chat
          </button>
        </div>
      </div>
    );
  }

  // Lista de clientes (tela inicial)
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>⚙️ ChatCheckout Admin</h1>
        <p>Configure a IA para cada cliente</p>
        <button onClick={goBackToChat} style={buttonStyle}>
          🔙 Voltar ao Chat
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Carregando clientes...</p>
            <button onClick={loadClients} style={buttonStyle}>
              🔄 Recarregar
            </button>
          </div>
        ) : (
          <div>
            <h3>Clientes Disponíveis:</h3>
            {clients.map(client => (
              <div 
                key={client.clientId}
                onClick={() => loadClientConfig(client.clientId)}
                style={clientCardStyle}
              >
                <h4>{client.clientName}</h4>
                <p><strong>ID:</strong> {client.clientId}</p>
                <p><strong>Status:</strong> {client.active ? '✅ Ativo' : '❌ Inativo'}</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Clique para configurar
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos
const containerStyle = {
  padding: '2rem',
  maxWidth: '900px',
  margin: '0 auto',
  fontFamily: 'Arial, sans-serif'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
  paddingBottom: '1rem',
  borderBottom: '2px solid #e9ecef'
};

const buttonStyle = {
  background: '#6c757d',
  color: 'white',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  margin: '0.5rem'
};

const saveButtonStyle = {
  background: 'linear-gradient(135deg, #24bb8d, #2bc1db)',
  color: 'white',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  margin: '0.5rem'
};

const chatButtonStyle = {
  background: 'linear-gradient(135deg, #24bb8d, #2bc1db)',
  color: 'white',
  border: 'none',
  padding: '1rem 2rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1.1rem'
};

const clientCardStyle = {
  padding: '1.5rem',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  margin: '1rem 0',
  cursor: 'pointer',
  background: '#f8f9fa',
  transition: 'all 0.2s',
  ':hover': {
    borderColor: '#24bb8d'
  }
};

const formStyle = {
  display: 'grid',
  gap: '2rem'
};

const sectionStyle = {
  padding: '1.5rem',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  background: '#fdfdfd'
};

const fieldStyle = {
  marginBottom: '1rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '2px solid #e9ecef',
  borderRadius: '6px',
  fontSize: '1rem',
  marginTop: '0.5rem'
};

const productStyle = {
  padding: '1rem',
  border: '1px solid #ddd',
  borderRadius: '6px',
  marginBottom: '1rem',
  background: '#f9f9f9'
};

const previewStyle = {
  background: '#f8f9fa',
  padding: '1rem',
  borderRadius: '6px',
  border: '1px solid #e9ecef',
  lineHeight: '1.6'
};

export default Admin;