📌 Visão Geral

Este projeto consiste em uma aplicação web completa para comercialização de produtos de informática, contemplando desde a navegação no catálogo até o processamento de pagamentos.

A solução foi construída com apoio de Inteligência Artificial na fase inicial e posteriormente refinada manualmente para garantir qualidade, segurança e aderência ao negócio.

🤖 Inteligência Artificial no Projeto

A IA foi utilizada como suporte no desenvolvimento inicial, incluindo:

Estruturação da aplicação
Geração de código base (frontend e backend)
Sugestões de layout e organização
Apoio na integração de serviços

Após isso, foram realizadas melhorias, validações e ajustes manuais.

🧱 Arquitetura
Frontend (HTML, CSS, JS)
        │
        ▼
Backend (Node.js + Express)
        │
        ▼
API de Pagamento (Mercado Pago)
🚀 Tecnologias
🔹 Frontend
HTML5
CSS3
JavaScript (Vanilla)
🔹 Backend
Node.js
Express
🔹 Integrações
Mercado Pago (pagamentos)
🔹 Futuro
MongoDB ou PostgreSQL
Autenticação de usuários
Painel administrativo
📂 Estrutura do Projeto
.
├── index.html
├── index.js
├── style.css
├── server.js
├── package.json
├── .env.example
├── /pages
│   ├── sucesso.html
│   ├── erro.html
│   ├── pendente.html
│   ├── pecas-novas.html
│   ├── pecas-usadas.html
│   ├── servicos.html
│   └── contato.html
⚙️ Configuração
1. Clonar o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
2. Instalar dependências
npm install
3. Configurar variáveis de ambiente

Crie um arquivo .env baseado no .env.example:

MERCADO_PAGO_ACCESS_TOKEN=SEU_TOKEN_AQUI
MERCADO_PAGO_PUBLIC_KEY=SUA_CHAVE_PUBLICA_AQUI
BASE_URL=http://localhost:3000

⚠️ Nunca versione o arquivo .env

▶️ Execução
Ambiente de desenvolvimento
npm run dev
Produção
npm start

A aplicação estará disponível em:
👉 http://localhost:3000

💳 Fluxo de Pagamento
Usuário adiciona produtos ao carrinho
Finaliza a compra
Backend cria preferência de pagamento
Redirecionamento para checkout
Retorno com status da transação
Webhook atualiza o estado do pagamento
🔐 Segurança

Boas práticas aplicadas:

Uso de variáveis de ambiente para credenciais
Separação entre frontend e backend
Endpoint dedicado para webhook
Recomendação de validação de eventos externos
⚠️ Importante

Caso credenciais tenham sido expostas anteriormente:

Revogar imediatamente
Gerar novas chaves
Atualizar ambiente
📈 Roadmap
 Persistência de dados (DB)
 Sistema de autenticação
 Painel administrativo
 Logs e monitoramento
 Deploy automatizado (CI/CD)
🌐 Deploy

Recomendações:

Vercel (frontend)
Railway ou Render (backend)
Antes de publicar:
Configurar variáveis de ambiente
Ativar HTTPS
Configurar webhook no provedor de pagamento
📞 Contato

Ingrid Sol'an
📧 contato@ingridsolan.com.br

📄 Licença

Distribuído sob a licença MIT.
