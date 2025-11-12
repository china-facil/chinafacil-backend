# ⚙️ Arquivos de Configuração - Setup Inicial NestJS

## 📝 Índice
1. [package.json](#1-packagejson)
2. [tsconfig.json](#2-tsconfigjson)
3. [.env.example](#3-envexample)
4. [docker-compose.yml](#4-docker-composeyml)
5. [Dockerfile](#5-dockerfile)
6. [.eslintrc.js](#6-eslintrcjs)
7. [.prettierrc](#7-prettierrc)
8. [nest-cli.json](#8-nest-clijson)
9. [.gitignore](#9-gitignore)
10. [GitHub Actions CI](#10-github-actions-ci)

---

## 1. package.json

```json
{
  "name": "chinafacil-backend-nest",
  "version": "1.0.0",
  "description": "ChinaFácil Backend - NestJS Migration",
  "author": "ChinaFácil Team",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate -d src/database/data-source.ts",
    "migration:run": "npm run typeorm -- migration:run -d src/database/data-source.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/database/data-source.ts",
    "seed": "ts-node src/database/seeders/run-seeders.ts",
    "cli": "nest-commander"
  },
  "dependencies": {
    "@nestjs/axios": "^3.0.1",
    "@nestjs/bull": "^10.0.1",
    "@nestjs/common": "^10.2.10",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.2.10",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.2.10",
    "@nestjs/swagger": "^7.1.16",
    "@nestjs/throttler": "^5.0.1",
    "@nestjs/typeorm": "^10.0.1",
    "axios": "^1.6.2",
    "bcrypt": "^5.1.1",
    "bull": "^4.12.0",
    "cache-manager": "^5.3.2",
    "cache-manager-redis-store": "^3.0.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "compression": "^1.7.4",
    "date-fns": "^2.30.0",
    "exceljs": "^4.4.0",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "nest-commander": "^3.12.0",
    "nest-winston": "^1.9.4",
    "nodemailer": "^6.9.7",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "pg": "^8.11.3",
    "pdfkit": "^0.14.0",
    "reflect-metadata": "^0.1.13",
    "rimraf": "^5.0.5",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.17",
    "uuid": "^9.0.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.2.1",
    "@nestjs/schematics": "^10.0.3",
    "@nestjs/testing": "^10.2.10",
    "@types/bcrypt": "^5.0.2",
    "@types/bull": "^4.10.0",
    "@types/compression": "^1.7.5",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.10.5",
    "@types/nodemailer": "^6.4.14",
    "@types/passport-jwt": "^3.0.13",
    "@types/passport-local": "^1.0.38",
    "@types/pdfkit": "^0.13.3",
    "@types/supertest": "^6.0.2",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.0.1",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.spec.ts",
      "!**/*.interface.ts",
      "!**/node_modules/**",
      "!**/dist/**"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

---

## 2. tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"],
      "@modules/*": ["src/modules/*"],
      "@common/*": ["src/common/*"],
      "@config/*": ["src/config/*"],
      "@database/*": ["src/database/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

---

## 3. .env.example

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
APP_NAME=ChinaFacil Backend

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=chinafacil_nest
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Bull Queue
QUEUE_PREFIX=chinafacil

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@chinafacil.com
MAIL_FROM_NAME=ChinaFacil

# External APIs - Alibaba/1688
TM_SERVICE_API_URL=https://your-tm-service-url.com
TM_SERVICE_API_KEY=your-tm-service-api-key
RAPIDAPI_KEY=your-rapidapi-key

# Translation Services
AZURE_TRANSLATOR_KEY=your-azure-translator-key
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
AZURE_TRANSLATOR_REGION=brazilsouth
GOOGLE_TRANSLATE_API_KEY=your-google-translate-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPEN_ROUTER_API_KEY=your-open-router-key

# CRM/Leads
GHL_TOKEN=your-gohighlevel-token
GHL_LOCATION_ID=your-ghl-location-id
N8N_WEBHOOK_URL=your-n8n-webhook-url

# SMS/OTP
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid

# Marketplace
MERCADO_LIVRE_API_URL=https://api.mercadolivre.com
MERCADO_LIVRE_ACCESS_TOKEN=your-ml-access-token

# Storage
STORAGE_TYPE=local
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Monitoring
NEW_RELIC_LICENSE_KEY=
NEW_RELIC_APP_NAME=ChinaFacil Backend

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs
```

---

## 4. docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: chinafacil_postgres
    restart: always
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: chinafacil_nest
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - chinafacil_network

  redis:
    image: redis:7-alpine
    container_name: chinafacil_redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - chinafacil_network

  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: chinafacil_app
    restart: always
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      DB_DATABASE: chinafacil_nest
      REDIS_HOST: redis
      REDIS_PORT: 6379
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - chinafacil_network
    command: npm run start:dev

volumes:
  postgres_data:
  redis_data:

networks:
  chinafacil_network:
    driver: bridge
```

---

## 5. Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Development stage
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]
```

---

## 6. .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
```

---

## 7. .prettierrc

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 8. nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false,
    "tsConfigPath": "tsconfig.json"
  },
  "generateOptions": {
    "spec": true,
    "flat": false
  }
}
```

---

## 9. .gitignore

```gitignore
# compiled output
/dist
/node_modules
/.pnp
.pnp.js

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Environment
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# Temp files
*.tmp
*.temp
temp/
tmp/

# Database
*.sqlite
*.db

# Uploads
uploads/
public/uploads/

# Cache
.cache

# Build
build/
```

---

## 10. GitHub Actions CI

### .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Check formatting
        run: npm run format -- --check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: chinafacil_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:cov
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
          DB_DATABASE: chinafacil_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check build size
        run: du -sh dist/

  e2e:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: chinafacil_e2e
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
          DB_DATABASE: chinafacil_e2e
          REDIS_HOST: localhost
          REDIS_PORT: 6379
```

---

## 📝 Como Usar

### 1. Iniciar Projeto
```bash
# Criar diretório
mkdir chinafacil-backend-nest
cd chinafacil-backend-nest

# Copiar package.json e instalar
npm install

# Copiar outros arquivos de configuração
# (.env.example, tsconfig.json, etc)

# Iniciar com Docker
docker-compose up -d

# Ou iniciar localmente
npm run start:dev
```

### 2. Setup Database
```bash
# Gerar migration
npm run migration:generate -- src/database/migrations/InitialMigration

# Rodar migrations
npm run migration:run

# Rodar seeders
npm run seed
```

### 3. Desenvolvimento
```bash
# Dev mode com hot reload
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod
```

### 4. Testes
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### 5. Linting
```bash
# Run linter
npm run lint

# Format code
npm run format
```

---

## ✅ Checklist de Setup

- [ ] Copiar todos arquivos de configuração
- [ ] Criar .env baseado no .env.example
- [ ] Instalar dependências (npm install)
- [ ] Iniciar Docker Compose
- [ ] Verificar conexão com DB
- [ ] Verificar conexão com Redis
- [ ] Rodar migrations
- [ ] Rodar seeders
- [ ] Testar endpoint /health
- [ ] Configurar GitHub Actions
- [ ] Setup CI/CD

---

**Criado por:** Claude AI  
**Data:** 2025-11-11  
**Versão:** 1.0


