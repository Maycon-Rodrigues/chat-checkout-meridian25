import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI
from chromadb.utils import embedding_functions

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=openai_api_key, model_name="text-embedding-3-small"
)

chroma_client = chromadb.CloudClient(
    api_key=os.getenv("CHROMADB_API_KEY"),
    tenant=os.getenv("CHROMADB_TENANT_ID"),
    database=os.getenv("CHROMADB"),
)

# Initialize the Chroma client with persistence
# chroma_client = chromadb.PersistentClient(path="chroma_persistent_storage")
collection_name = "texto_gerado"
collection = chroma_client.get_or_create_collection(
    name=collection_name, embedding_function=openai_ef
)

client = OpenAI(api_key=openai_api_key)

"""
Modelo de Pergunta ao Chat

resp = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": "Detalhe todas as contribuições de Einstein",
        },
    ],
)

print(resp.choices[0].message.content)

"""


# Função que carrega os documentos do diretório
def carregar_documentos(directory_path):
    print("==== Loading documents from directory ====")
    documents = []
    for filename in os.listdir(directory_path):
        if filename.endswith(".txt"):
            with open(
                os.path.join(directory_path, filename), "r", encoding="utf-8"
            ) as file:
                documents.append({"id": filename, "text": file.read()})
    return documents


# Function que divide o texto em chunks
def split_text(text, chunk_size=1000, chunk_overlap=20):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - chunk_overlap
    return chunks


# Carrega os documentos
base_dir = os.path.dirname(os.path.abspath(__file__))
directory_path = os.path.join(base_dir, "docs")
if not os.path.isdir(directory_path):
    raise FileNotFoundError(f"Pasta 'docs' não encontrada em: {directory_path}")
documents = carregar_documentos(directory_path)

print(f"Loaded {len(documents)} documents")


# Split documents into chunks
chunked_documents = []
for doc in documents:
    chunks = split_text(doc["text"])
    for i, chunk in enumerate(chunks):
        chunked_documents.append({"id": f"{doc['id']}_chunk{i + 1}", "text": chunk})

# print(f"O documento foi dividido em {len(chunked_documents)} chunks")


# Function to generate embeddings using OpenAI API
def get_openai_embedding(text):
    response = client.embeddings.create(input=text, model="text-embedding-3-small")
    embedding = response.data[0].embedding
    return embedding


# Generate embeddings for the document chunks
for doc in chunked_documents:
    doc["embedding"] = get_openai_embedding(doc["text"])

# print(doc["embedding"])

# Upsert documents with embeddings into Chroma
for doc in chunked_documents:
    collection.upsert(
        ids=[doc["id"]], documents=[doc["text"]], embeddings=[doc["embedding"]]
    )


# Function to query documents
def query_documents(question, n_results=2):
    # query_embedding = get_openai_embedding(question)
    results = collection.query(query_texts=question, n_results=n_results)

    # Extract the relevant chunks
    relevant_chunks = [doc for sublist in results["documents"] for doc in sublist]
    return relevant_chunks

    # for idx, document in enumerate(results["documents"][0]):
    #     doc_id = results["ids"][0][idx]
    #     distance = results["distances"][0][idx]
    #     print(f"Found document chunk: {document} (ID: {doc_id}, Distance: {distance})")


# Function to generate a response from OpenAI
def generate_response(question, relevant_chunks):
    context = "\n\n".join(relevant_chunks)
    prompt = (
        "Você é um assistente de vendas e tem a função de tirar as dúvidas dos clientes e converter em vendas, use o modelo"
        " de objeções que o informamos e ajude o cliente a chegar até a venda, seu objetivo é vender. Se você não souber a resposta, diga que não saiba"
        "\n\nContext:\n" + context + "\n\nQuestion:\n" + question
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": prompt,
            },
            {
                "role": "user",
                "content": question,
            },
        ],
    )

    answer = response.choices[0].message
    return answer


question = "A empresa é confiável?"
relevant_chunks = query_documents(question)
answer = generate_response(question, relevant_chunks)
print(answer.content)
