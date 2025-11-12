# 🚀 Comandos de Execução - ChinaFácil NestJS

## 📋 Pré-requisitos

Certifique-se de ter instalado:
- Node.js 18+ 
- MySQL
- Redis (opcional, mas recomendado)

---

## 🔧 Setup Inicial (Primeira Vez)

### 1. Instalar Dependências

```bash
cd chinafacil-nest
npm install
```

### 2. Configurar Banco de Dados MySQL

```bash
# Criar banco de dados
mysql -e "CREATE DATABASE chinafacil

# Ou via mysql
mysql -U postgres
CREATE DATABASE chinafacil;
\q
```

### 3. Configurar Variáveis de Ambiente

O arquivo `.env` já está criado. Edite se necessário:

```bash
nano .env
```

**Importante:** Ajuste a `DATABASE_URL` se suas credenciais forem diferentes:
```
DATABASE_URL="mysql://SEU_USER:SUA_SENHA@localhost:3306/chinafacil?schema=public"
```

### 4. Gerar Prisma Client

```bash
npm run prisma:generate
```

### 5. Criar Tabelas no Banco (Migrations)

```bash
# Opção 1: Push (desenvolvimento rápido)
npx prisma db push

# Opção 2: Migrations (recomendado para produção)
npx prisma migrate dev --name init
```

---

## ▶️ Executar Aplicação

### Modo Desenvolvimento (Recomendado)

```bash
npm run start:dev
```

A aplicação iniciará em: **http://localhost:3000**

### Modo Produção

```bash
# Build
npm run build

# Executar
npm run start:prod
```

### Modo Debug

```bash
npm run start:debug
```

---

## 🧪 Executar Testes

### Teste de Integração (Health Check)

```bash
npm run test:int
```

### Todos os Testes

```bash
npm test
```

### Testes com Coverage

```bash
npm run test:cov
```

---

## 🔍 Verificar se está Funcionando

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T14:30:00.000Z",
  "uptime": 12.345,
  "database": "connected",
  "redis": "not-checked"
}
```

### 2. Swagger UI

Abra no navegador:
```
http://localhost:3000/api/docs
```

### 3. Logs Viewer

Abra no navegador:
```
http://localhost:3000/api/logs
```

---

## 🗄️ Comandos Prisma

### Ver Banco de Dados (Interface Visual)

```bash
npm run prisma:studio
```

Abrirá em: **http://localhost:5555**

### Gerar Migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Aplicar Migrations em Produção

```bash
npm run prisma:migrate:prod
```

### Reset Database (⚠️ CUIDADO - apaga tudo)

```bash
npx prisma migrate reset
```

---

## 📊 Outros Comandos Úteis

### Formatar Código

```bash
npm run format
```

### Linter

```bash
npm run lint
```

### Build

```bash
npm run build
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### Erro: "Port 3000 already in use"

```bash
# Opção 1: Matar processo na porta 3000
sudo lsof -ti:3000 | xargs kill -9

# Opção 2: Mudar porta no .env
PORT=3001
```

### Erro: Database connection failed

```bash
# Verificar se MySQL está rodando
sudo service mysql status

# Iniciar se não estiver
sudo service mysql start

# Verificar conexão
mysql -U postgres -d chinafacil -c "SELECT 1"
```

### Erro: Redis connection failed

Redis é opcional para testes. Se quiser usar:

```bash
# Instalar Redis
sudo apt install redis-server

# Iniciar
redis-server

# Ou via Docker
docker run -d -p 6379:6379 redis:7-alpine
```

---

## ✅ Checklist de Execução

- [ ] MySQL rodando
- [ ] Banco `chinafacil` criado
- [ ] `npm install` executado
- [ ] `npm run prisma:generate` executado
- [ ] Migrations aplicadas (`npx prisma db push` ou `prisma migrate dev`)
- [ ] `.env` configurado
- [ ] `npm run start:dev` iniciado
- [ ] `curl http://localhost:3000/api/health` retorna 200
- [ ] Swagger acessível em `/api/docs`
- [ ] Testes passando (`npm run test:int`)

---

## 🚀 Quick Start (Copiar e Colar)

```bash
# 1. Entrar no projeto
cd chinafacil-nest

# 2. Instalar dependências
npm install

# 3. Criar banco (se ainda não criou)
mysql -e "CREATE DATABASE chinafacil

# 4. Gerar Prisma Client
npm run prisma:generate

# 5. Aplicar migrations
npx prisma db push

# 6. Iniciar aplicação
npm run start:dev

# 7. Em outro terminal, testar health
curl http://localhost:3000/api/health

# 8. Rodar testes
npm run test:int
```

---

## 📱 URLs Importantes

| Recurso | URL |
|---------|-----|
| API Base | http://localhost:3000/api |
| Health Check | http://localhost:3000/api/health |
| Swagger Docs | http://localhost:3000/api/docs |
| Logs Viewer | http://localhost:3000/api/logs |
| Prisma Studio | http://localhost:5555 (após `npm run prisma:studio`) |

---

## 🎉 Pronto!

Se tudo funcionar corretamente, você verá:

```
🚀 Application is running on: http://localhost:3000
📚 Swagger docs: http://localhost:3000/api/docs
📋 Logs viewer: http://localhost:3000/api/logs
```

E o teste de health deve passar:

```bash
$ npm run test:int

Health API (Integration)
  GET /api/health
    ✓ should return 200 status code
    ✓ should return health status with required fields
    ✓ should return valid timestamp
    ✓ should return numeric uptime

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

**Aplicação pronta para desenvolvimento! 🚀**

