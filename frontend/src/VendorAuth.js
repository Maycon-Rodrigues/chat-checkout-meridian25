import React, { useState, useEffect } from 'react';
import apiService from './services/api'; // ✅ IMPORTAR API SERVICE
import logo from './Logo.png'; // ✅ IMPORTAR O LOGO

function VendorAuth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    company: '',
    cpf: '', // ✅ ADICIONADO CAMPO CPF
    email: '',
    password: ''
  });

  useEffect(() => {
    checkExistingSession();
  }, [onLoginSuccess]);

  const checkExistingSession = async () => {
    try {
      const session = apiService.getCurrentSession();
      if (session && session.session_token) {
        const result = await apiService.verifySession(session.session_token);
        if (result.success && result.vendor) {
          onLoginSuccess(result.vendor, session.session_token);
        } else {
          apiService.logout();
        }
      }
    } catch (error) {
      console.log('Nenhuma sessão ativa');
      apiService.logout();
    }
  };

  const handleRegister = async () => {
    setIsLoading(true); 
    setError('');
    
    try {
      // ✅ ATUALIZADA VALIDAÇÃO
      if (!form.name || !form.company || !form.cpf || !form.email || !form.password) {
        throw new Error('Preencha todos os campos');
      }

      // ✅ ENVIAR CPF PARA O API SERVICE
      const result = await apiService.vendorRegister(
        form.name,
        form.company, 
        form.email,
        form.password,
        form.cpf // ✅ NOVO PARÂMETRO
      );

      if (!result.success) {
        throw new Error(result.error || 'Falha no cadastro');
      }

      alert('✅ Conta criada! Faça login.');
      setMode('login');
      // ✅ LIMPAR FORMULÁRIO
      setForm({ name: '', company: '', cpf: '', email: '', password: '' });

    } catch (err) {
      setError(err.message || 'Erro no cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true); 
    setError('');
    
    try {
      if (!form.email || !form.password) {
        throw new Error('Informe email e senha');
      }

      const result = await apiService.vendorLogin(form.email, form.password);

      if (!result.success) {
        throw new Error(result.error || 'Login inválido');
      }

      onLoginSuccess(result.vendor, result.sessionToken);

    } catch (err) {
      setError(err.message || 'Erro no login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        {/* ✅ LOGO ADICIONADO */}
        <img src={logo} alt="ChatCheckout Logo" style={logoStyle} />

        <h1 style={title}>Acesso do Vendedor</h1>
        <p style={subtitle}>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta de parceiro'}</p>

        {error && <div style={errorBox}>{error}</div>}

        {mode === 'register' && (
          <>
            <input style={input} placeholder="Nome completo" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input style={input} placeholder="Empresa" value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            {/* ✅ CAMPO CPF ADICIONADO AO FORMULÁRIO */}
            <input style={input} placeholder="CPF" value={form.cpf}
              onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} />
          </>
        )}

        <input style={input} placeholder="Email" type="email" value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <input style={input} placeholder="Senha" type="password" value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

        <div style={actions}>
          {mode === 'login' ? (
            <>
              <button style={primaryBtn} disabled={isLoading} onClick={handleLogin}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
              <button style={linkBtn} onClick={() => setMode('register')}>Criar conta</button>
            </>
          ) : (
            <>
              <button style={primaryBtn} disabled={isLoading} onClick={handleRegister}>
                {isLoading ? 'Criando...' : 'Criar conta'}
              </button>
              <button style={linkBtn} onClick={() => setMode('login')}>Já tenho conta</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ NOVOS ESTILOS
const logoStyle = {
  width: '220px',
  marginBottom: '16px',
  alignSelf: 'center'
};

// ESTILOS (com ajustes)
const container = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fb' };
const card = { 
  width: 360, 
  background: '#fff', 
  padding: '32px', 
  borderRadius: 12, 
  boxShadow: '0 10px B30px rgba(0,0,0,0.08)',
  display: 'flex', // Para centralizar o logo
  flexDirection: 'column' // Para centralizar o logo
};
const title = { 
  fontSize: 20, 
  fontWeight: 700, 
  marginBottom: 8,
  textAlign: 'center', // Centralizar texto
  color: '#374151'
};
const subtitle = { 
  fontSize: 14, 
  color: '#6b7280', 
  marginBottom: 24,
  textAlign: 'center' // Centralizar texto
};
const input = { width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 12, boxSizing: 'border-box' };
const actions = { display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 };
const primaryBtn = { 
  flex: 1, // Para ocupar mais espaço
  padding: '12px 14px', 
  borderRadius: 10, 
  border: 'none', 
  background: '#00A87E', // ✅ COR ALINHADA COM O LOGO
  color: '#fff', 
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '15px'
};
const linkBtn = { background: 'transparent', color: '#374151', border: 'none', cursor: 'pointer', padding: 8 };
const errorBox = { background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: 10, marginBottom: 16, textAlign: 'center' };

export default VendorAuth;
