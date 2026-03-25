# 🛒 Ingrid Sol'an - Loja de Peças e Acessórios

Loja online completa para venda de peças de computador novas e usadas, com integração Mercado Pago para pagamentos reais.

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Pagamentos**: Mercado Pago
- **Banco**: Local (expansível para MongoDB/PostgreSQL)

## 📦 Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar ambiente
O arquivo `.env` já está configurado com suas credenciais. Verifique se está correto:

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-5761890001975225-032415-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-5e6c6ed7-eeab-427e-b1c5-...
```

### 3. Executar o servidor
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

O servidor iniciará em `http://localhost:3000`

## 🛍️ Funcionalidades

### ✅ Implementadas
- ✅ Catálogo de produtos (novos e usados)
- ✅ Carrinho de compras dinâmico
- ✅ Integração Mercado Pago completa
- ✅ Páginas de status (sucesso/erro/pendente)
- ✅ Webhook para notificações de pagamento
- ✅ Design responsivo (Kabum-inspired)
- ✅ WhatsApp integration

### 🔄 Próximas melhorias
- Banco de dados para pedidos
- Sistema de usuários
- Envio de emails automáticos
- Dashboard administrativo

## 💳 Pagamentos

### Formas aceitas:
- 💳 Cartão de crédito/débito
- 📱 PIX
- 📄 Boleto bancário

### Fluxo de pagamento:
1. Cliente adiciona produtos ao carrinho
2. Clica "Finalizar Compra"
3. Sistema cria preferência no Mercado Pago
4. Redirecionamento automático para checkout
5. Cliente paga e volta para página de sucesso

## 🔧 Configuração Mercado Pago

### Credenciais necessárias:
1. **Public Key**: Para inicialização do SDK
2. **Access Token**: Para criar preferências
3. **Client ID/Secret**: Para webhooks avançados

### URLs de retorno:
- **Sucesso**: `/sucesso.html`
- **Erro**: `/erro.html`
- **Pendente**: `/pendente.html`
- **Webhook**: `/webhook`

## 📁 Estrutura do Projeto

```
├── index.html              # Página inicial
├── index.js                # Lógica frontend
├── style.css               # Estilos CSS
├── server.js               # Servidor backend
├── package.json            # Dependências
├── .env                    # Configurações (credenciais)
├── sucesso.html            # Página pós-pagamento
├── erro.html              # Página erro pagamento
├── pendente.html          # Página pagamento pendente
├── pecas-novas.html       # Página peças novas
├── pecas-usadas.html      # Página peças usadas
├── servicos.html          # Página serviços
└── contato.html           # Página contato
```

## 🌐 Deploy em Produção

### 1. Configurar domínio
Atualize as URLs no `.env`:
```env
BASE_URL=https://ingridsolan.com.br
SUCCESS_URL=https://ingridsolan.com.br/sucesso.html
WEBHOOK_URL=https://ingridsolan.com.br/webhook
```

### 2. Configurar webhook no Mercado Pago
- Acesse seu painel do MP
- Vá em "Configurações" → "Notificações"
- Adicione a URL: `https://ingridsolan.com.br/webhook`

### 3. Hospedagem recomendada
- **Vercel**: Fácil deploy, gratuito
- **Railway**: Node.js otimizado
- **Heroku**: Clássico e confiável

## 📞 Suporte

**Ingrid Sol'an**
- WhatsApp: +55 27 99699-0894
- Email: contato@ingridsolan.com.br

## 📋 Licença

MIT - Use livremente para seu negócio! 🚀