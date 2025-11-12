# 🧪 Teste Rápido - MySQL

## ✅ Verificar Configuração MySQL

### 1. MySQL está rodando?

```bash
sudo service mysql status
```

**Resultado esperado:** `Active: active (running)`

Se não estiver:
```bash
sudo service mysql start
```

### 2. Banco existe?

```bash
mysql -u root -pa1542321 -e "SHOW DATABASES LIKE 'chinafacil';"
```

**Resultado esperado:**
```
+----------------------+
| Database (chinafacil)|
+----------------------+
| chinafacil           |
+----------------------+
```

Se não existir:
```bash
mysql -u root -pa1542321 -e "CREATE DATABASE chinafacil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Conexão funciona?

```bash
mysql -u root -pa1542321 chinafacil -e "SELECT 1 AS test;"
```

**Resultado esperado:**
```
+------+
| test |
+------+
|    1 |
+------+
```

### 4. Ver tabelas existentes

```bash
mysql -u root -pa1542321 chinafacil -e "SHOW TABLES;"
```

---

## 🚀 Executar Setup

### Opção 1: Script Automático

```bash
cd chinafacil-nest
bash PASSO_A_PASSO_EXECUCAO.sh
```

### Opção 2: Manual

```bash
cd chinafacil-nest

# 1. Instalar
npm install

# 2. Verificar banco
mysql -u root -pa1542321 -e "CREATE DATABASE IF NOT EXISTS chinafacil;"

# 3. Gerar Prisma Client
npm run prisma:generate

# 4. Aplicar schema
npx prisma db push

# 5. Testar
npm run test:int

# 6. Rodar
npm run start:dev
```

---

## ✅ Validar Aplicação

### 1. Health check

```bash
curl http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T...",
  "uptime": 1.234,
  "database": "connected"
}
```

### 2. Swagger

Abrir: http://localhost:3000/api/docs

### 3. Logs

Abrir: http://localhost:3000/api/logs

---

## 🐛 Troubleshooting MySQL

### Erro: Can't connect to MySQL server

```bash
# Verificar status
sudo service mysql status

# Iniciar
sudo service mysql start

# Verificar porta
sudo netstat -tlnp | grep 3306
```

### Erro: Access denied

Credenciais configuradas:
- User: `root`
- Password: `a1542321`

Verificar `.env`:
```bash
cat .env | grep DATABASE_URL
```

Deve mostrar:
```
DATABASE_URL="mysql://root:a1542321@localhost:3306/chinafacil"
```

### Erro: Unknown database

```bash
mysql -u root -pa1542321 -e "CREATE DATABASE chinafacil;"
```

### Erro: Too many connections

```bash
mysql -u root -pa1542321 -e "SHOW PROCESSLIST;"
mysql -u root -pa1542321 -e "SET GLOBAL max_connections = 200;"
```

---

## 📊 Comandos Úteis MySQL

### Ver usuários

```bash
mysql -u root -pa1542321 -e "SELECT User, Host FROM mysql.user;"
```

### Ver bancos

```bash
mysql -u root -pa1542321 -e "SHOW DATABASES;"
```

### Ver variáveis

```bash
mysql -u root -pa1542321 -e "SHOW VARIABLES LIKE 'version';"
```

### Backup

```bash
mysqldump -u root -pa1542321 chinafacil > backup.sql
```

### Restore

```bash
mysql -u root -pa1542321 chinafacil < backup.sql
```

---

## ✅ Checklist

- [ ] MySQL instalado e rodando
- [ ] Banco `chinafacil` existe
- [ ] Conexão funciona (teste SELECT 1)
- [ ] `npm install` ok
- [ ] `npm run prisma:generate` ok
- [ ] `npx prisma db push` ok
- [ ] `npm run test:int` passou
- [ ] `npm run start:dev` iniciou
- [ ] Health check retorna 200
- [ ] Swagger acessível

---

**Tudo OK? Pode começar a desenvolver! 🚀**

