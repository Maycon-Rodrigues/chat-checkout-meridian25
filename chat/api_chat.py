import os
from flask import Flask, request, jsonify, abort
from functools import wraps
from dotenv import load_dotenv
import logging

# Importa a classe ChatRAG do arquivo existente
from chat_interativo import ChatRAG

# Carrega as variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurações da API
API_KEY = os.getenv("API_KEY", "sua_chave_api_aqui")
app = Flask(__name__)

# Instância global do ChatRAG (inicializada uma vez)
chat_rag_instance = None


def require_api_key(f):
    """Decorator para exigir chave de API em todas as requisições"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Verifica se a chave está no header Authorization ou query parameter
        api_key = request.headers.get('Authorization')
        if api_key and api_key.startswith('Bearer '):
            api_key = api_key.replace('Bearer ', '')
        else:
            api_key = request.args.get('api_key') or request.json.get('api_key') if request.json else None
        
        if not api_key or api_key != API_KEY:
            logger.warning(f"Tentativa de acesso não autorizado de {request.remote_addr}")
            abort(401, description="Chave de API inválida ou ausente")
        
        return f(*args, **kwargs)
    return decorated_function


def init_chat_rag():
    """Inicializa a instância do ChatRAG"""
    global chat_rag_instance
    try:
        chat_rag_instance = ChatRAG()
        logger.info("Sistema ChatRAG inicializado com sucesso")
        return True
    except Exception as e:
        logger.error(f"Erro ao inicializar ChatRAG: {e}")
        return False


@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de verificação de saúde da API"""
    return jsonify({
        "status": "healthy",
        "service": "Chat RAG API",
        "chat_rag_loaded": chat_rag_instance is not None
    })


@app.route('/chat', methods=['POST'])
@require_api_key
def chat():
    """Endpoint principal para interagir com o chat"""
    try:
        # Verifica se o ChatRAG foi inicializado
        if chat_rag_instance is None:
            return jsonify({
                "error": "Sistema ChatRAG não inicializado"
            }), 500
        
        # Valida o payload
        if not request.json:
            return jsonify({
                "error": "Payload JSON é obrigatório"
            }), 400
        
        message = request.json.get('message', '').strip()
        if not message:
            return jsonify({
                "error": "Campo 'message' é obrigatório e não pode estar vazio"
            }), 400
        
        # Processa a mensagem usando o ChatRAG
        logger.info(f"Processando mensagem: {message[:50]}...")
        response = chat_rag_instance.process_question(message)
        
        # Log da resposta para monitoramento
        logger.info(f"Resposta gerada com sucesso para pergunta: {message[:30]}...")
        
        return jsonify({
            "response": response,
            "status": "success"
        })
    
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {e}")
        return jsonify({
            "error": "Erro interno do servidor",
            "details": str(e)
        }), 500


@app.route('/chat/clear', methods=['POST'])
@require_api_key
def clear_history():
    """Limpa o histórico da conversa"""
    try:
        if chat_rag_instance is None:
            return jsonify({
                "error": "Sistema ChatRAG não inicializado"
            }), 500
        
        chat_rag_instance.conversation_history = []
        logger.info("Histórico da conversa limpo")
        
        return jsonify({
            "message": "Histórico da conversa limpo com sucesso",
            "status": "success"
        })
    
    except Exception as e:
        logger.error(f"Erro ao limpar histórico: {e}")
        return jsonify({
            "error": "Erro interno do servidor",
            "details": str(e)
        }), 500


@app.route('/chat/history', methods=['GET'])
@require_api_key
def get_history():
    """Retorna o histórico da conversa atual"""
    try:
        if chat_rag_instance is None:
            return jsonify({
                "error": "Sistema ChatRAG não inicializado"
            }), 500
        
        return jsonify({
            "history": chat_rag_instance.conversation_history,
            "total_messages": len(chat_rag_instance.conversation_history),
            "status": "success"
        })
    
    except Exception as e:
        logger.error(f"Erro ao obter histórico: {e}")
        return jsonify({
            "error": "Erro interno do servidor",
            "details": str(e)
        }), 500


@app.errorhandler(401)
def unauthorized(error):
    """Handler personalizado para erro 401"""
    return jsonify({
        "error": "Não autorizado",
        "message": "Chave de API inválida ou ausente",
        "hint": "Inclua a chave no header Authorization como 'Bearer sua_chave' ou no parâmetro 'api_key'"
    }), 401


@app.errorhandler(404)
def not_found(error):
    """Handler personalizado para erro 404"""
    return jsonify({
        "error": "Endpoint não encontrado",
        "available_endpoints": [
            "GET /health",
            "POST /chat",
            "POST /chat/clear",
            "GET /chat/history"
        ]
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handler personalizado para erro 500"""
    return jsonify({
        "error": "Erro interno do servidor",
        "message": "Ocorreu um erro inesperado. Tente novamente mais tarde."
    }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 INICIANDO API CHAT RAG")
    print("=" * 60)
    
    # Valida se a chave de API foi definida
    if API_KEY == "sua_chave_api_aqui":
        print("❌ AVISO: Defina a variável API_KEY no arquivo .env!")
        print("   Exemplo: API_KEY=minha_chave_secreta_123")
    else:
        print(f"✅ Chave de API configurada: {API_KEY[:10]}...")
    
    # Inicializa o ChatRAG
    print("\n📚 Inicializando sistema ChatRAG...")
    if init_chat_rag():
        print("✅ Sistema ChatRAG carregado com sucesso!")
    else:
        print("❌ Falha ao carregar ChatRAG. Verifique as configurações.")
    
    print("\n🔗 Endpoints disponíveis:")
    print("   GET  /health           - Verificação de saúde")
    print("   POST /chat             - Enviar mensagem")
    print("   POST /chat/clear       - Limpar histórico")
    print("   GET  /chat/history     - Obter histórico")
    
    print(f"\n🔑 Autenticação: Inclua a chave de API:")
    print("   • Header: Authorization: Bearer sua_chave")
    print("   • Query: ?api_key=sua_chave")
    print("   • JSON: {\"api_key\": \"sua_chave\", \"message\": \"...\"}")
    
    print("\n" + "=" * 60)
    
    # Inicia o servidor Flask
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    )