# 🗄️ Configuração do Banco de Dados

## ✅ CONFIGURAÇÃO ATUAL

### PostgreSQL - Localhost

```
Host:     localhost
Porta:    5432
Database: chinafacil
Schema:   public
User:     postgres
Password: postgres
```

### Connection String

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chinafacil?schema=public"
```

Esta configuração está em:
- `.env` (arquivo principal)
- `prisma/schema.prisma` (lê do .env)

---

## 🔧 USAR O MESMO BANCO DO PHP

### Opção 1: Compartilhar o Banco (Recomendado para Transição)

Durante a migração, você pode usar o **mesmo banco** para PHP e NestJS:

```bash
# O NestJS vai usar o banco existente "chinafacil"
# As tabelas já existentes do PHP continuam funcionando
# Prisma cria/atualiza apenas o que precisa
```

**Vantagens:**
- ✅ Dados compartilhados entre PHP e NestJS
- ✅ Migração progressiva
- ✅ Rollback fácil

**Atenção:**
- ⚠️ Faça backup antes: `pg_dump chinafacil > backup.sql`
- ⚠️ Teste em desenvolvimento primeiro

### Opção 2: Banco Separado (Recomendado para Produção)

Criar um banco novo apenas para NestJS:

```bash
# Criar banco novo
createdb chinafacil_nest

# Atualizar .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chinafacil_nest?schema=public"
```

---

## 📋 VERIFICAR CONEXÃO

### 1. Verificar se PostgreSQL está rodando

```bash
sudo service postgresql status
```

Se não estiver:
```bash
sudo service postgresql start
```

### 2. Verificar se o banco existe

```bash
psql -U postgres -l | grep chinafacil
```

Resultado esperado:
```
 chinafacil | postgres | UTF8
```

### 3. Testar conexão

```bash
psql -U postgres -d chinafacil -c "SELECT version();"
```

### 4. Ver tabelas existentes

```bash
psql -U postgres -d chinafacil -c "\dt"
```

---

## 🔄 MIGRAR ESTRUTURA

### Se o banco já existe (do PHP)

```bash
# Prisma vai detectar as tabelas e propor migrations
npx prisma db pull

# Revisar o schema gerado
cat prisma/schema.prisma

# Aplicar mudanças necessárias
npx prisma db push
```

### Se o banco está vazio

```bash
# Prisma cria todas as tabelas
npx prisma db push
```

---

## 🛠️ COMANDOS ÚTEIS

### Criar Banco

```bash
createdb chinafacil
```

### Dropar Banco (⚠️ CUIDADO)

```bash
dropdb chinafacil
```

### Backup

```bash
# Fazer backup
pg_dump -U postgres chinafacil > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres chinafacil < backup_20251112.sql
```

### Ver Connection String atual

```bash
cat .env | grep DATABASE_URL
```

### Testar conexão via Prisma

```bash
npx prisma db execute --stdin <<< "SELECT 1;"
```

---

## 📊 COMPATIBILIDADE PHP ↔ NestJS

### Tabelas Compatíveis

O Prisma Schema foi criado para ser **100% compatível** com as tabelas do Laravel:

| Laravel Migration | Prisma Model | Compatível |
|-------------------|--------------|------------|
| `users` | User | ✅ Sim |
| `clients` | Client | ✅ Sim |
| `solicitations` | Solicitation | ✅ Sim |
| `carts` | Cart | ✅ Sim |
| `plans` | Plan | ✅ Sim |
| etc. | etc. | ✅ Sim |

### Diferenças de Naming

Laravel usa `snake_case`, Prisma usa `camelCase` nas propriedades:

**No banco (igual):**
```sql
created_at, updated_at, user_id
```

**No código:**
- **PHP:** `$user->created_at`
- **NestJS:** `user.createdAt` (Prisma converte automaticamente)

---

## 🚨 TROUBLESHOOTING

### Erro: "database does not exist"

```bash
createdb chinafacil
```

### Erro: "password authentication failed"

Edite `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://SEU_USER:SUA_SENHA@localhost:5432/chinafacil?schema=public"
```

### Erro: "could not connect to server"

```bash
# Iniciar PostgreSQL
sudo service postgresql start

# Verificar status
sudo service postgresql status
```

### Erro: "permission denied"

```bash
# Dar permissões ao usuário
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE chinafacil TO postgres;
\q
```

---

## 🎯 RECOMENDAÇÃO PARA MIGRAÇÃO

### Durante Desenvolvimento/Migração

1. ✅ **Use o mesmo banco** (`chinafacil`)
2. ✅ Faça backup antes de qualquer mudança
3. ✅ Teste em ambiente local primeiro
4. ✅ Prisma e Laravel podem coexistir

### Para Produção

1. ✅ Considere banco separado (`chinafacil_nest`)
2. ✅ Replique dados conforme necessário
3. ✅ Planeje cutover progressivo
4. ✅ Mantenha backups frequentes

---

**Configuração atual:** ✅ `localhost:5432/chinafacil`

