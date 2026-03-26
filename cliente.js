// ===== GERENCIAMENTO DE CLIENTES =====

let clienteAtual = null;

// Abrir modal de cadastro de cliente
function abrirModalCliente() {
  const modal = document.getElementById('modal-cliente');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('form-cliente').reset();
    document.getElementById('mensagem-erro').style.display = 'none';
    document.getElementById('mensagem-sucesso').style.display = 'none';
    
    // Verificar se já existe cliente salvo no localStorage
    const clienteLocal = localStorage.getItem('clienteAtual');
    if (clienteLocal) {
      const cliente = JSON.parse(clienteLocal);
      document.getElementById('nome_completo').value = cliente.nome_completo || '';
      document.getElementById('cpf').value = cliente.cpf || '';
      document.getElementById('celular').value = cliente.celular || '';
      document.getElementById('endereco').value = cliente.endereco || '';
      document.getElementById('email').value = cliente.email || '';
    }
  }
}

// Fechar modal de cadastro de cliente
function fecharModalCliente() {
  const modal = document.getElementById('modal-cliente');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Formatar CPF
function formatarCPF(input) {
  let valor = input.value.replace(/\D/g, '');
  
  if (valor.length > 11) {
    valor = valor.substring(0, 11);
  }
  
  if (valor.length <= 3) {
    input.value = valor;
  } else if (valor.length <= 6) {
    input.value = valor.substring(0, 3) + '.' + valor.substring(3);
  } else if (valor.length <= 9) {
    input.value = valor.substring(0, 3) + '.' + valor.substring(3, 6) + '.' + valor.substring(6);
  } else {
    input.value = valor.substring(0, 3) + '.' + valor.substring(3, 6) + '.' + 
                  valor.substring(6, 9) + '-' + valor.substring(9, 11);
  }
}

// Formatar Celular
function formatarCelular(input) {
  let valor = input.value.replace(/\D/g, '');
  
  if (valor.length > 11) {
    valor = valor.substring(0, 11);
  }
  
  if (valor.length <= 2) {
    input.value = valor;
  } else if (valor.length <= 7) {
    input.value = '(' + valor.substring(0, 2) + ') ' + valor.substring(2);
  } else {
    input.value = '(' + valor.substring(0, 2) + ') ' + valor.substring(2, 7) + '-' + valor.substring(7);
  }
}

// Validar CPF
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
  let primeroDígito = 11 - (soma % 11);
  if (primeroDígito > 9) primeroDígito = 0;
  if (primeroDígito !== parseInt(cpfLimpo[9])) return false;
  
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

// Validar Celular
function validarCelular(celular) {
  const celularLimpo = celular.replace(/\D/g, '');
  return celularLimpo.length >= 10 && celularLimpo.length <= 11;
}

// Validar e Enviar Formulário
async function validarEEnviarFormulario(event) {
  event.preventDefault();
  
  const nome_completo = document.getElementById('nome_completo').value.trim();
  const cpf = document.getElementById('cpf').value;
  const celular = document.getElementById('celular').value;
  const endereco = document.getElementById('endereco').value.trim();
  const email = document.getElementById('email').value.trim();
  
  // Limpar mensagens anteriores
  document.getElementById('mensagem-erro').style.display = 'none';
  document.getElementById('mensagem-sucesso').style.display = 'none';
  
  // Validações
  if (!nome_completo || nome_completo.length < 5) {
    mostrarErroFormulario('Nome completo deve ter no mínimo 5 caracteres');
    return;
  }
  
  if (!validarCPF(cpf)) {
    mostrarErroFormulario('CPF inválido. Verifique o número digitado');
    return;
  }
  
  if (!validarCelular(celular)) {
    mostrarErroFormulario('Celular inválido. Deve ter 10 ou 11 dígitos');
    return;
  }
  
  if (!endereco || endereco.length < 10) {
    mostrarErroFormulario('Endereço deve ter no mínimo 10 caracteres');
    return;
  }
  
  // Mostrar loading
  mostrarCarregamento(true);
  const btnSalvar = document.getElementById('btn-salvar-cliente');
  btnSalvar.disabled = true;
  
  try {
    // Preparar dados
    const dados = {
      nome_completo,
      cpf,
      celular,
      endereco,
      email: email || null
    };
    
    // Enviar para o servidor
    const response = await fetch('/api/cadastrar-cliente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });
    
    const rawTexto = await response.text();
    let resultado;
    try {
      resultado = rawTexto ? JSON.parse(rawTexto) : {};
    } catch (erroJson) {
      console.error('❌ JSON inválido retornado pelo servidor:', rawTexto);
      throw new Error(
        `Erro ao processar resposta do servidor (esperado JSON). ` +
        `Código: ${response.status}. Texto: ${rawTexto.substring(0, 300)}`
      );
    }

    if (response.ok) {
      // Salvar cliente no localStorage
      clienteAtual = resultado.cliente;
      localStorage.setItem('clienteAtual', JSON.stringify(resultado.cliente));
      
      mostrarCarregamento(false);
      btnSalvar.disabled = false;
      
      // Mostrar sucesso
      document.getElementById('mensagem-sucesso').textContent = 
        '✅ ' + resultado.mensagem + ' Redirecionando para pagamento...';
      document.getElementById('mensagem-sucesso').style.display = 'block';
      
      // Fechar modal e continuar com pagamento
      setTimeout(() => {
        fecharModalCliente();
        continuarComPagamento();
      }, 1500);
      
      mostrarNotificacao('✅ Cliente cadastrado com sucesso!', 'sucesso');
    } else {
      throw new Error(resultado.error || 'Erro ao cadastrar cliente');
    }
  } catch (erro) {
    console.error('❌ Erro ao salvar cliente:', erro);
    mostrarCarregamento(false);
    btnSalvar.disabled = false;
    mostrarErroFormulario(erro.message || 'Erro ao processar cadastro. Tente novamente.');
    mostrarNotificacao('❌ ' + erro.message, 'erro');
  }
}

// Mostrar Erro no Formulário
function mostrarErroFormulario(mensagem) {
  const elemento = document.getElementById('mensagem-erro');
  elemento.textContent = '❌ ' + mensagem;
  elemento.style.display = 'block';
  elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Mostrar Carregamento
function mostrarCarregamento(mostrar) {
  const elemento = document.getElementById('mensagem-carregamento');
  if (mostrar) {
    elemento.style.display = 'block';
  } else {
    elemento.style.display = 'none';
  }
}

// Continuar com Pagamento
function continuarComPagamento() {
  if (clienteAtual) {
    console.log('✅ Cliente cadastrado:', clienteAtual);
    // Chamar função de criar preferência Mercado Pago
    criarPreferenciaMercadoPago();
  }
}

// Carregar cliente salvo ao iniciar página
function carregarClienteSalvo() {
  const clienteLocal = localStorage.getItem('clienteAtual');
  if (clienteLocal) {
    clienteAtual = JSON.parse(clienteLocal);
    console.log('✅ Cliente carregado do localStorage:', clienteAtual);
  }
}

// Limpar dados do cliente
function limparDadosCliente() {
  clienteAtual = null;
  localStorage.removeItem('clienteAtual');
}

// Executar ao iniciar página
document.addEventListener('DOMContentLoaded', function() {
  carregarClienteSalvo();
});
