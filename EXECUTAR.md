# 🚀 Como executar a loja

## 1. Instalar dependências (já feito)
```bash
npm install
```

## 2. Executar o servidor
```bash
# Desenvolvimento (recomendado)
npm run dev

# Ou produção
npm start
```

## 3. Abrir no navegador
- Acesse: `http://localhost:3000`
- Adicione produtos ao carrinho
- Clique "Finalizar Compra"
- Teste o pagamento!

## 📋 Status atual:
- ✅ Backend Node.js funcionando
- ✅ Integração Mercado Pago ativa
- ✅ Webhook configurado
- ✅ Páginas de retorno prontas
- ✅ Credenciais configuradas

## 🔧 Para produção:
1. Configure as URLs no `.env` com seu domínio
2. Configure webhook no painel Mercado Pago
3. Faça deploy (Vercel, Railway, etc.)

## 💡 Teste rápido:
Execute `npm run dev` e acesse `http://localhost:3000/api/health` para ver se está funcionando.