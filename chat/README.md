# Chat RAG - Sistema de Vendas Inteligente

Sistema de chat interativo especializado em resolver objeções de vendas e fornecer informações sobre o produto "Menos Café Mais Chá".

## 🚀 Funcionalidades

- **Chat Interativo**: Conversas contínuas como ChatGPT
- **RAG Avançado**: Busca inteligente na base de conhecimento
- **Especializado em Vendas**: Focado em objeções e conversão
- **Interface Web**: Versão Streamlit para melhor experiência
- **Histórico de Conversa**: Mantém contexto das conversas

## 📁 Arquivos Criados

### 1. `chat_interativo.py` - Chat no Terminal
- Chat interativo via linha de comando
- Ideal para testes rápidos
- Comandos especiais (sair, limpar, ajuda)

### 2. `chat_web.py` - Chat Web (Streamlit)
- Interface web moderna e intuitiva
- Sidebar com exemplos e informações
- Melhor experiência visual

### 3. `requirements_chat.txt` - Dependências
- Lista de pacotes necessários
- Versões específicas para compatibilidade

## 🛠️ Instalação

### 1. Instalar Dependências
```bash
pip install -r requirements_chat.txt
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na pasta `IA/` com:
```
OPENAI_API_KEY=sua_chave_openai_aqui
```

### 3. Verificar Base de Conhecimento
Certifique-se de que os arquivos otimizados estão na pasta `docs/`:
- `Objeçoes_Checkout_OTIMIZADO.txt`
- `Objeçoes_Específicas_OTIMIZADO.txt`
- `menos_cafe_OTIMIZADO.txt`

## 🎯 Como Usar

### Chat no Terminal
```bash
python chat_interativo.py
```

**Comandos especiais:**
- `sair` - Encerra o chat
- `limpar` - Limpa o histórico
- `ajuda` - Mostra exemplos de perguntas

### Chat Web (Recomendado)
```bash
streamlit run chat_web.py
```

Acesse: `http://localhost:8501`

## 💡 Exemplos de Perguntas

### 🎯 Objeções de Vendas
- "E se não funcionar comigo?"
- "Está muito caro para um curso online"
- "Não tenho tempo para fazer o curso"
- "Como sei se o conteúdo é bom?"
- "E se eu não conseguir aprender?"

### ☕ Sobre o Produto
- "Como funciona o método de 21 dias?"
- "Quais são os benefícios do chá?"
- "Como preparar o chá corretamente?"
- "Quais chás são recomendados?"
- "E se eu não conseguir largar o café?"

### 🛒 Checkout
- "E se não chegar?"
- "Como sei que é original?"
- "Frete muito caro"
- "Não tenho limite no cartão"

## 🔧 Configurações Avançadas

### Ajustar Número de Resultados
No arquivo `chat_interativo.py`, linha 104:
```python
def query_documents(self, question, n_results=3):  
```

### Alterar Modelo OpenAI
No arquivo `chat_interativo.py`, linha 129:
```python
model="gpt-4o-mini",  # Mude o modelo aqui
```

### Ajustar Temperatura
No arquivo `chat_interativo.py`, linha 130:
```python
temperature=0.7,  # Mude a criatividade aqui (0.0 a 1.0)
```

## 🎨 Personalização

### Modificar Prompt do Sistema
Edite a variável `system_prompt` nos arquivos para personalizar:
- Tom da conversa
- Objetivos específicos
- Estilo de resposta

### Adicionar Novos Documentos
1. Adicione arquivos `.txt` na pasta `docs/`
2. Execute `rag.py` para reprocessar
3. Reinicie o chat

## 🚨 Solução de Problemas

### Erro: "OPENAI_API_KEY not found"
- Verifique se o arquivo `.env` existe
- Confirme se a chave está correta

### Erro: "Collection not found"
- Execute `rag.py` primeiro para criar a base
- Verifique se os documentos estão na pasta `docs/`

### Respostas genéricas
- Aumente `n_results` na função `query_documents`
- Verifique se os documentos estão otimizados
- Teste com perguntas mais específicas

## 📊 Monitoramento

### Logs de Conversa
O sistema mantém histórico das conversas para:
- Análise de performance
- Melhoria contínua
- Identificação de gaps

### Métricas Importantes
- Tempo de resposta
- Relevância das respostas
- Taxa de conversão
- Satisfação do usuário

## 🔄 Atualizações

### Reprocessar Base de Conhecimento
```bash
python rag.py
```

### Atualizar Dependências
```bash
pip install -r requirements_chat.txt --upgrade
```

---

**🎯 Objetivo**: Converter mais clientes através de respostas inteligentes e personalizadas!

**💡 Dica**: Use perguntas específicas para obter respostas mais precisas e relevantes.
