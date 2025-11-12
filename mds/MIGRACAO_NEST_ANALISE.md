# 📋 Análise Completa do Backend e Plano de Migração para NestJS

## 🏗️ 1. ESTRUTURA ATUAL DO BACKEND PHP/LARAVEL

### 📂 1.1 Visão Geral da Estrutura de Diretórios

```
app/
├── Actions/Fortify/          # 5 arquivos - Ações de autenticação Fortify
├── Console/Commands/         # 7 comandos CLI
├── Data/                     # 1 arquivo - Contextos de Concierge
├── Exceptions/               # 1 arquivo - Handler de exceções global
├── Exports/                  # 1 arquivo - Exportação de arrays
├── Helpers/                  # 1 arquivo - StringHelper
├── Http/
│   ├── Controllers/          # 25 controllers
│   │   └── Api/             # 1 controller
│   ├── Middleware/          # 13 middlewares
│   └── Resources/           # 15 resources (API Resources)
├── Jobs/                    # 13 jobs de fila
├── Mail/                    # 4 classes de email
├── Models/                  # 20 models
├── Notifications/           # 3 notificações
├── Observers/               # 3 observers
├── Providers/               # 6 providers
└── Services/                # 17 services
    └── ProductNormalizer/   # 4 arquivos

database/
├── factories/               # 1 factory
├── migrations/             # 60 migrations
└── seeders/                # 4 seeders + 1 JSON

routes/
├── api.php                 # Rotas API principais
├── web.php                 # Rotas web
├── channels.php            # Broadcast channels
└── console.php             # Comandos console
```

---

## 📦 1.2 INVENTÁRIO DETALHADO DE ARQUIVOS

### 🎮 Controllers (25 arquivos)

#### Controllers Principais
1. **AIController.php** - Assistente de IA/Concierge
2. **BoardingTypesController.php** - Tipos de embarque
3. **CalculatorUserController.php** - Usuários da calculadora de impostos
4. **CartController.php** - Gerenciamento de carrinho
5. **ClientsController.php** - Gerenciamento de clientes
6. **Controller.php** - Controller base
7. **ExportController.php** - Exportação de dados
8. **FavoriteProductController.php** - Produtos favoritos
9. **NotificationsController.php** - Notificações
10. **PlanController.php** - Planos de assinatura
11. **ProductCatalogController.php** - Catálogo de produtos
12. **ProductsController.php** - Busca e detalhes de produtos (MAIOR - 3952 linhas)
13. **SettingsController.php** - Configurações gerais
14. **SolicitationItemsController.php** - Itens de solicitações
15. **SolicitationKanbanController.php** - Visualização kanban
16. **SolicitationsController.php** - Gerenciamento de solicitações
17. **SolicitationTrackingManualController.php** - Rastreamento manual
18. **StatisticsController.php** - Estatísticas e métricas
19. **SubscriptionsController.php** - Assinaturas
20. **TaxCalculationController.php** - Calculadora de impostos
21. **TranslationController.php** - Tradução automática
22. **UserAddressController.php** - Endereços de usuários
23. **UsersController.php** - Gerenciamento de usuários
24. **WebhookController.php** - Webhooks externos

#### API Controllers
25. **Api/LeadController.php** - Leads de landing pages

---

### ⚙️ Services (17 arquivos)

1. **AzureTranslatorService.php** - Tradução via Azure
2. **CartNormalizerService.php** - Normalização de carrinho
3. **ExportService.php** - Exportação de dados
4. **GoHighLevelService.php** - Integração GHL/CRM
5. **GoogleTranslationService.php** - Tradução via Google
6. **MercadoLivreService.php** - API do Mercado Livre
7. **N8NService.php** - Integração N8N
8. **OpenAIService.php** - Integração OpenAI
9. **OpenRouterService.php** - Roteamento de IA
10. **OtService.php** - API OT (RapidAPI Alibaba)
11. **PricingService.php** - Cálculo de preços
12. **TmService.php** - API TM (1688/Taobao)
13. **TwilioService.php** - SMS e OTP via Twilio
14. **ProductNormalizer/**
    - **Alibaba1688Adapter.php** - Adapter 1688
    - **AlibabaAdapter.php** - Adapter Alibaba
    - **Product.php** - Modelo de produto normalizado
    - **ProductNormalizerService.php** - Serviço de normalização

---

### 📊 Models (20 arquivos)

1. **Ability.php** - Habilidades/Permissões
2. **BoardingType.php** - Tipos de embarque
3. **CalculatorUser.php** - Usuários calculadora
4. **Cart.php** - Carrinho
5. **Client.php** - Clientes
6. **ClientUser.php** - Relacionamento Cliente-Usuário
7. **FavoriteProduct.php** - Produtos favoritos
8. **Freight.php** - Frete
9. **Ncm.php** - Código NCM
10. **Plan.php** - Planos
11. **ProductCatalog.php** - Catálogo de produtos
12. **Solicitation.php** - Solicitações
13. **SolicitationItem.php** - Itens de solicitação
14. **SolicitationItemAttachment.php** - Anexos
15. **SolicitationTrack.php** - Rastreamento
16. **Subscription.php** - Assinaturas
17. **TaxCalculation.php** - Cálculos de impostos
18. **User.php** - Usuários
19. **UserAddress.php** - Endereços
20. **UserSellerLead.php** - Relacionamento Vendedor-Lead

---

### 🔄 Jobs (13 arquivos)

1. **AddProductToCatalogJob.php** - Adicionar produto ao catálogo
2. **ConfirmProductSimilarityWithAIJob.php** - Confirmar similaridade com IA
3. **ExportJob.php** - Exportação assíncrona
4. **NewLeadWorkflowJob.php** - Workflow de novo lead
5. **ProcessCatalogJob.php** - Processar catálogo completo
6. **ProcessCategoryJob.php** - Processar categoria
7. **ProcessProductSimilarityJob.php** - Processar similaridade de produtos
8. **ProcessSiteLeadJob.php** - Processar lead do site
9. **SendEmailNewSolicitationJob.php** - Email de nova solicitação
10. **SendEmailNewUserJob.php** - Email de novo usuário
11. **UpdateSalesQuantityOfCatalogCategoryJob.php** - Atualizar vendas categoria
12. **UpdateSalesQuantityOfCatalogProductCategoryJob.php** - Atualizar vendas produto-categoria
13. **UpdateSalesQuantityOfCatalogProductsJob.php** - Atualizar vendas produtos

---

### 🛡️ Middlewares (13 arquivos)

1. **Authenticate.php** - Autenticação
2. **EncryptCookies.php** - Encriptação de cookies
3. **JsonResponseMiddleware.php** - Respostas JSON
4. **LogViewerAuth.php** - Autenticação do log viewer
5. **NewRelicUserContext.php** - Contexto New Relic
6. **PreventRequestsDuringMaintenance.php** - Manutenção
7. **RedirectIfAuthenticated.php** - Redirect se autenticado
8. **TransactionMiddleware.php** - Transações DB
9. **TrimStrings.php** - Trim de strings
10. **TrustHosts.php** - Hosts confiáveis
11. **TrustProxies.php** - Proxies confiáveis
12. **ValidateSignature.php** - Validação de assinatura
13. **VerifyCsrfToken.php** - CSRF

---

### 📤 Resources (15 arquivos)

1. **AbilityResource.php**
2. **BoardingTypeResource.php**
3. **CartResource.php**
4. **ClientResource.php**
5. **FavoriteProductResource.php**
6. **PlanResource.php**
7. **ProductCatalogResource.php**
8. **SolicitationResource.php**
9. **SolicitationTrackResource.php**
10. **SubscriptionResource.php**
11. **UserAddressResource.php**
12. **UserResource.php**
13. **Exports/PlanResource.php**
14. **Exports/SolicitationResource.php**
15. **Exports/UserResource.php**

---

### 📧 Mail (4 arquivos)

1. **NewSolicitationMail.php**
2. **NewUserMail.php**
3. **PasswordResetEmail.php**
4. **ReportMail.php**

---

### 🔔 Notifications (3 arquivos)

1. **NewSolicitation.php**
2. **NewSolicitationItem.php**
3. **PasswordReset.php**

---

### 👀 Observers (3 arquivos)

1. **SolicitationItemObserver.php**
2. **SolicitationObserver.php**
3. **UserObserver.php**

---

### 🔧 Console Commands (7 arquivos)

1. **CheckExpiredSubscriptions.php** - Verificar assinaturas expiradas
2. **CleanupTempImages.php** - Limpar imagens temporárias
3. **ClearProductCacheCommand.php** - Limpar cache de produtos
4. **ConfirmProductSimilarityWithAI.php** - Confirmar similaridade com IA
5. **PopulateCnpjData.php** - Popular dados CNPJ
6. **ProcessCatalog.php** - Processar catálogo
7. **UpdateSalesQuantityOfCatalogProducts.php** - Atualizar quantidade vendas

---

### 🔌 Providers (6 arquivos)

1. **AppServiceProvider.php** - Registro de serviços
2. **AuthServiceProvider.php** - Políticas de autorização
3. **BroadcastServiceProvider.php** - Broadcasting
4. **EventServiceProvider.php** - Eventos
5. **FortifyServiceProvider.php** - Configuração Fortify
6. **RouteServiceProvider.php** - Rotas

---

### 🗄️ Database

#### Migrations (60 arquivos)
- Users, clients, plans, subscriptions
- Solicitations, items, attachments, tracking
- Cart, favorite_products
- Product catalog
- Tax calculations
- Calculator users
- Boarding types, freights
- NCM codes
- Notifications, jobs
- E muitas outras...

#### Seeders (4 arquivos)
1. **DatabaseSeeder.php**
2. **FreightSeeder.php**
3. **SolicitationTrackSeeder.php**
4. **UserSeeder.php**

---

### 🛣️ Rotas Principais (api.php)

**Autenticação**
- POST /api/auth/login

**Usuários**
- GET /api/me
- GET /api/users
- GET /api/users/leads
- PATCH /api/users/{id}
- POST /api/users/{id}/avatar
- DELETE /api/users/{id}

**Clientes**
- Resource completo /api/clients
- GET /api/clients/active-plans

**Solicitações**
- Resource completo /api/solicitations
- GET /api/solicitations/statistics
- GET /api/solicitations/kanban
- POST /api/solicitations/assign/responsibility

**Produtos**
- POST /api/products/search/keyword
- POST /api/products/search/image
- POST /api/products/search/keyword-alibaba
- POST /api/products/search/image-alibaba
- POST /api/products/search/concierge
- GET /api/products/{id}
- GET /api/products/category/{category_id}
- GET /api/products/categories

**Carrinho**
- Resource completo /api/cart
- DELETE /api/cart/clear
- POST /api/cart/sync

**Planos e Assinaturas**
- Resource /api/plans
- Resource /api/subscriptions

**Tradução**
- POST /api/translation/titles
- POST /api/translation/text
- POST /api/translation/products

**IA/Concierge**
- POST /api/ai/concierge/ask
- POST /api/ai/concierge/detect-intent

**Calculadora de Impostos**
- GET /api/tax-calculations
- POST /api/tax-calculations

**Estatísticas**
- GET /api/statistics/total-clients-by-plan
- GET /api/statistics/monthly-metrics

**Notificações**
- GET /api/notifications
- PUT /api/notifications/mark-all-as-read

**Webhooks**
- POST /api/webhooks/typeform

**Leads**
- POST /api/leads/landing-ekonomi

**Proxy e Utilitários**
- GET /api/proxy-image
- GET /api/proxy-paises

**OTP (Twilio)**
- POST /api/otp/send
- POST /api/otp/validate
- POST /api/otp/resend

**NCM**
- POST /api/ncm/item
- POST /api/ncm/by-code

**Exportação**
- POST /api/export
- POST /api/export/download

---

### 📦 Dependências Principais (composer.json)

- **laravel/framework** ^10.8
- **laravel/sanctum** ^3.2 (autenticação API)
- **laravel/fortify** ^1.24 (autenticação)
- **google/cloud-translate** (tradução)
- **twilio/sdk** (SMS/OTP)
- **barryvdh/laravel-dompdf** ^3.0 (PDFs)
- **maatwebsite/excel** ^3.1 (Excel)
- **predis/predis** ^2.3 (Redis)
- **opcodesio/log-viewer** ^3.14
- **romanzipp/laravel-queue-monitor** ^5.3

---

## 🎯 2. ESTRUTURA PROPOSTA PARA NESTJS

### 📂 2.1 Estrutura de Diretórios NestJS

```
src/
├── main.ts                          # Entry point
├── app.module.ts                    # Módulo raiz
│
├── config/                          # Configurações
│   ├── configuration.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── jwt.config.ts
│   └── validators/
│
├── common/                          # Compartilhado
│   ├── decorators/
│   ├── filters/                     # Exception filters
│   ├── guards/                      # Auth guards
│   ├── interceptors/                # Interceptors (logging, transform)
│   ├── pipes/                       # Validation pipes
│   ├── middleware/                  # Middlewares
│   ├── helpers/
│   └── constants/
│
├── database/                        # Database
│   ├── entities/                    # TypeORM entities (models)
│   ├── migrations/
│   ├── seeders/
│   ├── repositories/                # Custom repositories
│   └── database.module.ts
│
├── modules/                         # Módulos de domínio
│   │
│   ├── auth/                        # Autenticação
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/                       # Usuários
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── clients/                     # Clientes
│   │   ├── clients.module.ts
│   │   ├── clients.controller.ts
│   │   ├── clients.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── solicitations/              # Solicitações
│   │   ├── solicitations.module.ts
│   │   ├── controllers/
│   │   │   ├── solicitations.controller.ts
│   │   │   ├── solicitation-items.controller.ts
│   │   │   ├── solicitation-kanban.controller.ts
│   │   │   └── solicitation-tracking.controller.ts
│   │   ├── services/
│   │   │   ├── solicitations.service.ts
│   │   │   ├── solicitation-items.service.ts
│   │   │   └── solicitation-statistics.service.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── observers/
│   │
│   ├── products/                   # Produtos
│   │   ├── products.module.ts
│   │   ├── controllers/
│   │   │   ├── products.controller.ts
│   │   │   ├── product-catalog.controller.ts
│   │   │   └── favorite-products.controller.ts
│   │   ├── services/
│   │   │   ├── products.service.ts
│   │   │   ├── product-search.service.ts
│   │   │   ├── product-catalog.service.ts
│   │   │   └── normalizers/
│   │   │       ├── alibaba.normalizer.ts
│   │   │       ├── alibaba1688.normalizer.ts
│   │   │       └── product-normalizer.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── cart/                       # Carrinho
│   │   ├── cart.module.ts
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   ├── cart-normalizer.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── plans/                      # Planos e Assinaturas
│   │   ├── plans.module.ts
│   │   ├── controllers/
│   │   │   ├── plans.controller.ts
│   │   │   └── subscriptions.controller.ts
│   │   ├── services/
│   │   │   ├── plans.service.ts
│   │   │   └── subscriptions.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── tax-calculator/             # Calculadora de Impostos
│   │   ├── tax-calculator.module.ts
│   │   ├── controllers/
│   │   │   ├── tax-calculation.controller.ts
│   │   │   └── calculator-users.controller.ts
│   │   ├── services/
│   │   │   ├── tax-calculation.service.ts
│   │   │   └── pricing.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── notifications/              # Notificações
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── statistics/                 # Estatísticas
│   │   ├── statistics.module.ts
│   │   ├── statistics.controller.ts
│   │   └── statistics.service.ts
│   │
│   ├── settings/                   # Configurações
│   │   ├── settings.module.ts
│   │   ├── controllers/
│   │   │   ├── settings.controller.ts
│   │   │   └── boarding-types.controller.ts
│   │   ├── services/
│   │   └── entities/
│   │
│   ├── webhooks/                   # Webhooks
│   │   ├── webhooks.module.ts
│   │   ├── webhooks.controller.ts
│   │   └── webhooks.service.ts
│   │
│   ├── leads/                      # Leads
│   │   ├── leads.module.ts
│   │   ├── leads.controller.ts
│   │   └── leads.service.ts
│   │
│   ├── ai/                         # IA/Concierge
│   │   ├── ai.module.ts
│   │   ├── ai.controller.ts
│   │   └── ai.service.ts
│   │
│   └── exports/                    # Exportações
│       ├── exports.module.ts
│       ├── exports.controller.ts
│       └── exports.service.ts
│
├── integrations/                   # Integrações externas
│   ├── alibaba/
│   │   ├── alibaba.module.ts
│   │   ├── services/
│   │   │   ├── tm.service.ts
│   │   │   └── ot.service.ts
│   │   └── dto/
│   │
│   ├── translation/
│   │   ├── translation.module.ts
│   │   ├── translation.controller.ts
│   │   └── services/
│   │       ├── azure-translator.service.ts
│   │       └── google-translation.service.ts
│   │
│   ├── ai-providers/
│   │   ├── ai-providers.module.ts
│   │   └── services/
│   │       ├── openai.service.ts
│   │       └── open-router.service.ts
│   │
│   ├── crm/
│   │   ├── crm.module.ts
│   │   └── services/
│   │       ├── gohighlevel.service.ts
│   │       └── n8n.service.ts
│   │
│   ├── sms/
│   │   ├── sms.module.ts
│   │   ├── controllers/
│   │   │   └── otp.controller.ts
│   │   └── services/
│   │       └── twilio.service.ts
│   │
│   └── marketplace/
│       ├── marketplace.module.ts
│       └── services/
│           └── mercadolivre.service.ts
│
├── jobs/                           # Background Jobs (Bull/BullMQ)
│   ├── jobs.module.ts
│   ├── processors/
│   │   ├── catalog.processor.ts
│   │   ├── email.processor.ts
│   │   ├── export.processor.ts
│   │   ├── lead.processor.ts
│   │   └── product-similarity.processor.ts
│   └── dto/
│
├── mail/                           # Email
│   ├── mail.module.ts
│   ├── mail.service.ts
│   └── templates/
│
└── cli/                            # CLI Commands
    ├── commands/
    │   ├── check-expired-subscriptions.command.ts
    │   ├── cleanup-temp-images.command.ts
    │   ├── clear-product-cache.command.ts
    │   ├── process-catalog.command.ts
    │   └── populate-cnpj-data.command.ts
    └── cli.module.ts

test/
├── unit/
├── integration/
└── e2e/

prisma/  (ou typeorm/migrations se usar TypeORM)
├── schema.prisma
├── migrations/
└── seeds/
```

---

## 🗺️ 3. MAPEAMENTO DE MIGRAÇÃO

### Controllers → NestJS Modules

| Laravel Controller | NestJS Module | NestJS Controller/Service |
|-------------------|---------------|---------------------------|
| UsersController | users/ | users.controller.ts / users.service.ts |
| ClientsController | clients/ | clients.controller.ts / clients.service.ts |
| SolicitationsController | solicitations/ | solicitations.controller.ts |
| SolicitationItemsController | solicitations/ | solicitation-items.controller.ts |
| SolicitationKanbanController | solicitations/ | solicitation-kanban.controller.ts |
| SolicitationTrackingManualController | solicitations/ | solicitation-tracking.controller.ts |
| ProductsController | products/ | products.controller.ts |
| ProductCatalogController | products/ | product-catalog.controller.ts |
| FavoriteProductController | products/ | favorite-products.controller.ts |
| CartController | cart/ | cart.controller.ts |
| PlanController | plans/ | plans.controller.ts |
| SubscriptionsController | plans/ | subscriptions.controller.ts |
| TaxCalculationController | tax-calculator/ | tax-calculation.controller.ts |
| CalculatorUserController | tax-calculator/ | calculator-users.controller.ts |
| NotificationsController | notifications/ | notifications.controller.ts |
| StatisticsController | statistics/ | statistics.controller.ts |
| SettingsController | settings/ | settings.controller.ts |
| BoardingTypesController | settings/ | boarding-types.controller.ts |
| AIController | ai/ | ai.controller.ts |
| TranslationController | integrations/translation/ | translation.controller.ts |
| ExportController | exports/ | exports.controller.ts |
| UserAddressController | users/ | user-address.controller.ts |
| WebhookController | webhooks/ | webhooks.controller.ts |
| LeadController | leads/ | leads.controller.ts |

### Services → NestJS Services

| Laravel Service | NestJS Module | Localização |
|----------------|---------------|-------------|
| TmService | integrations/alibaba/ | tm.service.ts |
| OtService | integrations/alibaba/ | ot.service.ts |
| AzureTranslatorService | integrations/translation/ | azure-translator.service.ts |
| GoogleTranslationService | integrations/translation/ | google-translation.service.ts |
| OpenAIService | integrations/ai-providers/ | openai.service.ts |
| OpenRouterService | integrations/ai-providers/ | open-router.service.ts |
| GoHighLevelService | integrations/crm/ | gohighlevel.service.ts |
| N8NService | integrations/crm/ | n8n.service.ts |
| TwilioService | integrations/sms/ | twilio.service.ts |
| MercadoLivreService | integrations/marketplace/ | mercadolivre.service.ts |
| PricingService | tax-calculator/ | pricing.service.ts |
| CartNormalizerService | cart/ | cart-normalizer.service.ts |
| ExportService | exports/ | exports.service.ts |
| ProductNormalizerService | products/services/normalizers/ | product-normalizer.service.ts |
| Alibaba1688Adapter | products/services/normalizers/ | alibaba1688.normalizer.ts |
| AlibabaAdapter | products/services/normalizers/ | alibaba.normalizer.ts |

### Models → TypeORM Entities

| Laravel Model | TypeORM Entity | Localização |
|--------------|----------------|-------------|
| User | User | database/entities/user.entity.ts |
| Client | Client | database/entities/client.entity.ts |
| Solicitation | Solicitation | database/entities/solicitation.entity.ts |
| SolicitationItem | SolicitationItem | database/entities/solicitation-item.entity.ts |
| SolicitationItemAttachment | SolicitationItemAttachment | database/entities/solicitation-item-attachment.entity.ts |
| SolicitationTrack | SolicitationTrack | database/entities/solicitation-track.entity.ts |
| Cart | Cart | database/entities/cart.entity.ts |
| Plan | Plan | database/entities/plan.entity.ts |
| Subscription | Subscription | database/entities/subscription.entity.ts |
| ProductCatalog | ProductCatalog | database/entities/product-catalog.entity.ts |
| FavoriteProduct | FavoriteProduct | database/entities/favorite-product.entity.ts |
| TaxCalculation | TaxCalculation | database/entities/tax-calculation.entity.ts |
| CalculatorUser | CalculatorUser | database/entities/calculator-user.entity.ts |
| UserAddress | UserAddress | database/entities/user-address.entity.ts |
| BoardingType | BoardingType | database/entities/boarding-type.entity.ts |
| Freight | Freight | database/entities/freight.entity.ts |
| Ncm | Ncm | database/entities/ncm.entity.ts |
| Ability | Ability | database/entities/ability.entity.ts |
| ClientUser | ClientUser | database/entities/client-user.entity.ts |
| UserSellerLead | UserSellerLead | database/entities/user-seller-lead.entity.ts |

### Jobs → Bull Processors

| Laravel Job | Bull Processor | Localização |
|------------|----------------|-------------|
| ProcessCatalogJob | CatalogProcessor | jobs/processors/catalog.processor.ts |
| ProcessCategoryJob | CatalogProcessor (método) | jobs/processors/catalog.processor.ts |
| AddProductToCatalogJob | CatalogProcessor (método) | jobs/processors/catalog.processor.ts |
| ProcessProductSimilarityJob | ProductSimilarityProcessor | jobs/processors/product-similarity.processor.ts |
| ConfirmProductSimilarityWithAIJob | ProductSimilarityProcessor | jobs/processors/product-similarity.processor.ts |
| SendEmailNewSolicitationJob | EmailProcessor | jobs/processors/email.processor.ts |
| SendEmailNewUserJob | EmailProcessor | jobs/processors/email.processor.ts |
| ExportJob | ExportProcessor | jobs/processors/export.processor.ts |
| NewLeadWorkflowJob | LeadProcessor | jobs/processors/lead.processor.ts |
| ProcessSiteLeadJob | LeadProcessor | jobs/processors/lead.processor.ts |
| UpdateSalesQuantityOfCatalogProductsJob | CatalogProcessor | jobs/processors/catalog.processor.ts |
| UpdateSalesQuantityOfCatalogProductCategoryJob | CatalogProcessor | jobs/processors/catalog.processor.ts |
| UpdateSalesQuantityOfCatalogCategoryJob | CatalogProcessor | jobs/processors/catalog.processor.ts |

### Middlewares → NestJS Middlewares/Guards/Interceptors

| Laravel Middleware | NestJS Equivalente | Tipo | Localização |
|-------------------|-------------------|------|-------------|
| Authenticate | JwtAuthGuard | Guard | common/guards/jwt-auth.guard.ts |
| TransactionMiddleware | TransactionInterceptor | Interceptor | common/interceptors/transaction.interceptor.ts |
| JsonResponseMiddleware | TransformInterceptor | Interceptor | common/interceptors/transform.interceptor.ts |
| TrimStrings | ValidationPipe | Pipe | (built-in) |
| VerifyCsrfToken | CsrfGuard | Guard | common/guards/csrf.guard.ts |
| NewRelicUserContext | NewRelicInterceptor | Interceptor | common/interceptors/newrelic.interceptor.ts |
| ThrottleRequests | ThrottlerGuard | Guard | @nestjs/throttler |

### Commands → NestJS CLI Commands

| Laravel Command | NestJS Command | Localização |
|----------------|----------------|-------------|
| cmd:process-catalog | process-catalog | cli/commands/process-catalog.command.ts |
| cmd:check-expired-subscriptions | check-expired-subscriptions | cli/commands/check-expired-subscriptions.command.ts |
| cmd:cleanup-temp-images | cleanup-temp-images | cli/commands/cleanup-temp-images.command.ts |
| cmd:clear-product-cache | clear-product-cache | cli/commands/clear-product-cache.command.ts |
| cmd:confirm-product-similarity | confirm-product-similarity | cli/commands/confirm-product-similarity.command.ts |
| cmd:populate-cnpj-data | populate-cnpj-data | cli/commands/populate-cnpj-data.command.ts |
| cmd:update-sales-quantity | update-sales-quantity | cli/commands/update-sales-quantity.command.ts |

---

## 📅 4. PLANO DE MIGRAÇÃO (1 MÊS - 2 DEVS)

### 🎯 Estratégia Geral

1. **Migração progressiva por módulos**
2. **Módulos independentes primeiro** (menos dependências)
3. **Setup inicial compartilhado**
4. **Divisão de trabalho para evitar conflitos**
5. **Dev Sênior**: Módulos complexos e setup de infraestrutura
6. **Dev Júnior**: Módulos mais simples e CRUD básico

---

### 📊 SEMANA 1: Setup e Fundação (Dias 1-5)

#### 👨‍💼 DEV SÊNIOR

**Dia 1-2: Setup Inicial do Projeto**
- [ ] Criar projeto NestJS
- [ ] Configurar TypeORM/Prisma
- [ ] Configurar estrutura de módulos
- [ ] Setup Redis e Bull (filas)
- [ ] Configurar variáveis de ambiente
- [ ] Setup Docker (se necessário)
- [ ] Configurar ESLint/Prettier

**Dia 3-4: Autenticação e Core**
- [ ] Módulo de autenticação (JWT + Sanctum equivalente)
- [ ] Auth guards e strategies
- [ ] Módulo de database
- [ ] Configurar migrations
- [ ] Exception filters globais
- [ ] Logging interceptor

**Dia 5: Middlewares e Interceptors**
- [ ] TransactionInterceptor
- [ ] TransformInterceptor
- [ ] NewRelicInterceptor
- [ ] Global validation pipe

#### 👨‍🎓 DEV JÚNIOR

**Dia 1-2: Aprendizado e Setup Local**
- [ ] Estudar estrutura NestJS
- [ ] Clonar repositório
- [ ] Setup ambiente local
- [ ] Rodar projeto base
- [ ] Estudar TypeORM/Prisma

**Dia 3-5: Migrations e Entities Base**
- [ ] Criar entity User
- [ ] Criar entity Client
- [ ] Criar entity Plan
- [ ] Criar entity Subscription
- [ ] Criar migrations dessas entities
- [ ] Seeders básicos

---

### 📊 SEMANA 2: Módulos Principais (Dias 6-10)

#### 👨‍💼 DEV SÊNIOR

**Dia 6-7: Módulo de Produtos (Parte 1)**
- [ ] ProductsModule setup
- [ ] ProductsController (estrutura)
- [ ] ProductsService (busca)
- [ ] ProductSearchService
- [ ] Integração TmService (Alibaba/1688)
- [ ] Integração OtService (RapidAPI)
- [ ] Cache manager setup

**Dia 8-9: Módulo de Produtos (Parte 2)**
- [ ] ProductNormalizerService
- [ ] Alibaba1688Normalizer
- [ ] AlibabaNormalizer
- [ ] ProductCatalogService
- [ ] Entities: ProductCatalog, FavoriteProduct

**Dia 10: Integrações de IA**
- [ ] AIModule
- [ ] OpenAIService
- [ ] OpenRouterService
- [ ] AIController (concierge)

#### 👨‍🎓 DEV JÚNIOR

**Dia 6-7: Módulo de Usuários**
- [ ] UsersModule
- [ ] UsersController
- [ ] UsersService (CRUD completo)
- [ ] DTOs (CreateUser, UpdateUser)
- [ ] UserAddressController
- [ ] UserAddressService
- [ ] Entity UserAddress

**Dia 8-9: Módulo de Clientes**
- [ ] ClientsModule
- [ ] ClientsController
- [ ] ClientsService
- [ ] DTOs (CreateClient, UpdateClient)
- [ ] Relacionamentos Client-User
- [ ] Tests unitários

**Dia 10: Módulo de Planos**
- [ ] PlansModule
- [ ] PlansController
- [ ] PlansService
- [ ] SubscriptionsController
- [ ] SubscriptionsService
- [ ] DTOs

---

### 📊 SEMANA 3: Módulos de Negócio (Dias 11-15)

#### 👨‍💼 DEV SÊNIOR

**Dia 11-12: Módulo de Solicitações (Parte 1)**
- [ ] SolicitationsModule
- [ ] SolicitationsController
- [ ] SolicitationsService
- [ ] SolicitationItemsController
- [ ] SolicitationItemsService
- [ ] Entities complexas (Solicitation, Item, Attachment)

**Dia 13: Módulo de Solicitações (Parte 2)**
- [ ] SolicitationKanbanController
- [ ] SolicitationTrackingController
- [ ] SolicitationStatisticsService
- [ ] Observers (lifecycle hooks)

**Dia 14-15: Módulo de Carrinho**
- [ ] CartModule
- [ ] CartController
- [ ] CartService
- [ ] CartNormalizerService
- [ ] Sincronização de carrinho
- [ ] Cálculo de preços

#### 👨‍🎓 DEV JÚNIOR

**Dia 11-12: Módulo de Notificações**
- [ ] NotificationsModule
- [ ] NotificationsController
- [ ] NotificationsService
- [ ] Entity Notification
- [ ] DTOs
- [ ] Mark as read/unread

**Dia 13: Módulo de Configurações**
- [ ] SettingsModule
- [ ] SettingsController
- [ ] SettingsService
- [ ] BoardingTypesController
- [ ] BoardingTypesService
- [ ] Entities (BoardingType, Freight)

**Dia 14-15: Módulo de Estatísticas**
- [ ] StatisticsModule
- [ ] StatisticsController
- [ ] StatisticsService
- [ ] Queries complexas
- [ ] Aggregations

---

### 📊 SEMANA 4: Integrações e Jobs (Dias 16-20)

#### 👨‍💼 DEV SÊNIOR

**Dia 16-17: Background Jobs (Bull)**
- [ ] JobsModule setup
- [ ] CatalogProcessor
- [ ] ProductSimilarityProcessor
- [ ] Configurar Bull Dashboard
- [ ] Job monitoring

**Dia 18: Integrações Externas (Parte 1)**
- [ ] TranslationModule
- [ ] AzureTranslatorService
- [ ] GoogleTranslationService
- [ ] TranslationController
- [ ] Cache de traduções

**Dia 19: Integrações Externas (Parte 2)**
- [ ] CRMModule
- [ ] GoHighLevelService
- [ ] N8NService
- [ ] MercadoLivreService
- [ ] SMSModule (Twilio)

**Dia 20: Webhooks e Leads**
- [ ] WebhooksModule
- [ ] WebhooksController
- [ ] LeadsModule
- [ ] LeadsService
- [ ] Integração com GHL

#### 👨‍🎓 DEV JÚNIOR

**Dia 16: Módulo de Calculadora de Impostos**
- [ ] TaxCalculatorModule
- [ ] TaxCalculationController
- [ ] TaxCalculationService
- [ ] CalculatorUsersController
- [ ] Entities (TaxCalculation, CalculatorUser)

**Dia 17: Background Jobs (Email)**
- [ ] EmailProcessor
- [ ] MailModule
- [ ] MailService
- [ ] Templates de email
- [ ] Integração com SMTP

**Dia 18: Background Jobs (Export)**
- [ ] ExportModule
- [ ] ExportProcessor
- [ ] ExportService
- [ ] Geração de Excel/PDF

**Dia 19: CLI Commands**
- [ ] CLIModule setup
- [ ] CheckExpiredSubscriptionsCommand
- [ ] CleanupTempImagesCommand
- [ ] ClearProductCacheCommand
- [ ] ProcessCatalogCommand

**Dia 20: Utilitários e Helpers**
- [ ] StringHelper equivalente
- [ ] Proxy de imagens
- [ ] Proxy de APIs
- [ ] NCM service

---

### 📊 DIAS 21-25: Testes, Ajustes e Deploy

#### 👨‍💼 DEV SÊNIOR

**Dia 21-22: Testes de Integração**
- [ ] Tests e2e dos endpoints críticos
- [ ] Tests de autenticação
- [ ] Tests de produtos
- [ ] Tests de solicitações
- [ ] Tests de jobs

**Dia 23: Performance e Otimização**
- [ ] Query optimization
- [ ] Cache strategy review
- [ ] Database indexes
- [ ] Connection pooling
- [ ] Rate limiting

**Dia 24-25: CI/CD e Deploy**
- [ ] GitHub Actions / GitLab CI
- [ ] Docker setup production
- [ ] Environment configs
- [ ] Deploy staging
- [ ] Monitoring (New Relic, logs)

#### 👨‍🎓 DEV JÚNIOR

**Dia 21-22: Testes Unitários**
- [ ] Tests de services
- [ ] Tests de controllers
- [ ] Tests de helpers
- [ ] Mock de dependências

**Dia 23: Documentação**
- [ ] Swagger/OpenAPI setup
- [ ] Documentar todos endpoints
- [ ] README atualizado
- [ ] Postman collection

**Dia 24-25: Bugfixes e Polimento**
- [ ] Corrigir bugs encontrados
- [ ] Validações extras
- [ ] Error handling
- [ ] Logs apropriados

---

### 📊 DIAS 26-30: Transição e Rollout

#### 👨‍💼 + 👨‍🎓 (Trabalho Conjunto)

**Dia 26-27: Testes de Aceitação**
- [ ] Testes end-to-end completos
- [ ] Comparação de comportamento PHP vs NestJS
- [ ] Performance testing
- [ ] Load testing

**Dia 28: Migração de Dados (se necessário)**
- [ ] Scripts de migração
- [ ] Backup completo
- [ ] Testes de integridade

**Dia 29: Deploy Production**
- [ ] Deploy gradual (canary/blue-green)
- [ ] Monitoramento ativo
- [ ] Logs em tempo real
- [ ] Rollback plan pronto

**Dia 30: Estabilização e Documentação Final**
- [ ] Hotfixes
- [ ] Documentação de processo
- [ ] Handoff para time
- [ ] Post-mortem

---

## 🎯 5. RECOMENDAÇÕES NESTJS PARA STARTUPS

### 🏗️ 5.1 Arquitetura e Organização

#### ✅ Estrutura Modular Clara
- **Um módulo por domínio** (users, products, solicitations)
- Evite módulos "God" muito grandes
- Use `SharedModule` para código comum
- Use `CoreModule` para configurações globais

#### ✅ DTOs e Validação
```typescript
// Sempre use DTOs com class-validator
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

#### ✅ Separation of Concerns
- **Controllers**: Apenas recebem requests e retornam responses
- **Services**: Lógica de negócio
- **Repositories**: Acesso a dados
- **Providers**: Utilitários e helpers

---

### 🔧 5.2 TypeORM vs Prisma

Para **Startups**, recomendo **Prisma**:

✅ **Vantagens do Prisma:**
- Migrations automáticas
- Type-safety total
- Developer experience superior
- Melhor performance
- Queries mais simples
- Introspection do banco

❌ **TypeORM se:**
- Já tem experiência forte
- Precisa de Active Record pattern
- Precisa de decorators

---

### 🗄️ 5.3 Database e Caching

#### Cache Strategy
```typescript
// Use Redis para cache
@Injectable()
export class ProductsService {
  constructor(
    @InjectRedis() private readonly redis: Redis
  ) {}

  async getProduct(id: string) {
    const cached = await this.redis.get(`product:${id}`);
    if (cached) return JSON.parse(cached);

    const product = await this.db.product.findUnique({ where: { id } });
    await this.redis.set(
      `product:${id}`,
      JSON.stringify(product),
      'EX',
      3600
    );
    return product;
  }
}
```

#### Database Indexes
- Crie indexes para queries frequentes
- Use composite indexes para queries complexas
- Monitor query performance (pg_stat_statements)

---

### ⚡ 5.4 Background Jobs (Bull/BullMQ)

```typescript
// Use Bull para jobs pesados
@Processor('catalog')
export class CatalogProcessor {
  @Process('process-category')
  async processCategory(job: Job<{ categoryId: string }>) {
    // Lógica pesada aqui
  }
}

// No service
await this.catalogQueue.add('process-category', {
  categoryId: '123'
});
```

**Recomendações:**
- Use BullMQ (mais moderno que Bull)
- Implemente retry strategies
- Configure dead letter queues
- Monitor jobs com Bull Dashboard

---

### 🔐 5.5 Autenticação e Autorização

```typescript
// JWT com Passport
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}

// Guards personalizados
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    return roles.includes(request.user.role);
  }
}
```

---

### 📊 5.6 Logging e Monitoring

```typescript
// Use Winston para logs estruturados
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

WinstonModule.createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Interceptor de logging
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(`${method} ${url} ${duration}ms`);
      })
    );
  }
}
```

**Monitoramento:**
- New Relic / Datadog / Sentry
- Logs centralizados (ELK, CloudWatch)
- Metrics (Prometheus + Grafana)
- Health checks (`/health`, `/metrics`)

---

### 🧪 5.7 Testes

```typescript
// Unit tests
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a user', async () => {
    const dto = { name: 'Test', email: 'test@test.com' };
    const result = await service.create(dto);
    expect(result).toBeDefined();
  });
});

// E2E tests
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Test', email: 'test@test.com' })
      .expect(201);
  });
});
```

**Coverage mínimo recomendado:**
- Services: 80%+
- Controllers: 60%+
- E2E: Fluxos críticos

---

### 🚀 5.8 Performance

#### Dicas Gerais:
1. **Use DataLoader** para evitar N+1 queries
2. **Pagination sempre** (nunca retorne tudo)
3. **Compression middleware** (gzip/brotli)
4. **Rate limiting** (@nestjs/throttler)
5. **Query optimization** (select only needed fields)

```typescript
// Paginação
@Get()
async findAll(@Query() query: PaginationDto) {
  const { page = 1, limit = 20 } = query;
  return this.service.findAll({
    skip: (page - 1) * limit,
    take: limit,
  });
}

// Select específico
const users = await this.db.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Não carrega tudo
  }
});
```

---

### 📦 5.9 Dependências Recomendadas

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/bull": "^10.0.0",
    
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    
    "bull": "^4.11.0",
    "ioredis": "^5.3.0",
    
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    
    "axios": "^1.5.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "jest": "^29.6.0",
    "supertest": "^6.3.0",
    "eslint": "^8.48.0",
    "prettier": "^3.0.0"
  }
}
```

---

### 🔄 5.10 CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:cov
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy script
```

---

### 📋 5.11 Checklist de Boas Práticas

#### Código
- [ ] Use TypeScript strict mode
- [ ] DTOs para todas requests
- [ ] Validação em todos endpoints
- [ ] Error handling consistente
- [ ] Logs estruturados
- [ ] Code review obrigatório

#### Segurança
- [ ] Helmet middleware
- [ ] CORS configurado
- [ ] Rate limiting
- [ ] SQL injection prevention (ORM)
- [ ] Secrets em variáveis de ambiente
- [ ] Sanitização de inputs

#### Performance
- [ ] Database indexes
- [ ] Cache strategy
- [ ] Pagination
- [ ] Query optimization
- [ ] Compression
- [ ] CDN para assets

#### DevOps
- [ ] CI/CD pipeline
- [ ] Automated tests
- [ ] Health checks
- [ ] Monitoring
- [ ] Logs centralizados
- [ ] Backup strategy

---

## 🎯 6. ESTRATÉGIAS PARA EVITAR CONFLITOS

### 🔀 6.1 Divisão Clara de Módulos

**Dev Sênior:**
- Produtos (+ integrações Alibaba)
- Solicitações
- Carrinho
- AI/Concierge
- Jobs complexos
- Setup de infraestrutura

**Dev Júnior:**
- Usuários
- Clientes
- Planos/Assinaturas
- Notificações
- Configurações
- Estatísticas
- Calculadora de impostos

### 🌿 6.2 Estratégia de Branches

```
main
├── develop
    ├── feature/setup-initial (Sênior)
    ├── feature/auth-module (Sênior)
    ├── feature/users-module (Júnior)
    ├── feature/products-module (Sênior)
    ├── feature/clients-module (Júnior)
    └── ...
```

**Regras:**
- Feature branches individuais
- Pull requests obrigatórios
- Code review antes de merge
- Testes devem passar
- Merge para `develop` primeiro
- Deploy para staging automático

### 📅 6.3 Daily Sync

- **Daily de 15min** toda manhã
- Revisar o que foi feito ontem
- Planejar o dia
- Identificar blockers
- Coordenar dependências

---

## 📊 7. MÉTRICAS DE SUCESSO

### KPIs da Migração:

1. **100% das rotas migradas** 
2. **100% dos models migrados**
3. **95%+ dos testes passando**
4. **Performance igual ou melhor** que PHP
5. **Zero downtime** no deploy
6. **Documentação completa** (Swagger)
7. **Logs e monitoring** funcionando

---

## ⚠️ 8. RISCOS E MITIGAÇÕES

### Risco 1: Atraso no cronograma
**Mitigação:** Buffer de 5 dias no final, priorizar features críticas

### Risco 2: Bugs em produção
**Mitigação:** Testes extensivos, deploy gradual, rollback plan

### Risco 3: Dependências externas
**Mitigação:** Mock de APIs externas para testes, circuit breakers

### Risco 4: Curva de aprendizado
**Mitigação:** Pair programming, documentação, code review

---

## 🎓 9. RECURSOS DE APRENDIZADO

### Para o Dev Júnior:
- [NestJS Official Docs](https://docs.nestjs.com/)
- [NestJS Fundamentals Course](https://courses.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)

### Para Ambos:
- [NestJS Best Practices](https://github.com/CatsMiaow/nestjs-boilerplate)
- [Bull Queue Documentation](https://docs.bullmq.io/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

## ✅ 10. CONCLUSÃO

Este plano de migração foi desenhado para:

✅ **Migrar 100% do backend** PHP/Laravel para NestJS
✅ **Em 1 mês** com 2 desenvolvedores
✅ **Minimizar conflitos** com divisão clara de tarefas
✅ **Manter qualidade** com testes e boas práticas
✅ **Preparar para escala** com arquitetura moderna

**Próximos Passos:**
1. Revisar e ajustar este plano conforme necessário
2. Criar repositório NestJS
3. Kickoff com o time
4. Começar Semana 1!

---

**Documento criado por:** Claude AI
**Data:** 2025-11-11
**Versão:** 1.0


