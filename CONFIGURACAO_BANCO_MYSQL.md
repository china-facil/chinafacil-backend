# 🗄️ Configuração do Banco de Dados MySQL

## ✅ CONFIGURAÇÃO ATUAL

### MySQL - Localhost

```
Host:     localhost
Porta:    3306
Database: chinafacil
User:     root
Password: a1542321
```

### Connection String

```
DATABASE_URL="mysql://root:a1542321@localhost:3306/chinafacil"
```

Esta configuração está em:
- `.env` (arquivo principal)
- `prisma/schema.prisma` (provider: "mysql")

---

## 🔧 USAR O MESMO BANCO DO PHP

Durante a migração, você pode usar o **mesmo banco MySQL** para PHP e NestJS:

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
- ⚠️ Faça backup antes: `mysqldump -u root -p chinafacil > backup.sql`
- ⚠️ Teste em desenvolvimento primeiro

---

## 📋 VERIFICAR CONEXÃO

### 1. Verificar se MySQL está rodando

```bash
sudo service mysql status
```

Se não estiver:
```bash
sudo service mysql start
```

### 2. Verificar se o banco existe

```bash
mysql -u root -pa1542321 -e "SHOW DATABASES LIKE 'chinafacil';"
```

Resultado esperado:
```
+----------------------+
| Database (chinafacil)|
+----------------------+
| chinafacil           |
+----------------------+
```

### 3. Testar conexão

```bash
mysql -u root -pa1542321 chinafacil -e "SELECT 1;"
```

### 4. Ver tabelas existentes

```bash
mysql -u root -pa1542321 chinafacil -e "SHOW TABLES;"
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
mysql -u root -pa1542321 -e "CREATE DATABASE chinafacil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Dropar Banco (⚠️ CUIDADO)

```bash
mysql -u root -pa1542321 -e "DROP DATABASE chinafacil;"
```

### Backup

```bash
# Fazer backup
mysqldump -u root -pa1542321 chinafacil > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root -pa1542321 chinafacil < backup_20251112.sql
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

### Prisma com MySQL

O Prisma funciona perfeitamente com MySQL e é **100% compatível** com as tabelas do Laravel:

| Laravel Migration | Prisma Model | Compatível |
|-------------------|--------------|------------|
| `users` | User | ✅ Sim |
| `clients` | Client | ✅ Sim |
| `solicitations` | Solicitation | ✅ Sim |
| `carts` | Cart | ✅ Sim |
| `plans` | Plan | ✅ Sim |

### Diferenças MySQL vs PostgreSQL

**Características do MySQL:**
- ✅ Melhor performance para leitura
- ✅ Mais simples de configurar
- ✅ Menor uso de recursos
- ⚠️ Menos features avançadas que PostgreSQL

**Prisma com MySQL:**
- ✅ Suporte completo
- ✅ Migrations funcionam perfeitamente
- ✅ Relacionamentos complexos suportados

---

## 🚨 TROUBLESHOOTING

### Erro: "Can't connect to MySQL server"

```bash
# Iniciar MySQL
sudo service mysql start

# Verificar status
sudo service mysql status
```

### Erro: "Access denied for user 'root'@'localhost'"

Suas credenciais:
- User: `root`
- Password: `a1542321`

Verifique se estão corretas no `.env`:
```env
DATABASE_URL="mysql://root:a1542321@localhost:3306/chinafacil"
```

### Erro: "Unknown database 'chinafacil'"

```bash
mysql -u root -pa1542321 -e "CREATE DATABASE chinafacil;"
```

### Erro: "Connection timeout"

```bash
# Verificar se MySQL está escutando
sudo netstat -tlnp | grep 3306

# Verificar firewall
sudo ufw allow 3306
```

---

## 🎯 RECOMENDAÇÃO

### Durante Desenvolvimento/Migração

1. ✅ **Use o mesmo banco MySQL** (`chinafacil`)
2. ✅ Faça backup antes: `mysqldump -u root -pa1542321 chinafacil > backup.sql`
3. ✅ Teste localmente primeiro
4. ✅ Prisma e Laravel podem coexistir no mesmo banco MySQL

---

## 📝 PRISMA SCHEMA

O arquivo `prisma/schema.prisma` foi configurado para MySQL:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

---

**Configuração atual:** ✅ `mysql://root@localhost:3306/chinafacil`

