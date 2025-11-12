# ⚡ GUIA RÁPIDO - NestJS Backend

## 🎯 EXECUTAR AGORA (Copy & Paste)

```bash
cd chinafacil-nest
bash PASSO_A_PASSO_EXECUCAO.sh
```

**Pronto!** Em ~2 minutos sua aplicação estará rodando.

---

## 🔍 O QUE FOI CRIADO

### ✅ Backend NestJS Completo

```
✅ Estrutura de 96+ diretórios
✅ 19 arquivos TypeScript
✅ Health endpoint (/api/health)
✅ Teste de integração Jest
✅ Swagger em /api/docs
✅ Logs centralizados em /api/logs
✅ Prisma com 20+ models
✅ Script automático de setup
```

### 🏥 Health Endpoint

**URL:** `GET /api/health`

**Teste:**
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T14:30:00.000Z",
  "uptime": 12.345,
  "database": "connected",
  "redis": "not-checked"
}
```

**Swagger:** http://localhost:3000/api/docs

**Teste Jest:** `npm run test:int` (4 testes)

---

## 📋 COMANDOS PRINCIPAIS

### Setup (primeira vez)

```bash
cd chinafacil-nest
npm install
npm run prisma:generate
npx prisma db push
```

### Rodar aplicação

```bash
npm run start:dev
```

### Rodar testes

```bash
npm run test:int
```

### Acessar

- **API:** http://localhost:3000
- **Health:** http://localhost:3000/api/health
- **Swagger:** http://localhost:3000/api/docs
- **Logs:** http://localhost:3000/api/logs

---

## 📊 VALIDAR FUNCIONAMENTO

### ✅ Checklist Rápido

```bash
# 1. Health retorna 200
curl -s http://localhost:3000/api/health | grep "ok"

# 2. Testes passam
npm run test:int

# 3. Swagger abre
# Abrir: http://localhost:3000/api/docs
```

---

## 📂 ARQUIVOS IMPORTANTES

**No diretório `chinafacil-nest/`:**

| Arquivo | Descrição |
|---------|-----------|
| `PASSO_A_PASSO_EXECUCAO.sh` | ⚡ Script automático |
| `README_EXECUCAO.md` | 📖 Guia completo |
| `TESTE_RAPIDO.md` | 🧪 Como testar |
| `COMANDOS_EXECUCAO.md` | 📋 Todos comandos |
| `.env` | ⚙️ Configurações |

**No diretório raiz (chinafacil-web/):**

| Arquivo | Descrição |
|---------|-----------|
| `MIGRACAO_NEST_README.md` | 📚 Índice geral |
| `MIGRACAO_NEST_ANALISE.md` | 🔍 Análise completa |
| `MIGRACAO_NEST_CHECKLIST_DETALHADO.md` | ✅ Tarefas |
| `MIGRACAO_NEST_EXEMPLOS_CODIGO.md` | 💻 Exemplos |
| `RESUMO_FINAL_MIGRACAO.md` | 📊 Resumo |

---

## 🚀 COMEÇAR AGORA

### Opção 1: Script Automático (MAIS FÁCIL)

```bash
cd chinafacil-nest
bash PASSO_A_PASSO_EXECUCAO.sh
```

### Opção 2: Manual (se preferir)

```bash
cd chinafacil-nest
npm install
npm run prisma:generate
npx prisma db push
npm run start:dev
```

### Verificar

```bash
curl http://localhost:3000/api/health
```

Deve retornar:
```json
{"status":"ok",...}
```

---

## ✅ PRONTO!

Seu backend NestJS está:
- ✅ Rodando
- ✅ Testado
- ✅ Documentado
- ✅ Pronto para desenvolvimento

**Próximo passo:** Implementar módulos de negócio seguindo o plano em `MIGRACAO_NEST_CHECKLIST_DETALHADO.md`

---

## 🆘 AJUDA RÁPIDA

### Erro de conexão com banco?

```bash
sudo service postgresql start
createdb chinafacil_nest
```

### Erro "Cannot find module"?

```bash
npm run prisma:generate
```

### Porta 3000 em uso?

```bash
sudo lsof -ti:3000 | xargs kill -9
```

### Mais ajuda?

Consulte: `chinafacil-nest/README_EXECUCAO.md`

---

**BOA SORTE! 🚀**

