# 📋 Arquivos e Pastas Faltando

## ❌ FALTANDO (precisam ser criados)

### 1. Actions/Fortify → auth/strategies/

No Laravel: `app/Actions/Fortify/` (5 arquivos)
No NestJS: `src/modules/auth/strategies/` (pasta existe, mas SEM arquivos)

**Faltam:**
- [ ] `jwt.strategy.ts` - Estratégia JWT
- [ ] `local.strategy.ts` - Estratégia local (login)

### 2. Http/Resources → NestJS não usa, mas precisa de DTOs

No Laravel: `app/Http/Resources/` (15 arquivos)
No NestJS: Usar DTOs de response

**Faltam em vários módulos:**
- [ ] Response DTOs para todas as entidades

### 3. Notifications → módulo existe mas vazio

No Laravel: `app/Notifications/` (3 arquivos)
No NestJS: `src/modules/notifications/` (apenas estrutura)

**Faltam:**
- [ ] `notifications.module.ts`
- [ ] `notifications.controller.ts`
- [ ] `notifications.service.ts`

### 4. Observers → pasta existe mas vazia

No Laravel: `app/Observers/` (3 arquivos)
No NestJS: `src/modules/solicitations/observers/` (vazia)

**Faltam:**
- [ ] Observers/Subscribers do Prisma

### 5. Providers → config/ no NestJS

No Laravel: `app/Providers/` (6 arquivos)
No NestJS: `src/config/` (pasta vazia)

**Faltam:**
- [ ] `configuration.ts` - Config central
- [ ] `database.config.ts` - Config DB
- [ ] `redis.config.ts` - Config Redis
- [ ] `jwt.config.ts` - Config JWT

### 6. Data → contextos de IA

No Laravel: `app/Data/` (contextos do concierge)
No NestJS: `src/modules/ai/` (vazia)

**Faltam:**
- [ ] `ai.module.ts`
- [ ] `ai.controller.ts`
- [ ] `ai.service.ts`
- [ ] DTOs de contexto

### 7. Exports → módulo existe mas vazio

No Laravel: `app/Exports/` (1 arquivo)
No NestJS: `src/modules/exports/` (vazia)

**Faltam:**
- [ ] `exports.module.ts`
- [ ] `exports.controller.ts`
- [ ] `exports.service.ts`

### 8. Mail → pasta existe mas vazia

No Laravel: `app/Mail/` (4 arquivos)
No NestJS: `src/mail/` (pasta existe, vazia)

**Faltam:**
- [ ] `mail.module.ts`
- [ ] `mail.service.ts`
- [ ] Templates de email

### 9. CLI Commands → pasta existe mas vazia

No Laravel: `app/Console/Commands/` (7 comandos)
No NestJS: `src/cli/commands/` (vazia)

**Faltam todos os 7 comandos:**
- [ ] `check-expired-subscriptions.command.ts`
- [ ] `cleanup-temp-images.command.ts`
- [ ] `clear-product-cache.command.ts`
- [ ] `process-catalog.command.ts`
- [ ] `confirm-product-similarity.command.ts`
- [ ] `populate-cnpj-data.command.ts`
- [ ] `update-sales-quantity.command.ts`

### 10. Helpers → pasta existe mas vazia

No Laravel: `app/Helpers/` (StringHelper)
No NestJS: `src/common/helpers/` (vazia)

**Faltam:**
- [ ] `string.helper.ts`
- [ ] Outros helpers utilitários

### 11. Módulos vazios

**Todos precisam de implementação:**

- [ ] `src/modules/clients/` - Cliente module/controller/service
- [ ] `src/modules/solicitations/` - Solicitações completas
- [ ] `src/modules/products/` - Produtos completos
- [ ] `src/modules/cart/` - Carrinho completo
- [ ] `src/modules/plans/` - Planos completos
- [ ] `src/modules/tax-calculator/` - Calculadora completa
- [ ] `src/modules/statistics/` - Estatísticas completas
- [ ] `src/modules/settings/` - Configurações completas
- [ ] `src/modules/webhooks/` - Webhooks completos
- [ ] `src/modules/leads/` - Leads completos

### 12. Integrações vazias

**Todas as pastas existem mas SEM arquivos:**

- [ ] `src/integrations/alibaba/` - TM e OT services
- [ ] `src/integrations/translation/` - Azure e Google
- [ ] `src/integrations/ai-providers/` - OpenAI e OpenRouter
- [ ] `src/integrations/crm/` - GoHighLevel e N8N
- [ ] `src/integrations/sms/` - Twilio/OTP
- [ ] `src/integrations/marketplace/` - Mercado Livre

### 13. Jobs vazios

**Pasta existe mas SEM processors:**

- [ ] `src/jobs/processors/catalog.processor.ts`
- [ ] `src/jobs/processors/email.processor.ts`
- [ ] `src/jobs/processors/export.processor.ts`
- [ ] `src/jobs/processors/lead.processor.ts`
- [ ] `src/jobs/processors/product-similarity.processor.ts`

---

## ✅ JÁ CRIADOS (funcionando)

- [x] `src/main.ts` - Entry point
- [x] `src/app.module.ts` - Root module
- [x] `src/database/prisma.service.ts` - Prisma
- [x] `src/common/filters/all-exceptions.filter.ts`
- [x] `src/common/interceptors/logging.interceptor.ts`
- [x] `src/common/interceptors/transform.interceptor.ts`
- [x] `src/common/logs/` - Sistema de logs (completo)
- [x] `src/modules/health/` - Health check (completo)
- [x] `src/modules/auth/` - Estrutura (mas sem implementação)
- [x] `src/modules/users/` - Estrutura (mas sem implementação)
- [x] `prisma/schema.prisma` - Schema completo (20+ models)
- [x] `test/integration/health.int-spec.ts` - Teste health

---

## 🎯 RESUMO

### Total PHP
```
Controllers: 25
Models: 20
Services: 17
Jobs: 13
Commands: 7
Middlewares: 13
Resources: 15
Notifications: 3
Observers: 3
Mail: 4
Actions: 5
```

### Total NestJS Criado
```
Arquivos .ts funcionando: 19
Módulos completos: 2 (health, logs)
Módulos estruturados: 15
Integrações estruturadas: 6
```

### Ainda Falta Implementar
```
~180 arquivos .ts para atingir paridade com PHP
```

---

## 💡 NOTA

**Isso é NORMAL e ESPERADO!**

A estrutura foi criada para facilitar a migração progressiva. Os arquivos devem ser implementados conforme o plano de migração em `MIGRACAO_NEST_CHECKLIST_DETALHADO.md`.

**Não criar tudo agora porque:**
1. Muitos arquivos precisam de lógica de negócio
2. Integrações precisam de credenciais
3. Deve ser feito progressivamente (1 mês)
4. Seguir checklist de prioridade

**O que foi criado já permite:**
- ✅ Rodar aplicação
- ✅ Testar health
- ✅ Ver Swagger
- ✅ Começar desenvolvimento
- ✅ Seguir estrutura planejada

