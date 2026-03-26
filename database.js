const fs = require('fs');
const path = require('path');

// Caminho dos arquivos de dados
const clientesPath = path.join(__dirname, 'dados', 'clientes.json');
const pedidosPath = path.join(__dirname, 'dados', 'pedidos.json');
const visitantesPath = path.join(__dirname, 'dados', 'visitantes.json');
const dataDir = path.join(__dirname, 'dados');

// Criar diretório de dados se não existir
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Diretório de dados criado');
}

// Inicializar arquivos se não existem
function inicializarArquivos() {
  if (!fs.existsSync(clientesPath)) {
    fs.writeFileSync(clientesPath, JSON.stringify([], null, 2));
    console.log('✅ Arquivo de clientes criado');
  }
  
  if (!fs.existsSync(pedidosPath)) {
    fs.writeFileSync(pedidosPath, JSON.stringify([], null, 2));
    console.log('✅ Arquivo de pedidos criado');
  }

  if (!fs.existsSync(visitantesPath)) {
    fs.writeFileSync(visitantesPath, JSON.stringify([], null, 2));
    console.log('✅ Arquivo de visitantes criado');
  }
}

// Ler arquivo JSON
function lerArquivo(caminho) {
  try {
    const dados = fs.readFileSync(caminho, 'utf8');
    return JSON.parse(dados);
  } catch (erro) {
    console.error('❌ Erro ao ler arquivo:', erro.message);
    return [];
  }
}

// Escrever arquivo JSON
function escreverArquivo(caminho, dados) {
  try {
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
    return true;
  } catch (erro) {
    console.error('❌ Erro ao escrever arquivo:', erro.message);
    return false;
  }
}

// Gerar ID único
function gerarID() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Funções para manipular dados
const database = {
  // Cadastrar novo cliente
  cadastrarCliente: (dados, callback) => {
    try {
      const clientes = lerArquivo(clientesPath);
      
      // Verificar se CPF já existe
      if (clientes.some(c => c.cpf === dados.cpf)) {
        return callback({ error: 'CPF já cadastrado no sistema' }, null);
      }
      
      const novoCliente = {
        id: clientes.length + 1,
        ...dados,
        data_cadastro: new Date().toISOString()
      };
      
      clientes.push(novoCliente);
      
      if (escreverArquivo(clientesPath, clientes)) {
        callback(null, novoCliente);
      } else {
        callback({ error: 'Erro ao salvar cliente' }, null);
      }
    } catch (erro) {
      callback({ error: 'Erro ao cadastrar cliente: ' + erro.message }, null);
    }
  },

  // Buscar cliente por CPF
  buscarClientePorCPF: (cpf, callback) => {
    try {
      const clientes = lerArquivo(clientesPath);
      const cliente = clientes.find(c => c.cpf === cpf);
      
      if (!cliente) {
        return callback(null, null);
      }
      
      callback(null, cliente);
    } catch (erro) {
      callback({ error: 'Erro ao buscar cliente: ' + erro.message }, null);
    }
  },

  // Buscar cliente por ID
  buscarClientePorID: (id, callback) => {
    try {
      const clientes = lerArquivo(clientesPath);
      const cliente = clientes.find(c => c.id === parseInt(id));
      
      if (!cliente) {
        return callback(null, null);
      }
      
      callback(null, cliente);
    } catch (erro) {
      callback({ error: 'Erro ao buscar cliente: ' + erro.message }, null);
    }
  },

  // Listar todos os clientes
  listarClientes: (callback) => {
    try {
      const clientes = lerArquivo(clientesPath);
      callback(null, clientes || []);
    } catch (erro) {
      callback({ error: 'Erro ao listar clientes: ' + erro.message }, null);
    }
  },

  // Salvar pedido
  salvarPedido: (cliente_id, dados, callback) => {
    try {
      const pedidos = lerArquivo(pedidosPath);
      
      const novoPedido = {
        id: pedidos.length + 1,
        cliente_id: parseInt(cliente_id),
        mercadopago_id: dados.mercadopago_id || null,
        total: dados.total,
        status: 'pendente',
        itens: dados.itens,
        data_pedido: new Date().toISOString()
      };
      
      pedidos.push(novoPedido);
      
      if (escreverArquivo(pedidosPath, pedidos)) {
        callback(null, novoPedido);
      } else {
        callback({ error: 'Erro ao salvar pedido' }, null);
      }
    } catch (erro) {
      callback({ error: 'Erro ao salvar pedido: ' + erro.message }, null);
    }
  },

  // Buscar pedidos de um cliente
  buscarPedidosCliente: (cliente_id, callback) => {
    try {
      const pedidos = lerArquivo(pedidosPath);
      const pedidosCliente = pedidos.filter(p => p.cliente_id === parseInt(cliente_id));
      
      callback(null, pedidosCliente || []);
    } catch (erro) {
      callback({ error: 'Erro ao buscar pedidos: ' + erro.message }, null);
    }
  },

  // Atualizar status do pedido
  atualizarStatusPedido: (pedido_id, status, callback) => {
    try {
      const pedidos = lerArquivo(pedidosPath);
      const pedido = pedidos.find(p => p.id === parseInt(pedido_id));
      
      if (!pedido) {
        return callback({ error: 'Pedido não encontrado' }, null);
      }
      
      pedido.status = status;
      
      if (escreverArquivo(pedidosPath, pedidos)) {
        callback(null, { changed: 1 });
      } else {
        callback({ error: 'Erro ao atualizar pedido' }, null);
      }
    } catch (erro) {
      callback({ error: 'Erro ao atualizar pedido: ' + erro.message }, null);
    }
  },

  // Registrar visitante
  registrarVisitante: (dados, callback) => {
    try {
      const visitantes = lerArquivo(visitantesPath);
      
      const novoVisitante = {
        id: visitantes.length + 1,
        ...dados,
        timestamp: new Date().toISOString()
      };
      
      visitantes.push(novoVisitante);
      
      if (escreverArquivo(visitantesPath, visitantes)) {
        callback(null, novoVisitante);
      } else {
        callback({ error: 'Erro ao salvar visitante' }, null);
      }
    } catch (erro) {
      callback({ error: 'Erro ao registrar visitante: ' + erro.message }, null);
    }
  },

  // Buscar todos os visitantes
  buscarVisitantes: (callback) => {
    try {
      const visitantes = lerArquivo(visitantesPath);
      
      callback(null, visitantes);
    } catch (erro) {
      callback({ error: 'Erro ao buscar visitantes: ' + erro.message }, null);
    }
  },

  // Fechar conexão (não faz nada para JSON)
  fechar: () => {
    console.log('✅ Banco de dados (JSON) fechado');
  }
};

// Inicializar arquivos ao carregar
inicializarArquivos();

module.exports = database;

