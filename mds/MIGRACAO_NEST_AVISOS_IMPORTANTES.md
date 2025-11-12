# ⚠️ AVISOS IMPORTANTES - Migração NestJS

## 🚨 LEIA ANTES DE COMEÇAR

Este documento contém informações **CRÍTICAS** para evitar problemas durante a migração.

---

## 🔴 CRÍTICO - NÃO PULAR

### 1. ⚠️ .env.example não foi criado automaticamente

O arquivo `.env.example` **não pôde ser criado** porque está no `.gitignore`.

**VOCÊ PRECISA CRIAR MANUALMENTE:**

```bash
cd chinafacil-nest

# Criar .env.example
cat > .env.example << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chinafacil_nest?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this
REDIS_HOST=localhost
REDIS_PORT=6379
# ... copie do documento MIGRACAO_NEST_SETUP_FILES.md
EOF

# Depois copie para .env
cp .env.example .env
nano .env  # Edite com suas configurações
```

### 2. ⚠️ AuthModule e UsersModule não estão implementados

Os módulos `auth/` e `users/` têm apenas as **pastas criadas**, mas **SEM código**.

**VOCÊ PRECISA IMPLEMENTAR:**

Use os templates em `MIGRACAO_NEST_TEMPLATES.md` para criar:
- auth.module.ts
- auth.controller.ts
- auth.service.ts
- jwt.strategy.ts
- users.module.ts
- users.controller.ts
- users.service.ts

### 3. ⚠️ Prisma Client precisa ser gerado

Antes de rodar a aplicação:

```bash
# OBRIGATÓRIO
npm install
npm run prisma:generate
```

### 4. ⚠️ Database precisa existir

Crie o banco **ANTES** de rodar migrations:

```bash
# No PostgreSQL
createdb chinafacil_nest

# Ou via SQL
CREATE DATABASE chinafacil_nest;
```

### 5. ⚠️ Redis deve estar rodando

Para filas (Bull) funcionarem:

```bash
# Instalar Redis
sudo apt install redis-server

# Iniciar Redis
redis-server

# Ou via Docker
docker run -d -p 6379:6379 redis:7-alpine
```

---

## 🟡 IMPORTANTE - Evitar Problemas

### 6. Testes precisam de banco separado

```env
# Em .env.test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chinafacil_nest_test?schema=public"
```

### 7. Logs precisam de permissão

```bash
# Criar diretório de logs
mkdir -p logs
chmod 755 logs
```

### 8. Uploads precisam de diretório

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### 9. NODE_ENV deve ser configurado

```bash
# Desenvolvimento
export NODE_ENV=development

# Produção
export NODE_ENV=production
```

### 10. Porta 3000 deve estar livre

Se já tiver algo rodando na porta 3000:

```bash
# Altere no .env
PORT=3001
```

---

## 📝 Ordem Correta de Setup

### ✅ Sequência OBRIGATÓRIA

```bash
# 1. Entrar no projeto
cd chinafacil-nest

# 2. Criar .env
cp .env.example .env
nano .env  # Configure as variáveis

# 3. Instalar dependências
npm install

# 4. Gerar Prisma Client
npm run prisma:generate

# 5. Criar banco de dados
createdb chinafacil_nest

# 6. Rodar migrations
npm run prisma:migrate

# 7. (Opcional) Seed
npm run prisma:seed

# 8. Iniciar Redis
redis-server &

# 9. Iniciar aplicação
npm run start:dev
```

### ❌ O que NÃO fazer

```bash
# ❌ Não rode sem gerar Prisma Client
npm run start:dev  # Vai falhar!

# ❌ Não rode sem criar o banco
npm run prisma:migrate  # Vai falhar!

# ❌ Não rode sem .env
npm run start:dev  # Vai usar valores default errados
```

---

## 🔄 Problemas Comuns

### Erro: "Cannot find module '@prisma/client'"

**Solução:**
```bash
npm run prisma:generate
```

### Erro: "connect ECONNREFUSED 127.0.0.1:5432"

**Causa:** PostgreSQL não está rodando  
**Solução:**
```bash
sudo service postgresql start
```

### Erro: "connect ECONNREFUSED 127.0.0.1:6379"

**Causa:** Redis não está rodando  
**Solução:**
```bash
redis-server &
```

### Erro: "Port 3000 is already in use"

**Solução:**
```bash
# Opção 1: Mudar porta no .env
PORT=3001

# Opção 2: Matar processo
sudo lsof -ti:3000 | xargs kill -9
```

### Erro: "ENOENT: no such file or directory, open 'logs/...'"

**Solução:**
```bash
mkdir -p logs
chmod 755 logs
```

---

## 🧪 Testes - Como Escrever

### ✅ Testes Simples (Como você pediu)

```typescript
// test/integration/users.int-spec.ts

describe('Users API', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    prisma = module.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users', () => {
    it('should return 200', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .expect(200);
    });
  });

  describe('POST /api/users', () => {
    it('should return 201 and create in database', async () => {
      const dto = {
        name: 'Test User',
        email: 'test@test.com',
        password: '12345678',
      };

      // Verificar status
      await request(app.getHttpServer())
        .post('/api/users')
        .send(dto)
        .expect(201);

      // Verificar no banco
      const user = await prisma.user.findUnique({
        where: { email: dto.email },
      });
      expect(user).toBeDefined();
      expect(user.name).toBe(dto.name);

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 204 and delete from database', async () => {
      // Criar user para testar
      const user = await prisma.user.create({
        data: {
          name: 'To Delete',
          email: 'delete@test.com',
          password: 'hashed',
        },
      });

      // Deletar via API
      await request(app.getHttpServer())
        .delete(`/api/users/${user.id}`)
        .expect(204);

      // Verificar que foi deletado
      const deleted = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deleted).toBeNull();
    });
  });
});
```

### ❌ Testes Complexos (EVITAR)

```typescript
// ❌ NÃO faça testes muito complexos
it('should test entire business logic with mocks', () => {
  // Muito complexo para o escopo
});

// ✅ Mantenha simples
it('should return 200', async () => {
  await request(app).get('/api/users').expect(200);
});
```

---

## 📋 Logs Centralizados - Como Usar

### Acessar Interface Web

```
http://localhost:3000/api/logs
```

### Listar Arquivos de Log

```bash
GET /api/logs
```

Resposta:
```json
{
  "files": [
    "application-2025-11-12.log",
    "application-2025-11-13.log",
    "error-2025-11-12.log"
  ]
}
```

### Ver Conteúdo de um Log

```bash
GET /api/logs/application-2025-11-12.log
```

### Buscar Logs

```bash
GET /api/logs/search/query?q=error&level=error
```

### Limpar Logs (Admin)

```bash
DELETE /api/logs
```

### Logs Locais

```
chinafacil-nest/logs/
├── application-2025-11-12.log    # Logs gerais
├── error-2025-11-12.log          # Apenas erros
└── combined-2025-11-12.log       # Todos logs
```

---

## 🔐 Segurança - Checklist

### Antes de Deploy

- [ ] Trocar `JWT_SECRET` no .env
- [ ] Configurar CORS corretamente
- [ ] Habilitar Helmet (já está)
- [ ] Configurar rate limiting (já está)
- [ ] Validar todas variáveis de ambiente
- [ ] Não commitar .env
- [ ] Usar HTTPS em produção
- [ ] Configurar firewall

---

## 🚀 Deploy - Checklist

### Preparação

- [ ] Tests passando
- [ ] Build funcionando (`npm run build`)
- [ ] Migrations rodadas
- [ ] .env.production configurado
- [ ] Secrets configurados
- [ ] Banco de produção criado
- [ ] Redis de produção configurado

### Durante Deploy

- [ ] Rodar migrations
- [ ] Gerar Prisma Client
- [ ] Build da aplicação
- [ ] Iniciar aplicação
- [ ] Health check OK
- [ ] Logs funcionando
- [ ] Monitoramento ativo

---

## 📊 Monitoramento - O que Observar

### Logs

```bash
# Ver logs em tempo real
tail -f logs/application-$(date +%Y-%m-%d).log

# Ver apenas erros
tail -f logs/error-$(date +%Y-%m-%d).log
```

### Health Check

```bash
# Adicione endpoint de health
GET /api/health

# Resposta esperada
{
  "status": "ok",
  "database": "connected",
  "redis": "connected"
}
```

### Metrics

```bash
# Adicione endpoint de metrics
GET /api/metrics

# Resposta esperada
{
  "uptime": 12345,
  "requests": 1000,
  "errors": 5
}
```

---

## 🤝 Divisão de Trabalho - Evitar Conflitos

### Dev Sênior - Arquivos

```
src/
├── modules/
│   ├── products/      ← SÊNIOR
│   ├── solicitations/ ← SÊNIOR
│   ├── cart/          ← SÊNIOR
│   └── ai/            ← SÊNIOR
└── integrations/      ← SÊNIOR
```

### Dev Júnior - Arquivos

```
src/
├── modules/
│   ├── users/         ← JÚNIOR
│   ├── clients/       ← JÚNIOR
│   ├── plans/         ← JÚNIOR
│   └── notifications/ ← JÚNIOR
└── test/              ← JÚNIOR
```

### Regra de Ouro

**NUNCA trabalhar no mesmo arquivo simultaneamente!**

Se precisar:
1. Comunicar no daily
2. Fazer em horários diferentes
3. Pull request pequenos
4. Merge frequente

---

## 📞 Em Caso de Dúvida

### Durante Código

1. Consultar `MIGRACAO_NEST_EXEMPLOS_CODIGO.md`
2. Consultar `MIGRACAO_NEST_TEMPLATES.md`
3. Perguntar no daily sync
4. Pair programming

### Durante Setup

1. Consultar este documento (AVISOS_IMPORTANTES.md)
2. Consultar `MIGRACAO_NEST_SETUP_FILES.md`
3. Revisar ordem de setup
4. Verificar logs de erro

### Durante Testes

1. Manter testes simples
2. Verificar status code
3. Verificar banco de dados
4. Cleanup após testes

---

## ✅ Checklist Final Antes de Começar

- [ ] Li todos avisos importantes
- [ ] Entendi a ordem de setup
- [ ] Criei .env corretamente
- [ ] PostgreSQL instalado e rodando
- [ ] Redis instalado e rodando
- [ ] Node.js 18+ instalado
- [ ] npm install funcionou
- [ ] Prisma Client gerado
- [ ] Banco de dados criado
- [ ] Migrations rodadas
- [ ] Aplicação inicia sem erros
- [ ] Swagger acessível
- [ ] Logs funcionando
- [ ] Entendi como fazer testes simples
- [ ] Sei qual será minha parte (Sênior/Júnior)

---

## 🎯 Resumo dos Avisos

```
┌────────────────────────────────────────────────┐
│  CRÍTICO                                        │
├────────────────────────────────────────────────┤
│  1. Criar .env manualmente                     │
│  2. Implementar AuthModule e UsersModule       │
│  3. Gerar Prisma Client antes de rodar        │
│  4. Criar banco de dados primeiro             │
│  5. Redis rodando para filas                  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  IMPORTANTE                                     │
├────────────────────────────────────────────────┤
│  6. Banco separado para testes                │
│  7. Permissões em logs/                       │
│  8. Permissões em public/uploads/             │
│  9. NODE_ENV configurado                      │
│  10. Porta 3000 livre                          │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  SEGUIR ORDEM DE SETUP                         │
├────────────────────────────────────────────────┤
│  1. cd chinafacil-nest                         │
│  2. Criar .env                                 │
│  3. npm install                                │
│  4. prisma:generate                            │
│  5. Criar banco                                │
│  6. prisma:migrate                             │
│  7. Iniciar Redis                              │
│  8. npm run start:dev                          │
└────────────────────────────────────────────────┘
```

---

**LEIA COM ATENÇÃO E BOA SORTE! 🚀**

**Criado por:** Claude AI  
**Data:** 2025-11-12  
**Status:** ⚠️ AVISOS CRÍTICOS

