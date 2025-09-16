"""
Configuração da mensagem de boas-vindas do chat web
"""

def get_mensagem_boas_vindas():
    """
    Retorna a mensagem de boas-vindas personalizada
    Modifique esta função para alterar a mensagem inicial do chat
    """
    return {
        "role": "assistant",
        "content": """👋 Olá! Bem-vindo ao Chat de Vendas do **Menos Café Mais Chá**! 

Sou seu assistente especializado em resolver objeções e ajudar você a descobrir como nosso produto pode transformar sua relação com o café! ☕➡️🍃

**Como posso te ajudar hoje?**\n
🎯 Resolver objeções sobre o produto\n
☕ Explicar os benefícios do método de 21 dias\n
🛒 Ajudar com dúvidas de checkout\n
💡 Fornecer informações sobre chás especiais\n

**Exemplos de perguntas:**
• "E se não funcionar comigo?"
• "Como funciona o método de 21 dias?"
• "Quais são os benefícios do chá?"

Estou aqui para te ajudar a fazer a melhor escolha para sua saúde e bem-estar! 💚"""
    }

# Exemplo de mensagem alternativa (descomente para usar)
def get_mensagem_boas_vindas_alternativa():
    """
    Exemplo de mensagem alternativa mais direta
    """
    return {
        "role": "assistant",
        "content": """☕ **Menos Café Mais Chá** - Chat de Vendas

Olá! Sou seu assistente de vendas especializado em ajudar você a descobrir como reduzir o consumo de café e descobrir os benefícios dos chás especiais.

**O que você gostaria de saber?**
• Como funciona nosso método de 21 dias
• Benefícios dos chás especiais
• Resolver objeções sobre o produto
• Informações sobre checkout

Digite sua pergunta abaixo! 🚀"""
    }

# Exemplo de mensagem focada em vendas (descomente para usar)
def get_mensagem_boas_vindas_vendas():
    """
    Exemplo de mensagem focada em vendas
    """
    return {
        "role": "assistant",
        "content": """🎯 **Chat de Vendas - Menos Café Mais Chá**

Olá! Sou seu consultor de vendas especializado em ajudar você a fazer a melhor escolha para sua saúde.

**Nosso produto oferece:**
✅ Método científico de 21 dias
✅ Redução gradual do café
✅ Chás especiais com sabores robustos
✅ Suporte de Sommeliers certificadas

**Tire suas dúvidas agora:**
• "E se não funcionar comigo?"
• "Como funciona o método?"
• "Quais os benefícios?"

Vamos conversar! 💬"""
    }
