import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI
from chromadb.utils import embedding_functions
import time
from datetime import datetime

# Carrega as variáveis de ambiente
load_dotenv()


class ChatRAG:
    def __init__(self):
        """Inicializa o sistema de chat RAG"""
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

        # Configuração do embedding
        self.openai_ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=self.openai_api_key, model_name="text-embedding-3-small"
        )

        # Inicializa o cliente Chroma
        # self.chroma_client = chromadb.PersistentClient(path="chroma_persistent_storage")
        self.chroma_client = chromadb.CloudClient(
            api_key=os.getenv("CHROMADB_API_KEY"),
            tenant=os.getenv("CHROMADB_TENANT_ID"),
            database=os.getenv("CHROMADB"),
        )
        self.collection_name = "texto_gerado"
        self.collection = self.chroma_client.get_or_create_collection(
            name=self.collection_name, embedding_function=self.openai_ef
        )

        # Configuração da pasta de documentos
        self.docs_path = "docs"  # Pasta onde estão os arquivos .txt para treinamento

        # Cliente OpenAI
        self.client = OpenAI(api_key=self.openai_api_key)

        # Histórico da conversa
        self.conversation_history = []

        # Verifica se a pasta docs existe
        self.verificar_pasta_docs()

        print("Sistema de Chat RAG inicializado com sucesso!")
        print("Base de conhecimento carregada com documentos otimizados")
        print(f"Pasta de documentos: {self.docs_path}/")
        print(
            "💬 Chat pronto para conversas sobre objeções de vendas e produto 'Menos Café Mais Chá'"
        )
        print("-" * 60)

    def verificar_pasta_docs(self):
        """Verifica se a pasta docs existe e mostra informações"""
        if os.path.exists(self.docs_path):
            arquivos = [f for f in os.listdir(self.docs_path) if f.endswith(".txt")]
            print(
                f"✅ Pasta {self.docs_path}/ encontrada com {len(arquivos)} arquivos .txt"
            )
            for arquivo in arquivos:
                print(f"   📄 {arquivo}")
        else:
            print(f"❌ Pasta {self.docs_path}/ não encontrada!")
            print("🔧 Execute 'python rag.py' primeiro para processar os documentos")

    def query_documents(self, question, n_results=3):
        """Busca documentos relevantes na base de conhecimento"""
        try:
            results = self.collection.query(query_texts=question, n_results=n_results)
            relevant_chunks = [
                doc for sublist in results["documents"] for doc in sublist
            ]
            return relevant_chunks
        except Exception as e:
            print(f"❌ Erro ao buscar documentos: {e}")
            return []

    def generate_response(self, question, relevant_chunks):
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
            for msg in self.conversation_history[-6:]:
                messages.append(msg)

            # Adiciona a pergunta atual
            messages.append({"role": "user", "content": question})

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Modelo mais econômico
                messages=messages,
                temperature=0.1,
                max_tokens=500,
            )

            return response.choices[0].message.content

        except Exception as e:
            return f"Erro ao gerar resposta: {e}"

    def process_question(self, question):
        """Processa uma pergunta e retorna a resposta"""
        print(f"\n Buscando informações relevantes...")

        # Busca documentos relevantes
        relevant_chunks = self.query_documents(question)

        if not relevant_chunks:
            return "Não encontrei informações relevantes para sua pergunta. Tente reformular ou perguntar sobre objeções de vendas ou o produto 'Menos Café Mais Chá'."

        # Gera resposta
        response = self.generate_response(question, relevant_chunks)

        # Adiciona ao histórico
        self.conversation_history.append({"role": "user", "content": question})
        self.conversation_history.append({"role": "assistant", "content": response})

        return response

    def start_chat(self):
        """Inicia o chat interativo"""
        print("\n" + "=" * 60)
        print("🎯 CHAT DE VENDAS - MENOS CAFÉ MAIS CHÁ")
        print("=" * 60)
        print("💡 Dicas de uso:")
        print("   • Faça perguntas sobre objeções de vendas")
        print("   • Pergunte sobre o produto 'Menos Café Mais Chá'")
        print("   • Digite 'sair' para encerrar")
        print("   • Digite 'limpar' para limpar o histórico")
        print("   • Digite 'ajuda' para ver exemplos de perguntas")
        print("-" * 60)

        while True:
            try:
                # Input do usuário
                user_input = input("\n👤 Você: ").strip()

                # Comandos especiais
                if user_input.lower() in ["sair", "exit", "quit"]:
                    print("\n Obrigado por usar o chat! Até logo!")
                    break

                elif user_input.lower() in ["limpar", "clear"]:
                    self.conversation_history = []
                    print("\n Histórico da conversa limpo!")
                    continue

                elif user_input.lower() in ["ajuda", "help"]:
                    self.show_help()
                    continue

                elif not user_input:
                    print("Por favor, digite uma pergunta.")
                    continue

                # Processa a pergunta
                print("\n⏳ Processando sua pergunta...")
                response = self.process_question(user_input)

                # Exibe a resposta
                print(f"\n🤖 Assistente: {response}")

            except KeyboardInterrupt:
                print("\n\n👋 Chat encerrado pelo usuário. Até logo!")
                break
            except Exception as e:
                print(f"\n❌ Erro inesperado: {e}")
                print("🔄 Tente novamente ou digite 'sair' para encerrar.")

    def show_help(self):
        """Mostra exemplos de perguntas"""
        print("\n" + "=" * 50)
        print("📋 EXEMPLOS DE PERGUNTAS")
        print("=" * 50)
        print("\n🎯 SOBRE OBJEÇÕES DE VENDAS:")
        print("   • 'E se não funcionar comigo?'")
        print("   • 'Está muito caro para um curso online'")
        print("   • 'Não tenho tempo para fazer o curso'")
        print("   • 'Como sei se o conteúdo é bom?'")
        print("   • 'E se não conseguir aprender?'")

        print("\n☕ SOBRE O PRODUTO 'MENOS CAFÉ MAIS CHÁ':")
        print("   • 'Como funciona o método de 21 dias?'")
        print("   • 'Quais são os benefícios do chá?'")
        print("   • 'Como preparar o chá corretamente?'")
        print("   • 'Quais chás são recomendados?'")
        print("   • 'E se eu não conseguir largar o café?'")

        print("\n🛒 SOBRE CHECKOUT:")
        print("   • 'E se não chegar?'")
        print("   • 'Como sei que é original?'")
        print("   • 'Frete muito caro'")
        print("   • 'Não tenho limite no cartão'")

        print(
            "\n💡 DICA: Seja específico em suas perguntas para respostas mais precisas!"
        )


def main():
    """Função principal"""
    try:
        # Inicializa o chat
        chat = ChatRAG()

        # Inicia o chat interativo
        chat.start_chat()

    except Exception as e:
        print(f"❌ Erro ao inicializar o sistema: {e}")
        print("🔧 Verifique se:")
        print("   • O arquivo .env está configurado com OPENAI_API_KEY")
        print("   • Os documentos estão na pasta docs/")
        print("   • O ChromaDB foi inicializado corretamente")


if __name__ == "__main__":
    main()
