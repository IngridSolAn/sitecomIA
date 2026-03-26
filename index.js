// Dados das peças novas
const pecasNovas = [
  { nome: 'Processador Intel Core i7-12700K', imagem: 'imag/processadori7.jfif', descricao: 'Processador de alta performance para jogos e trabalho.', preco: 2400.00, avaliacao: 4.9, categoria: 'Hardware', freteGratis: true, oferta: '17% OFF no Pix' },
  { nome: 'Placa-mãe ASUS Prime Z690', imagem: 'imag/placa-mae-intel.jpg', descricao: 'Placa-mãe compatível com Intel de 12ª geração.', preco: 1450.00, avaliacao: 4.8, categoria: 'Hardware', freteGratis: true, oferta: '12% OFF' },
  { nome: 'Memória RAM 16GB DDR4 3200MHz', imagem: 'imag/memoria.jfif', descricao: 'Memória rápida para multitarefas.', preco: 320.00, avaliacao: 4.7, categoria: 'Memória', freteGratis: false, oferta: '10% OFF' },
  { nome: 'SSD NVMe 1TB', imagem: 'imag/SSD_NVMe1Tb.jpg', descricao: 'Armazenamento ultra-rápido.', preco: 550.00, avaliacao: 4.8, categoria: 'Armazenamento', freteGratis: true },
  { nome: 'Placa de vídeo NVIDIA RTX 4070', imagem: 'imag/NVidiartx4071.jpg', descricao: 'Gráficos de última geração.', preco: 3600.00, avaliacao: 4.9, categoria: 'Vídeo', freteGratis: false, oferta: '2x sem juros' }
];

// Dados das peças usadas
const pecasUsadas = [
  { nome: 'Processador AMD Ryzen 5 3600', imagem: 'imag/ryzen.png', descricao: 'Processador confiável para uso diário.', preco: 850.00, link: 'https://www.amd.com/pt/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-3600' },
  { nome: 'Placa-mãe Gigabyte B450', imagem: 'imag/placamae.jpg', descricao: 'Placa-mãe econômica e funcional.', preco: 520.00 },
  { nome: 'Memória RAM 8GB DDR4 2666MHz', imagem: 'imag/memoriaram.jpg', descricao: 'Memória acessível para upgrades.', preco: 120.00 },
  { nome: 'HDD 1TB', imagem: 'https://via.placeholder.com/120?text=HDD+1TB', descricao: 'Armazenamento tradicional de grande capacidade.', preco: 180.00 },
  { nome: 'Placa de vídeo NVIDIA GTX 1660 Ti', imagem: 'imag/NVIDIAGTX1660.jpg', descricao: 'Gráficos sólidos para jogos.', preco: 1300.00 }
];

// Dados dos serviços
const servicos = [
  { nome: 'Formatação e otimização', imagem: 'imag/Tecnicotubinando.png', descricao: 'Formatação com backup de dados, instalação de sistema e ajuste de performance.', preco: 180.00 },
  { nome: 'Instalação de hardware', imagem: 'imag/instalacao.jpg', descricao: 'Instalação de SSD, RAM, placa de vídeo, fonte e demais componentes.', preco: 120.00 },
  { nome: 'Diagnóstico e reparo', imagem: 'imag/placamae.jpg', descricao: 'Verificação completa do sistema e reparo de falhas hard/software.', preco: 150.00 },
  { nome: 'Atualização de sistema', imagem: 'imag/memoria.jfif', descricao: 'Atualização de drivers, BIOS e sistema operacional.', preco: 100.00 },
  { nome: 'Manutenção preventiva', imagem: 'imag/HDD1TB.jfif', descricao: 'Limpeza física, troca de pasta térmica e testes de estabilidade.', preco: 110.00 }
];

// Carrinho simples
const carrinho = [];

// ===== CONFIGURAÇÃO MERCADO PAGO =====
// Credenciais movidas para o backend (.env) por segurança

// ===== FUNÇÃO PARA INTEGRAR MERCADO PAGO =====
async function criarPreferenciaMercadoPago() {
  if (carrinho.length === 0) {
    mostrarNotificacao('❌ Carrinho vazio. Adicione itens antes.', 'erro');
    return;
  }

  if (!clienteAtual) {
    mostrarNotificacao('❌ Dados do cliente não encontrados.', 'erro');
    abrirModalCliente();
    return;
  }

  try {
    // Preparar dados para enviar ao backend
    const items = carrinho.map((item, idx) => ({
      title: item.nome,
      quantity: 1,
      unit_price: item.preco,
      currency_id: 'BRL'
    }));

    const payer = {
      name: clienteAtual.nome_completo,
      email: clienteAtual.email || 'cliente@email.com'
    };

    // Calcular total
    const total = carrinho.reduce((acc, c) => acc + c.preco, 0);

    console.log('📦 Enviando pedido para processamento...');
    console.log('💰 Total da compra: R$', total.toFixed(2));
    console.log('👤 Cliente:', payer.name);

    // Fazer requisição para o backend
    const response = await fetch('/api/criar-preferencia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items, payer })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta do servidor:', errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log('✅ Preferência criada com sucesso!');
    console.log('🆔 ID da preferência:', data.id);

    // Salvar pedido no banco de dados
    try {
      const responsePedido = await fetch('/api/salvar-pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: clienteAtual.id,
          mercadopago_id: data.id,
          total: total,
          itens: carrinho
        })
      });

      if (responsePedido.ok) {
        const pedidoData = await responsePedido.json();
        console.log('✅ Pedido salvo no banco de dados:', pedidoData);
      } else {
        const errorText = await responsePedido.text();
        console.error('⚠️ Erro ao salvar pedido:', errorText);
      }
    } catch (erro) {
      console.error('⚠️ Aviso: Erro na requisição de salvar pedido:', erro.message);
      // Continua mesmo que falhe salvar no banco
    }

    // Redirecionar para o checkout do Mercado Pago
    mostrarNotificacao(`✅ Redirecionando para Mercado Pago...\n\nTotal: R$ ${total.toFixed(2)}\n\n💳 Formas: Cartão, PIX, Boleto`, 'sucesso');
    
    setTimeout(() => {
      window.location.href = data.init_point;
    }, 2000);

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
    mostrarNotificacao('❌ Erro ao processar pagamento. Verifique sua conexão e tente novamente.', 'erro');
  }
}

// Função para atualizar visual do carrinho
function atualizarCarrinho() {
  const container = document.getElementById('carrinho');
  if (!container) return;

  // Adicionar classe de animação
  container.classList.add('carrinho-atualizado');
  setTimeout(() => container.classList.remove('carrinho-atualizado'), 300);

  if (carrinho.length === 0) {
    container.innerHTML = '<p>Seu carrinho está vazio.</p>';
    atualizarBotaoCarrinho();
    return;
  }

  let total = 0;
  let html = '<ul>';
  carrinho.forEach((item, index) => {
    total += item.preco;
    html += `<li class="item-carrinho" style="animation-delay: ${index * 50}ms;">
      <span>${item.nome}</span>
      <span class="preco-item">R$ ${item.preco.toFixed(2)}</span>
      <button onclick="removerDoCarrinho(${item.id})" class="btn-remover">✕</button>
    </li>`;
  });
  html += `</ul>
    <div class="resumo-carrinho">
      <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
      <button onclick="finalizarCompra()" class="btn-finalizar">💳 Finalizar Compra</button>
    </div>`;

  container.innerHTML = html;
  atualizarBotaoCarrinho();
  mostrarNotificacao(`Carrinho atualizado! ${carrinho.length} item(ns)`, 'info');
}

// Atualizar botão do carrinho com contador
function atualizarBotaoCarrinho() {
  const botaoCarrinho = document.getElementById('toggle-pecas');
  if (botaoCarrinho) {
    if (carrinho.length > 0) {
      botaoCarrinho.textContent = `🛒 ${carrinho.length}`;
      botaoCarrinho.style.backgroundColor = '#FFD700';
      botaoCarrinho.style.color = '#003366';
    } else {
      botaoCarrinho.textContent = '🛒';
      botaoCarrinho.style.backgroundColor = '#fff';
      botaoCarrinho.style.color = '#003366';
    }
  }
}

function removerDoCarrinho(id) {
  const pos = carrinho.findIndex(item => item.id === id);
  if (pos > -1) {
    const itemRemovido = carrinho[pos];
    carrinho.splice(pos, 1);
    atualizarCarrinho();
    mostrarNotificacao(`${itemRemovido.nome} removido do carrinho`, 'sucesso');
  }
}

function finalizarCompra() {
  if (carrinho.length === 0) {
    mostrarNotificacao('❌ Carrinho vazio. Adicione itens antes.', 'erro');
    return;
  }
  
  // Abrir modal de cadastro de cliente
  abrirModalCliente();
}

// Função para gerar catálogo
function gerarCatalogo(pecas, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let titulo = '';
  if (containerId === 'pecas-novas') titulo = '✨ Peças Novas';
  else if (containerId === 'pecas-usadas') titulo = '♻️ Peças Usadas';
  else if (containerId === 'servicos') titulo = '🛠️ Serviços Disponíveis';
  else titulo = 'Catálogo';

  container.innerHTML = `<h2>${titulo}</h2><div class="catalogo-container"></div>`;
  const catalogoDiv = container.querySelector('.catalogo-container');
  
  pecas.forEach((peca, index) => {
    const item = document.createElement('div');
    item.className = 'catalogo-item';
    item.style.animationDelay = `${index * 100}ms`;
    const linkStart = peca.link ? `<a href="${peca.link}" target="_blank">` : '';
    const linkEnd = peca.link ? '</a>' : '';
    const preco = peca.preco !== undefined ? peca.preco : 250.00;
    const avaliacao = peca.avaliacao || 4.8;
    const oferta = peca.oferta || '';
    const frete = peca.freteGratis ? '<span class="tag" style="background:#28a745">Frete grátis</span>' : '<span class="tag" style="background:#666">Frete</span>';

    item.innerHTML = `
      ${linkStart}<img src="${peca.imagem}" alt="${peca.nome}" class="catalogo-imagem">${linkEnd}
      <div class="catalogo-texto">
        <div class="catalogo-info">
          <span class="catalogo-avaliacao">★ ${avaliacao.toFixed(1)}</span>
          <span class="tag">${peca.categoria || 'produto'}</span>
          ${frete}
        </div>
        <h3>${peca.nome}</h3>
        <p>${peca.descricao}</p>
        <p class="catalogo-preco">R$ ${preco.toFixed(2)}</p>
        ${oferta ? `<span class="tag" style="background:#e74c3c;margin-bottom:8px;">${oferta}</span>` : ''}
        <button class="btn-comprar">Comprar</button>
      </div>
    `;
    catalogoDiv.appendChild(item);

    const botaoComprar = item.querySelector('.btn-comprar');
    if (botaoComprar) {
      botaoComprar.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
      });
      botaoComprar.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      });
      
      botaoComprar.addEventListener('click', function(event) {
        adicionarAoCarrinho(event, peca, preco);
      });
    }
  });
}

function filtrarServicos(categoria) {
  let servicosFiltrados = servicos;
  if (categoria === 'formacao') {
    servicosFiltrados = servicos.filter(s => s.nome.toLowerCase().includes('formata') || s.descricao.toLowerCase().includes('formata'));
  } else if (categoria === 'instalacao') {
    servicosFiltrados = servicos.filter(s => s.nome.toLowerCase().includes('instala') || s.descricao.toLowerCase().includes('instala'));
  } else if (categoria === 'diagnostico') {
    servicosFiltrados = servicos.filter(s => s.nome.toLowerCase().includes('diagn') || s.descricao.toLowerCase().includes('diagn'));
  }

  gerarCatalogo(servicosFiltrados, 'servicos');

  document.querySelectorAll('.filtro-servicos button').forEach(btn => {
    const categoriaBotao = btn.textContent.toLowerCase();
    if ((categoria === 'tudo' && categoriaBotao === 'todos') || categoriaBotao === categoria) {
      btn.classList.add('filtro-ativo');
    } else {
      btn.classList.remove('filtro-ativo');
    }
  });
}

function adicionarAoCarrinho(event, item, preco) {
  const novoItem = { id: Date.now(), nome: item.nome, preco };
  carrinho.push(novoItem);
  
  // Animação visual no botão (uso seguro de event)
  if (event && event.target) {
    event.target.style.transform = 'scale(0.95)';
    event.target.textContent = '✓ Adicionado!';
    event.target.style.backgroundColor = '#28a745';
    event.target.style.color = '#fff';
  }
  
  setTimeout(() => {
    if (event && event.target) {
      event.target.style.transform = 'scale(1)';
      event.target.textContent = 'Comprar';
      event.target.style.backgroundColor = '';
      event.target.style.color = '';
    }
  }, 1000);
  
  atualizarCarrinho();
  mostrarNotificacao(`✅ ${item.nome} adicionado ao carrinho!`, 'sucesso');
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao notificacao-${tipo}`;
  notificacao.textContent = mensagem;
  notificacao.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  // Cores das notificações
  if (tipo === 'sucesso') {
    notificacao.style.backgroundColor = '#28a745';
    notificacao.style.color = '#fff';
  } else if (tipo === 'erro') {
    notificacao.style.backgroundColor = '#dc3545';
    notificacao.style.color = '#fff';
  } else {
    notificacao.style.backgroundColor = '#17a2b8';
    notificacao.style.color = '#fff';
  }
  
  document.body.appendChild(notificacao);
  
  setTimeout(() => {
    notificacao.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notificacao.remove(), 300);
  }, 3000);
}

// Contador de visitas
let visitas = localStorage.getItem('visitas') || 0;
visitas++;
localStorage.setItem('visitas', visitas);

// Interação simples: alerta ao clicar em botões de orçamento
document.addEventListener('DOMContentLoaded', function() {
  // Opcional: usar contador em console, sem mostrar no header
  console.log(`Visitas: ${visitas}`);

  // Gerar catálogos
  gerarCatalogo(pecasNovas, 'pecas-novas');
  gerarCatalogo(pecasUsadas, 'pecas-usadas');
  gerarCatalogo(servicos, 'servicos');

  // Atualizar contador no botão do carrinho
  atualizarBotaoCarrinho();

  // Interação com logo
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('mouseenter', function() {
      this.style.transform = 'rotate(5deg) scale(1.05)';
    });
    logo.addEventListener('mouseleave', function() {
      this.style.transform = 'rotate(0) scale(1)';
    });
  }

  // Menu hambúrguer mobile
  const menuHamburger = document.getElementById('menu-hamburger');
  const nav = document.querySelector('.kabum-nav');

  if (menuHamburger && nav) {
    menuHamburger.addEventListener('click', () => {
      nav.classList.toggle('show');
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        nav.classList.remove('show');
      }
    });

    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          nav.classList.remove('show');
        }
      });
    });
  }

  // Interação com botões gerais
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      if (this.textContent.includes('Orçamento')) {
        mostrarNotificacao('📧 Obrigado! Entraremos em contato em breve.', 'sucesso');
      } else if (this.textContent.includes('Agendar')) {
        mostrarNotificacao('📅 Serviço agendado! Aguarde nosso contato.', 'sucesso');
      } else if (this.id === 'toggle-pecas') {
        togglePecas();
        const carrinho = document.getElementById('carrinho');
        if (carrinho.style.display !== 'none') {
          mostrarNotificacao('Carrinho aberto', 'info');
        }
      }
    });

    // Efeito hover em botões
    button.addEventListener('mouseenter', function() {
      if (!this.classList.contains('btn-remover')) {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      }
    });
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  });

  // Animações ao carregar
  const secoes = document.querySelectorAll('section');
  secoes.forEach((secao, index) => {
    secao.style.opacity = '0';
    secao.style.transform = 'translateY(20px)';
    setTimeout(() => {
      secao.style.transition = 'all 0.5s ease';
      secao.style.opacity = '1';
      secao.style.transform = 'translateY(0)';
    }, index * 100);
  });

  // Logo encolhe e vai para a esquerda ao rolar
  const header = document.querySelector('.kabum-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 70) {
        header.classList.add('shrink');
      } else {
        header.classList.remove('shrink');
      }
    });
  }

  // Adicionar estilos de CSS dinâmico
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .catalogo-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 20px;
    }

    .catalogo-item {
      animation: fadeIn 0.5s ease-out forwards;
      opacity: 0;
    }

    .item-carrinho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #eee;
      animation: slideIn 0.3s ease;
    }

    .preco-item {
      font-weight: bold;
      color: #ff6600;
    }

    .btn-remover {
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }

    .btn-remover:hover {
      background-color: #c82333;
      transform: scale(1.1);
    }

    .resumo-carrinho {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-top: 15px;
      text-align: center;
    }

    .btn-finalizar {
      width: 100%;
      padding: 14px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1.1em;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .btn-finalizar:hover {
      background-color: #218838;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .carrinho-atualizado {
      animation: pulse 0.3s ease;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }

    button {
      transition: all 0.3s ease;
    }

    section {
      transition: all 0.5s ease;
    }
  `;
  document.head.appendChild(style);

  mostrarNotificacao('👋 Bem-vindo à Ingrid Sol\'an!', 'info');
});

// Função para mostrar/ocultar carrinho
function togglePecas() {
  const carrinho = document.getElementById('carrinho');
  if (carrinho) {
    if (carrinho.style.display === 'none' || carrinho.style.display === '') {
      carrinho.style.display = 'block';
      carrinho.style.animation = 'slideIn 0.3s ease';
    } else {
      carrinho.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        carrinho.style.display = 'none';
      }, 300);
    }
  }
}