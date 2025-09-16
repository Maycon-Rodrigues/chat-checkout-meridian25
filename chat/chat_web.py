import streamlit as st
import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI
from chromadb.utils import embedding_functions
import time
from mensagem_boas_vindas import get_mensagem_boas_vindas

# Carrega as variáveis de ambiente
load_dotenv()

class ChatRAGWeb:
    def __init__(self):
        """Inicializa o sistema de chat RAG para web"""
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        # Configuração do embedding
        self.openai_ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=self.openai_api_key,
            model_name="text-embedding-3-small"
        )
        
        # Inicializa o cliente Chroma
        self.chroma_client = chromadb.PersistentClient(path="chroma_persistent_storage")
        self.collection_name = "texto_gerado"
        self.collection = self.chroma_client.get_or_create_collection(
            name=self.collection_name, embedding_function=self.openai_ef
        )
        
        # Configuração da pasta de documentos
        self.docs_path = "docs"  # Pasta onde estão os arquivos .txt para treinamento
        
        # Cliente OpenAI
        self.client = OpenAI(api_key=self.openai_api_key)
        
        # Verifica se a pasta docs existe
        self.verificar_pasta_docs()

    def get_mensagem_boas_vindas(self):
        """Retorna a mensagem de boas-vindas configurada"""
        return get_mensagem_boas_vindas()

    def verificar_pasta_docs(self):
        """Verifica se a pasta docs existe e mostra informações"""
        if os.path.exists(self.docs_path):
            arquivos = [f for f in os.listdir(self.docs_path) if f.endswith('.txt')]
            print(f"✅ Pasta {self.docs_path}/ encontrada com {len(arquivos)} arquivos .txt")
            for arquivo in arquivos:
                print(f"   📄 {arquivo}")
        else:
            print(f"❌ Pasta {self.docs_path}/ não encontrada!")
            print("🔧 Execute 'python rag.py' primeiro para processar os documentos")

    def query_documents(self, question, n_results=3):
        """Busca documentos relevantes na base de conhecimento"""
        try:
            results = self.collection.query(query_texts=question, n_results=n_results)
            relevant_chunks = [doc for sublist in results["documents"] for doc in sublist]
            return relevant_chunks
        except Exception as e:
            st.error(f"Erro ao buscar documentos: {e}")
            return []

    def generate_response(self, question, relevant_chunks, conversation_history):
        """Gera resposta usando OpenAI com contexto RAG"""
        try:
            context = "\n\n".join(relevant_chunks)
            
            # Prompt otimizado para vendas
            system_prompt = (
                "Você é um assistente de vendas especializado em resolver objeções e vender. "
                "Seu principal objetivo é vender o produto 'Menos Café Mais Chá'"
                "Use as informações do contexto para responder de forma empática, persuasiva e profissional. "
                "Use um tom conversacional, acolhedor e use emojis quando apropriado. "
                "Se não souber a resposta baseada no contexto, diga que não tem essa informação específica. "
                "Não diga tudo o que é possível encontrar no produto, dê alguns detalhes mas não todos"
                "Sempre faça uma chamanda para a venda, o objetivo é fazer o cliente comprar o produto e não simplesmente responder perguntas"
                "Não fale de desconto"
                "Sempre foque nos benefícios e na solução que o produto oferece.\n\n"
                f"Contexto:\n{context}\n\n"
            )
            
            # Adiciona histórico da conversa para contexto
            messages = [{"role": "system", "content": system_prompt}]
            
            # Adiciona últimas 6 mensagens do histórico (3 perguntas + 3 respostas)
            for msg in conversation_history[-6:]:
                messages.append(msg)
            
            # Adiciona a pergunta atual
            messages.append({"role": "user", "content": question})
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"❌ Erro ao gerar resposta: {e}"

def main():
    """Função principal do Streamlit"""
    st.set_page_config(
        page_title="Chat de Vendas - Menos Café Mais Chá",
        page_icon="☕",
        layout="wide"
    )
    
    # Título e descrição
    st.title("☕ Chat de Vendas - Menos Café Mais Chá")
    st.markdown("---")
    
    # Sidebar com informações
    with st.sidebar:
        st.header("📋 Sobre o Chat")
        st.markdown("""
        Este chat é especializado em:
        - 🎯 Resolver objeções de vendas
        - ☕ Informações sobre o produto
        - 🛒 Ajuda no checkout
        - 💡 Dicas de conversão
        """)
        
        st.header("💡 Exemplos de Perguntas")
        st.markdown("""
        **Objeções:**
        - "E se não funcionar comigo?"
        - "Está muito caro"
        - "Não tenho tempo"
        
        **Produto:**
        - "Como funciona o método?"
        - "Quais os benefícios?"
        - "Como preparar o chá?"
        """)
        
        if st.button("🧹 Limpar Chat"):
            st.session_state.messages = []
            # Adiciona mensagem de boas-vindas novamente
            st.session_state.messages.append(st.session_state.chat_rag.get_mensagem_boas_vindas())
            st.rerun()
    
    # Inicializa o chat RAG
    if "chat_rag" not in st.session_state:
        with st.spinner("🤖 Inicializando sistema..."):
            st.session_state.chat_rag = ChatRAGWeb()
    
    # Inicializa o histórico de mensagens
    if "messages" not in st.session_state:
        st.session_state.messages = []
        
        # Adiciona a mensagem de boas-vindas ao histórico
        st.session_state.messages.append(st.session_state.chat_rag.get_mensagem_boas_vindas())
    
    # Exibe o histórico de mensagens
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Input do usuário
    if prompt := st.chat_input("Digite sua pergunta sobre objeções ou o produto..."):
        # Adiciona a mensagem do usuário
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Gera resposta
        with st.chat_message("assistant"):
            with st.spinner("🔍 Buscando informações..."):
                # Busca documentos relevantes
                relevant_chunks = st.session_state.chat_rag.query_documents(prompt)
                
                if not relevant_chunks:
                    response = "❌ Não encontrei informações relevantes para sua pergunta. Tente reformular ou perguntar sobre objeções de vendas ou o produto 'Menos Café Mais Chá'."
                else:
                    # Gera resposta
                    response = st.session_state.chat_rag.generate_response(
                        prompt, relevant_chunks, st.session_state.messages
                    )
            
            st.markdown(response)
        
        # Adiciona a resposta ao histórico
        st.session_state.messages.append({"role": "assistant", "content": response})

if __name__ == "__main__":
    main()
