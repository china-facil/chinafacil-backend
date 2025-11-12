# 🧪 Teste Rápido - Verificar se está Funcionando

## 🚀 Opção 1: Script Automático (MAIS FÁCIL)

Execute um único comando que faz tudo:

```bash
bash PASSO_A_PASSO_EXECUCAO.sh
```

Este script irá:
1. ✅ Verificar Node.js
2. ✅ Instalar dependências
3. ✅ Criar banco de dados
4. ✅ Gerar Prisma Client
5. ✅ Criar tabelas
6. ✅ Rodar testes
7. ✅ Iniciar aplicação

---

## ⚡ Opção 2: Comandos Manuais (Rápido)

Se preferir executar manualmente:

```bash
# 1. Instalar
npm install

# 2. Criar banco (se não existir)
mysql -e "CREATE DATABASE chinafacil

# 3. Setup Prisma
npm run prisma:generate
npx prisma db push

# 4. Testar
npm run test:int

# 5. Rodar
npm run start:dev
```

---

## ✅ Validações

### 1. Aplicação iniciou corretamente?

Você deve ver:

```
🚀 Application is running on: http://localhost:3000
📚 Swagger docs: http://localhost:3000/api/docs
📋 Logs viewer: http://localhost:3000/api/logs
```

### 2. Health check funciona?

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T...",
  "uptime": 1.234,
  "database": "connected",
  "redis": "not-checked"
}
```

### 3. Swagger funciona?

Abra: http://localhost:3000/api/docs

Você deve ver a documentação com o endpoint `/api/health`

### 4. Testes passam?

```bash
npm run test:int
```

Deve passar 4 testes:
```
✓ should return 200 status code
✓ should return health status with required fields
✓ should return valid timestamp
✓ should return numeric uptime
```

---

## 🐛 Se Algo Der Errado

### Erro: "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### Erro: Database connection

```bash
# Verificar se MySQL está rodando
sudo service mysql status

# Iniciar
sudo service mysql start

# Criar banco
mysql -e "CREATE DATABASE chinafacil
```

### Erro: Port 3000 in use

```bash
# Matar processo
sudo lsof -ti:3000 | xargs kill -9
```

### Erro: npm install falhou

```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Checklist Final

- [ ] `npm install` executou sem erros
- [ ] Banco `chinafacil` existe
- [ ] `npm run prisma:generate` funcionou
- [ ] `npx prisma db push` criou tabelas
- [ ] `npm run test:int` passou (4/4 testes)
- [ ] `npm run start:dev` iniciou aplicação
- [ ] `curl http://localhost:3000/api/health` retorna 200
- [ ] http://localhost:3000/api/docs abre Swagger

---

## 🎉 Tudo OK?

Se todos os itens acima funcionarem, **PARABÉNS!** 🎊

Seu backend NestJS está:
- ✅ Funcionando
- ✅ Conectado ao banco
- ✅ Com testes passando
- ✅ Documentado no Swagger
- ✅ Pronto para desenvolvimento

**Próximo passo:** Começar a implementar os módulos de negócio! 🚀

