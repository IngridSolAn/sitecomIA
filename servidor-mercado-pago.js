const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔧 Middlewares
app.use(cors());
app.use(express.json());

// 🔑 Configurar Mercado Pago
// ⚠️ IMPORTANTE: Adicione seu ACCESS_TOKEN no arquivo .env!
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN || 'APP_USR-SEU-TOKEN-AQUI'
});

console.log('🔍 MP Access Token configurado:', process.env.MP_ACCESS_TOKEN ? '✅ Sim' : '❌ Não (usar .env)');

// ==========================================
// 📍 ROTAS
// ==========================================

// 🏠 Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    status: '✅ Servidor Mercado Pago ativo',
    endpoints: ['/criar-preferencia', '/webhook-mp']
  });
});

// 💳 Rota para criar preferência de pagamento
app.post('/criar-preferencia', async (req, res) => {
  try {
    const { items, email } = req.body;

    // ✅ Validar dados
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        erro: 'Carrinho vazio' 
      });
    }

    // 📊 Log dos dados recebidos
    console.log('📦 Criando preferência para:');
    console.log('   Email:', email);
    console.log('   Itens:', items);

    // 💰 Calcular total
    const total = items.reduce((acc, item) => 
      acc + (item.unit_price * item.quantity), 0
    );
    console.log('   Total: R$', total.toFixed(2));

    // 🎯 Criar objeto de preferência
    const preference = {
      items: items.map(item => ({
        title: item.title || item.nome,
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.unit_price),
        currency_id: 'BRL',
        description: item.description || 'Produto da loja'
      })),
      payer: {
        email: email || 'cliente@ingridsolan.com.br',
        name: 'Cliente Ingrid Sol\'an'
      },
      back_urls: {
        success: process.env.BACK_URL_SUCCESS || 'https://seu-dominio.com.br/sucesso',
        failure: process.env.BACK_URL_FAILURE || 'https://seu-dominio.com.br/erro',
        pending: process.env.BACK_URL_PENDING || 'https://seu-dominio.com.br/pendente'
      },
      auto_return: 'approved',
      notification_url: process.env.NOTIFICATION_URL || 'https://seu-dominio.com.br/webhook-mp',
      external_reference: `pedido_${Date.now()}`,
      statement_descriptor: 'INGRID SOLAN',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24*60*60*1000).toISOString() // 24 horas
    };

    // 🚀 Criar no Mercado Pago
    const resposta = await mercadopago.preferences.create(preference);

    console.log('✅ Preferência criada! ID:', resposta.body.id);

    // ✅ Retornar link de pagamento
    res.json({
      success: true,
      init_point: resposta.body.init_point, // Link para pagar
      preference_id: resposta.body.id,
      total: total.toFixed(2)
    });

  } catch (erro) {
    console.error('❌ ERRO ao criar preferência:', erro.message);
    console.error('   Detalhes:', erro.response?.data || erro);
    
    res.status(500).json({ 
      success: false, 
      erro: erro.message,
      detalhes: erro.response?.data?.message || 'Erro geral'
    });
  }
});

// 🔔 Rota para receber notificações do Mercado Pago (webhook)
app.post('/webhook-mp', async (req, res) => {
  try {
    const { id, topic, type } = req.query;

    console.log(`🔔 Webhook recebido - Topic: ${topic}, ID: ${id}`);

    if (topic === 'payment') {
      // 📥 Buscar detalhes do pagamento
      const payment = await mercadopago.payment.findById(id);
      const status = payment.body.status;
      const amount = payment.body.transaction_amount;

      console.log(`💰 Pagamento ID: ${id}`);
      console.log(`   Status: ${status}`);
      console.log(`   Valor: R$ ${amount}`);

      // ✅ Processar de acordo com o status
      switch(status) {
        case 'approved':
          console.log('✅ PAGAMENTO APROVADO! Entregar produto/serviço');
          // TODO: Atualizar banco de dados, enviar email, etc.
          break;
        case 'pending':
          console.log('⏳ PAGAMENTO PENDENTE (aguardando confirmação)');
          break;
        case 'rejected':
          console.log('❌ PAGAMENTO RECUSADO');
          break;
        case 'cancelled':
          console.log('🚫 PAGAMENTO CANCELADO');
          break;
        case 'refunded':
          console.log('🔄 PAGAMENTO REEMBOLSADO');
          break;
      }

      // 📧 Aqui você pode:
      // - Salvar no banco de dados
      // - Enviar email para cliente
      // - Atualizar estoque
      // - Gerar nota fiscal
    }

    // ✅ Sempre responder 200 para Mercado Pago
    res.status(200).json({ received: true });

  } catch (erro) {
    console.error('❌ ERRO no webhook:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});

// 📋 Rota para verificar status de um pagamento específico
app.get('/status-pagamento/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await mercadopago.payment.findById(paymentId);

    res.json({
      id: payment.body.id,
      status: payment.body.status,
      valor: payment.body.transaction_amount,
      data: payment.body.date_created,
      payer_email: payment.body.payer?.email
    });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  🚀 SERVIDOR MERCADO PAGO ATIVO       ║
  ║  Porta: ${PORT}                              ║
  ║  Endpoints:                            ║
  ║  - POST /criar-preferencia             ║
  ║  - POST /webhook-mp                    ║
  ║  - GET  /status-pagamento/:id          ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
