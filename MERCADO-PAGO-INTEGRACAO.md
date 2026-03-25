# 🛒 Integração Mercado Pago - Guia Completo

## ✅ O que foi feito

O arquivo `index.js` foi atualizado com:
- ✅ Função `criarPreferenciaMercadoPago()` para processar compras
- ✅ Botão "Finalizar Compra" agora integra com Mercado Pago
- ✅ Preparação dos dados do carrinho no formato esperado pelo MP

---

## 📋 Passo 1: Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/
2. Clique em **Vender** → Crie sua conta vendedor
3. Complete o cadastro (dados pessoais, dados bancários)
4. **Aguarde aprovação** (pode levar 1-2 dias)

---

## 🔑 Passo 2: Obter suas Credenciais

1. Acesse seu **Painel do Mercado Pago**
2. Vá em: **Configurações** → **Credenciais**
3. Você verá:
   - **Public Key** (começa com `APP_USR-`)
   - **Access Token** (começa com `APP_USR-` também)

**Exemplo:**
```
Public Key: APP_USR-1234567890abcdef1234567890abcdef
Access Token: APP_USR-token-muito-longo-aqui-segredo
```

---

## 💻 Passo 3: Backend Simplificado (Node.js + Express)

Como seu site é estático, você precisa de um **backend simples** para:
1. Receber dados do carrinho
2. Criar preferência no Mercado Pago
3. Retornar link de pagamento

### Criar arquivo: `servidor-pagamento.js`

```javascript
const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Configurar Mercado Pago com seu Access Token
mercadopago.configure({
  access_token: 'APP_USR-SEU-ACCESS-TOKEN-AQUI' // ⚠️ Substituir com seu token
});

// 📍 Rota para criar preferência de pagamento
app.post('/criar-preferencia', async (req, res) => {
  try {
    const { items, email } = req.body;

    // Calcular total
    const total = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

    const preferencia = {
      items: items,
      payer: {
        email: email || 'cliente@email.com'
      },
      back_urls: {
        success: 'https://seu-dominio.com.br/sucesso',
        failure: 'https://seu-dominio.com.br/erro',
        pending: 'https://seu-dominio.com.br/pendente'
      },
      auto_return: 'approved',
      notification_url: 'https://seu-dominio.com.br/webhook-mp'
    };

    // Criar preferência no Mercado Pago
    const resposta = await mercadopago.preferences.create(preferencia);

    res.json({
      success: true,
      init_point: resposta.body.init_point, // Link para pagamento
      id: resposta.body.id
    });

  } catch (erro) {
    console.error('❌ Erro ao criar preferência:', erro);
    res.json({ success: false, erro: erro.message });
  }
});

// 🔔 Rota para receber notificação do Mercado Pago (webhook)
app.post('/webhook-mp', async (req, res) => {
  try {
    const { id, topic } = req.query;

    if (topic === 'payment') {
      const payment = await mercadopago.payment.findById(id);
      console.log('💰 Pagamento recebido:', payment.body.status);
      
      // Aqui você atualiza seu banco de dados de pedidos
      // Se status === 'approved', pode entregar o produto/serviço
    }

    res.sendStatus(200);
  } catch (erro) {
    console.error('❌ Erro no webhook:', erro);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log('🚀 Servidor rodando em http://localhost:3000'));
```

### Instalar dependências:
```bash
npm install express cors mercadopago
```

### Executar:
```bash
node servidor-pagamento.js
```

---

## 🔗 Passo 4: Atualizar index.js com Backend Real

Altere a função `criarPreferenciaMercadoPago()` em `index.js`:

```javascript
async function criarPreferenciaMercadoPago() {
  if (carrinho.length === 0) {
    alert('❌ Carrinho vazio!');
    return;
  }

  const items = carrinho.map((item, idx) => ({
    title: item.nome,
    quantity: 1,
    unit_price: item.preco,
    id: idx
  }));

  try {
    // 📤 Enviar para seu backend
    const res = await fetch('http://localhost:3000/criar-preferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items,
        email: prompt('Digite seu email:') || 'cliente@email.com'
      })
    });

    const dados = await res.json();

    if (dados.success) {
      // ✅ Redirecionar para Mercado Pago
      window.location.href = dados.init_point;
      carrinho.length = 0; // Limpar carrinho após começar pagamento
    } else {
      alert('❌ Erro ao processar pagamento: ' + dados.erro);
    }
  } catch (erro) {
    alert('❌ Erro de conexão: ' + erro.message);
  }
}
```

---

## 🌐 Passo 5: Fazer Deploy do Backend

### Opção 1: **Heroku** (Simples)
```bash
npm install -g heroku-cli
heroku login
heroku create seu-app-mp
git push heroku main
```

### Opção 2: **Replit** (Muito Simples)
1. Vá para https://replit.com
2. Crie novo projeto Node.js
3. Cole o código `servidor-pagamento.js`
4. Clique "Run"
5. Copie a URL do seu Replit

### Opção 3: **Seu Servidor** (VPS/Cloud)
- Use VPS da HostGator/AWS/DigitalOcean
- Instale Node.js e PM2 (para manter sempre ativo)

---

## 🔒 Passo 6: Atualizar Links no Código

Após fazer deploy do backend, mude:

**De:**
```javascript
const res = await fetch('http://localhost:3000/criar-preferencia', {
```

**Para:**
```javascript
const res = await fetch('https://seu-app-heroku.herokuapp.com/criar-preferencia', {
// OU
const res = await fetch('https://seu-replit.replit.dev/criar-preferencia', {
```

---

## 🧪 Passo 7: Testar com Cartão de Teste

Mercado Pago fornece cartões fictícios:

| Tipo | Número | Validade | CVV |
|------|--------|----------|-----|
| Visa Crédito | 4111 1111 1111 1111 | 11/25 | 123 |
| Mastercard | 5555 5555 5555 4444 | 11/25 | 123 |

---

## 📊 Próximos Passos Após Pagamento

### Página de Sucesso (`sucesso.html`)
```html
<h1>✅ Pagamento Aprovado!</h1>
<p>Seu pedido foi confirmado.</p>
<a href="index.html">Voltar ao site</a>
```

### Página de Erro (`erro.html`)
```html
<h1>❌ Pagamento Recusado</h1>
<p>Tente novamente ou entre em contato.</p>
<a href="index.html">Voltar ao carrinho</a>
```

---

## ⚠️ Checklist Final

- [ ] Conta Mercado Pago criada e aprovada
- [ ] Public Key e Access Token obtidos
- [ ] Backend criado em Node.js
- [ ] Backend fazendo deploy em Heroku/Replit/VPS
- [ ] URL do backend atualizada em `index.js`
- [ ] Testado com cartão de teste
- [ ] HTTPS ativado no domínio `ingridsolan.com.br`
- [ ] Página de sucesso/erro criada
- [ ] Webhook configurado para atualizar pedidos

---

## 🆘 Dúvidas Frequentes

**P: Preciso ter HTTPS?**  
R: Sim! Mercado Pago exige HTTPS. Ative SSL no seu hosting.

**P: Qual é a taxa do Mercado Pago?**  
R: ~4,99% por transação + R$0,49 de intermediação.

**P: Como recebo o dinheiro?**  
R: Automático na conta bancária cadastrada (1-2 dias úteis).

**P: Posso fazer tudo sem backend?**  
R: Não. Seu Access Token nunca deve ser exposto em JavaScript.

---

**Próxima etapa:** Compartilhe suas credenciais MP (Public Key) e irei atualizar o código com suas informações reais! 🚀
