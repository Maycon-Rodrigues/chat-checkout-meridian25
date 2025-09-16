# AGENTS.md - Development Guidelines for Chat Checkout Meridian25

## Build/Lint/Test Commands
- **Install dependencies**: `pip install -r requirements_chat.txt`
- **Run interactive terminal chat**: `python chat_interativo.py`
- **Run web chat interface**: `streamlit run chat_web.py`
- **Setup RAG knowledge base**: `python rag.py`
- **Test single script**: `python <script_name>.py`

## Code Style Guidelines
- **Language**: Python 3.7+
- **Import order**: Standard libraries, third-party (OpenAI, ChromaDB, Streamlit), local modules
- **String formatting**: Use f-strings for string formatting
- **Documentation**: Comprehensive docstrings for all functions and classes
- **Error handling**: Try-except blocks with meaningful error messages and user feedback

## Environment Setup
- **Required environment variables**: OPENAI_API_KEY, CHROMADB_API_KEY, CHROMADB_TENANT_ID, CHROMADB
- **Environment file**: `.env` file in project root
- **Dependencies**: Use `python-dotenv` for environment variable loading

## Naming Conventions
- **Classes**: PascalCase (e.g., `ChatRAG`, `ChatRAGWeb`)
- **Functions/methods**: snake_case (e.g., `query_documents`, `generate_response`)
- **Variables**: snake_case (e.g., `conversation_history`, `relevant_chunks`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `OPENAI_API_KEY`)

## Project Structure
- **chat_interativo.py**: Terminal-based chat interface
- **chat_web.py**: Streamlit web interface
- **rag.py**: RAG knowledge base setup and document processing
- **mensagem_boas_vindas.py**: Welcome message configuration
- **docs/**: Knowledge base documents (.txt files)