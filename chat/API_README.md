# Chat RAG API

Uma API Flask para interagir com o sistema de chat RAG especializado em vendas do produto "Menos Café Mais Chá".

## Configuração

### 1. Instalar Dependências

```bash
pip install -r requirements_api.txt
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# OpenAI API
OPENAI_API_KEY=sua_chave_openai_aqui

# ChromaDB
CHROMADB_API_KEY=sua_chave_chromadb
CHROMADB_TENANT_ID=seu_tenant_id
CHROMADB=seu_database_name

# API Security
API_KEY=sua_chave_api_secreta_123

# Flask (opcional)
FLASK_DEBUG=False
PORT=5000
```

### 3. Processar Base de Conhecimento

Antes de usar a API, execute o script RAG para processar os documentos:

```bash
python rag.py
```

## Executar a API

### Desenvolvimento
```bash
python api_chat.py
```

### Produção (com Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 api_chat:app
```

## Endpoints

### 1. Health Check
```http
GET /health
```

**Resposta:**
```json
{
  "status": "healthy",
  "service": "Chat RAG API",
  "chat_rag_loaded": true
}
```

### 2. Enviar Mensagem para Chat
```http
POST /chat
Content-Type: application/json
Authorization: Bearer sua_chave_api
```

**Body:**
```json
{
  "message": "E se não funcionar comigo?"
}
```

**Resposta:**
```json
{
  "response": "Entendo sua preocupação! 😊 É natural ter essa dúvida...",
  "status": "success"
}
```

### 3. Limpar Histórico
```http
POST /chat/clear
Authorization: Bearer sua_chave_api
```

**Resposta:**
```json
{
  "message": "Histórico da conversa limpo com sucesso",
  "status": "success"
}
```

### 4. Obter Histórico
```http
GET /chat/history
Authorization: Bearer sua_chave_api
```

**Resposta:**
```json
{
  "history": [
    {"role": "user", "content": "E se não funcionar comigo?"},
    {"role": "assistant", "content": "Resposta do assistente..."}
  ],
  "total_messages": 2,
  "status": "success"
}
```

## Autenticação

A API usa autenticação por chave de API. Você pode incluir a chave de três formas:

### 1. Header Authorization (Recomendado)
```http
Authorization: Bearer sua_chave_api
```

### 2. Query Parameter
```http
POST /chat?api_key=sua_chave_api
```

### 3. JSON Body
```json
{
  "api_key": "sua_chave_api",
  "message": "Sua mensagem aqui"
}
```

## Exemplo de Uso em Python

```python
import requests

url = "http://localhost:5000/chat"
headers = {
    "Authorization": "Bearer sua_chave_api",
    "Content-Type": "application/json"
}
data = {
    "message": "Como funciona o método de 21 dias?"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()

print(result["response"])
```

## Exemplo de Uso em JavaScript

```javascript
const response = await fetch('http://localhost:5000/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sua_chave_api',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'E se não conseguir largar o café?'
  })
});

const result = await response.json();
console.log(result.response);
```

## Códigos de Erro

- **400** - Bad Request: Payload inválido ou campo obrigatório ausente
- **401** - Unauthorized: Chave de API inválida ou ausente
- **404** - Not Found: Endpoint não encontrado
- **500** - Internal Server Error: Erro interno do servidor

## Logs

A API registra automaticamente:
- Tentativas de acesso não autorizado
- Mensagens processadas (primeiros 50 caracteres)
- Erros e exceções
- Operações de limpeza de histórico

## Segurança

- ✅ Autenticação obrigatória por chave de API
- ✅ Logs de segurança para monitoramento
- ✅ Validação de entrada de dados
- ✅ Tratamento seguro de erros
- ✅ Rate limiting (configure no servidor web se necessário)

## Monitoramento

Use o endpoint `/health` para verificar o status da API e se o sistema ChatRAG está carregado corretamente.