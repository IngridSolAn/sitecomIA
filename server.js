require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mercadopago = require('mercadopago');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Middleware para registrar visitantes
app.use((req, res, next) => {
  // Não registrar para arquivos estáticos (CSS, JS, imagens) ou painel de visitantes
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/) || req.path === '/painel-visitantes') {
    return next();
  }
  
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const path = req.path;
  
  db.registrarVisitante({
    ip: ip,
    userAgent: userAgent,
    path: path,
    method: req.method
  }, (erro, resultado) => {
    if (erro) {
      console.error('Erro ao registrar visitante:', erro);
    }
  });
  
  next();
});

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// ===== ROTAS DA API =====

// Rotas de preflight CORS para APIs
app.options('/api/cadastrar-cliente', cors());
app.options('/api/criar-preferencia', cors());
app.options('/api/salvar-pedido', cors());

// Rota para criar preferência de pagamento
app.post('/api/criar-preferencia', async (req, res) => {
  try {
    const { items, payer } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Calcular total
    const total = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

    // Criar preferência no Mercado Pago
    const preference = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'BRL'
      })),
      payer: {
        name: payer?.name || 'Cliente',
        email: payer?.email || 'cliente@email.com'
      },
      back_urls: {
        success: process.env.SUCCESS_URL || 'http://localhost:3000/sucesso.html',
        failure: process.env.FAILURE_URL || 'http://localhost:3000/erro.html',
        pending: process.env.PENDING_URL || 'http://localhost:3000/pendente.html'
      },
      auto_return: 'approved',
      external_reference: `pedido-${Date.now()}`,
      notification_url: process.env.WEBHOOK_URL || 'http://localhost:3000/webhook'
    };

    const response = await mercadopago.preferences.create(preference);

    console.log('✅ Preferência criada:', response.body.id);
    console.log('💰 Total: R$', total.toFixed(2));

    res.json({
      id: response.body.id,
      init_point: response.body.init_point,
      total: total
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook para receber notificações do Mercado Pago
app.post('/webhook', (req, res) => {
  try {
    const payment = req.body;

    console.log('🔔 Webhook recebido:', payment);

    // Aqui você pode processar o pagamento
    // Salvar no banco de dados, enviar email, etc.

    if (payment.type === 'payment') {
      const paymentId = payment.data.id;

      // Buscar detalhes do pagamento
      mercadopago.payment.get(paymentId).then((paymentInfo) => {
        console.log('💳 Status do pagamento:', paymentInfo.body.status);

        // Aqui você implementaria a lógica de negócio:
        // - Atualizar status do pedido
        // - Enviar email de confirmação
        // - Notificar via WhatsApp
        // - etc.

      }).catch((error) => {
        console.error('Erro ao buscar pagamento:', error);
      });
    }

    res.sendStatus(200);

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.sendStatus(500);
  }
});

// Rota para obter status de um pagamento
app.get('/api/pagamento/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await mercadopago.payment.get(paymentId);

    res.json({
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      amount: payment.body.transaction_amount,
      date_created: payment.body.date_created
    });

  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({ error: 'Erro ao buscar pagamento' });
  }
});

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ===== ROTAS DE CLIENTES =====

// Função para validar CPF
function validarCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Validar primeiro dígito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let primeiDígito = 11 - (soma % 11);
  if (primeiDígito > 9) primeiDígito = 0;
  if (primeiDígito !== parseInt(cpfLimpo[9])) return false;
  
  // Validar segundo dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  let segundoDígito = 11 - (soma % 11);
  if (segundoDígito > 9) segundoDígito = 0;
  if (segundoDígito !== parseInt(cpfLimpo[10])) return false;
  
  return true;
}

// Função para validar celular
function validarCelular(celular) {
  const celularLimpo = celular.replace(/\D/g, '');
  return celularLimpo.length >= 10 && celularLimpo.length <= 11;
}

// POST - Cadastrar novo cliente
app.post('/api/cadastrar-cliente', (req, res) => {
  const { nome_completo, celular, endereco, cpf, email } = req.body;

  // debug: conferir se o corpo chegou corretamente
  console.log('📥 /api/cadastrar-cliente recebendo:', {
    method: req.method,
    headers: req.headers['content-type'],
    body: req.body
  });

  // Validações
  if (!nome_completo || !celular || !endereco || !cpf) {
    return res.status(400).json({ 
      error: 'Todos os campos são obrigatórios',
      campos_faltantes: {
        nome_completo: !nome_completo,
        celular: !celular,
        endereco: !endereco,
        cpf: !cpf
      }
    });
  }

  if (!validarCPF(cpf)) {
    return res.status(400).json({ error: 'CPF inválido' });
  }

  if (!validarCelular(celular)) {
    return res.status(400).json({ error: 'Celular inválido (deve ter 10 ou 11 dígitos)' });
  }

  db.cadastrarCliente({
    nome_completo: nome_completo.toUpperCase(),
    celular: celular.replace(/\D/g, ''),
    endereco: endereco,
    cpf: cpf.replace(/\D/g, ''),
    email: email || null
  }, (err, cliente) => {
    if (err) {
      return res.status(400).json(err);
    }
    
    mostrarNotificacao = `✅ Cliente ${cliente.nome_completo} cadastrado com sucesso!`;
    res.status(201).json({
      sucesso: true,
      mensagem: 'Cliente cadastrado com sucesso!',
      cliente: cliente
    });
  });
});

// GET - Buscar cliente por CPF
app.get('/api/cliente/:cpf', (req, res) => {
  const cpf = req.params.cpf.replace(/\D/g, '');

  db.buscarClientePorCPF(cpf, (err, cliente) => {
    if (err) {
      return res.status(400).json(err);
    }
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      sucesso: true,
      cliente: cliente
    });
  });
});

// GET - Listar todos os clientes (para administração)
app.get('/api/clientes', (req, res) => {
  db.listarClientes((err, clientes) => {
    if (err) {
      return res.status(400).json(err);
    }

    res.json({
      sucesso: true,
      total: clientes.length,
      clientes: clientes
    });
  });
});

// POST - Salvar pedido
app.post('/api/salvar-pedido', (req, res) => {
  const { cliente_id, mercadopago_id, total, itens } = req.body;

  if (!cliente_id || !total) {
    return res.status(400).json({ error: 'Cliente e total são obrigatórios' });
  }

  db.salvarPedido(cliente_id, {
    mercadopago_id,
    total,
    itens
  }, (err, pedido) => {
    if (err) {
      return res.status(400).json(err);
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Pedido salvo com sucesso!',
      pedido: pedido
    });
  });
});

// GET - Buscar pedidos de um cliente
app.get('/api/pedidos/:cliente_id', (req, res) => {
  const cliente_id = req.params.cliente_id;

  db.buscarPedidosCliente(cliente_id, (err, pedidos) => {
    if (err) {
      return res.status(400).json(err);
    }

    res.json({
      sucesso: true,
      total_pedidos: pedidos.length,
      pedidos: pedidos
    });
  });
});

// ===== ROTAS PARA SERVIR PÁGINAS =====

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Outras páginas
app.get('/pecas-novas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pecas-novas.html'));
});

app.get('/pecas-usadas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pecas-usadas.html'));
});

app.get('/servicos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'servicos.html'));
});

app.get('/contato.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'contato.html'));
});

// Páginas de status
app.get('/sucesso.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'sucesso.html'));
});

app.get('/erro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'erro.html'));
});

app.get('/pendente.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pendente.html'));
});

// Rota para painel de visitantes
app.get('/painel-visitantes', (req, res) => {
  db.buscarVisitantes((err, visitantes) => {
    if (err) {
      return res.status(500).send('Erro ao buscar visitantes');
    }

    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const visitantesHoje = visitantes.filter(v => v.timestamp.startsWith(hoje));
    const totalHoje = visitantesHoje.length;
    const totalGeral = visitantes.length;

    let html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Painel de Visitantes</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <div class="container">
        <h1>📊 Painel de Visitantes do Site</h1>
        <p>Total de visitantes hoje: <strong>${totalHoje}</strong></p>
        <p>Total geral: <strong>${totalGeral}</strong></p>
        
        <h2>Visitas de Hoje</h2>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>ID</th>
              <th>IP</th>
              <th>User Agent</th>
              <th>Página</th>
              <th>Método</th>
              <th>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
    `;

    visitantesHoje.forEach(visitante => {
      html += `
            <tr>
              <td>${visitante.id}</td>
              <td>${visitante.ip}</td>
              <td>${visitante.userAgent.substring(0, 50)}...</td>
              <td>${visitante.path}</td>
              <td>${visitante.method}</td>
              <td>${new Date(visitante.timestamp).toLocaleString('pt-BR')}</td>
            </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        
        <br>
        <a href="/">← Voltar ao site</a>
      </div>
    </body>
    </html>
    `;

    res.send(html);
  });
});

// ===== MIDDLEWARE DE ERRO GLOBAL =====
// Middleware para tratar erros 404 (rota não encontrada)
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Middleware para tratar erros gerais
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    status: err.status || 500
  });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`💳 Mercado Pago: ${process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'Configurado' : 'Não configurado'}`);
});