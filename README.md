# 🚀 ChinaFácil Backend - NestJS

Backend do ChinaFácil migrado de PHP/Laravel para NestJS com Prisma.

## 📦 Tecnologias

- **NestJS** 10.x - Framework Node.js
- **Prisma** 5.x - ORM
- **PostgreSQL** - Database
- **Redis** - Cache e filas
- **Bull** - Background jobs
- **JWT** - Autenticação
- **Swagger** - Documentação automática
- **Winston** - Logging centralizado

## 🏗️ Estrutura do Projeto

```
src/
├── modules/              # Módulos de domínio
│   ├── auth/            # Autenticação
│   ├── users/           # Usuários
│   ├── products/        # Produtos
│   └── ...
├── integrations/         # APIs externas
├── jobs/                 # Background jobs
├── database/             # Prisma
├── common/               # Compartilhado
└── config/               # Configurações
```

## 🚀 Como Rodar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar .env

```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3. Setup Database

```bash
# Gerar Prisma Client
npm run prisma:generate

# Rodar migrations
npm run prisma:migrate

# (Opcional) Seed inicial
npm run prisma:seed
```

### 4. Iniciar Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 Documentação

- **Swagger:** http://localhost:3000/api/docs
- **Logs Viewer:** http://localhost:3000/api/logs

## 🧪 Testes

```bash
# Testes de integração
npm run test:int

# Com coverage
npm run test:cov
```

## 📋 Scripts Úteis

```bash
# Prisma Studio (interface visual)
npm run prisma:studio

# Gerar migration
npx prisma migrate dev --name nome_da_migration

# CLI Commands
npm run cli <comando>
```

## 🔧 Desenvolvimento

### Adicionar Novo Módulo

```bash
nest g module modules/nome
nest g controller modules/nome
nest g service modules/nome
```

### Estrutura de um Módulo

```
modules/nome/
├── nome.module.ts
├── nome.controller.ts
├── nome.service.ts
├── dto/
│   ├── create-nome.dto.ts
│   └── update-nome.dto.ts
└── entities/
    └── nome.entity.ts (se usar TypeORM)
```

## 📝 Convenções

- **Rotas:** `/api/recurso`
- **DTOs:** Validação com class-validator
- **Errors:** HttpException personalizado
- **Logs:** Winston com rotação diária
- **Tests:** Jest (integração simples)

## 🔐 Autenticação

```bash
# Login
POST /api/auth/login
{ "email": "user@example.com", "password": "password" }

# Usar token
Authorization: Bearer <token>
```

## 📊 Monitoramento

- **Logs:** `/api/logs` (interface web)
- **Health:** `/api/health`
- **Metrics:** `/api/metrics`
- **Sentry:** Monitoramento de erros
- **New Relic:** APM e Performance


## 🤝 Contribuindo

1. Criar feature branch
2. Fazer mudanças
3. Escrever testes
4. PR para `develop`

## 📄 Licença

Propriedade da ChinaFácil

# chinafacil-backend
