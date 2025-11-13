# ✅ Checklist Detalhado de Migração - NestJS

## 📋 SEMANA 1: FUNDAÇÃO (Dias 1-5)

### 👨‍💼 DEV SÊNIOR - Tarefas

#### Dia 1: Setup Inicial
- [ ] Criar novo repositório NestJS
  ```bash
  nest new chinafacil-backend-nest
  ```
- [ X ] Configurar estrutura de pastas conforme documento
- [ X ] Setup Git e .gitignore
- [ X ] Configurar variáveis de ambiente (.env.example)
- [ ] Instalar dependências base:
  - [ ] @nestjs/config
  - [ ] @nestjs/typeorm ou @prisma/client
  - [ ] @nestjs/jwt
  - [ ] @nestjs/passport
  - [ ] class-validator
  - [ ] class-transformer

#### Dia 2: Database e Docker
- [x] Setup Docker Compose (MySQL, Redis)
- [x] Configurar Prisma
- [x] Criar schema inicial
- [x] Testar conexão com banco
- [x] Setup Redis
- [ ] Configurar Bull/BullMQ

#### Dia 3: Autenticação (Parte 1)
- [x] Criar AuthModule
- [x] Implementar JwtStrategy
- [x] Implementar LocalStrategy
- [x] Criar JwtAuthGuard
- [x] Criar RolesGuard
- [x] Login endpoint (/auth/login)

#### Dia 4: Autenticação (Parte 2)
- [x] Register endpoint (/auth/register)
- [x] Password reset flow
- [x] Email verification
- [x] Refresh token mechanism
- [ ] Tests de autenticação

#### Dia 5: Core Infrastructure
- [x] Exception filters (HttpExceptionFilter, AllExceptionsFilter)
- [x] Logging interceptor
- [x] Transform interceptor
- [x] Transaction interceptor
- [x] Validation pipe global
- [x] Swagger setup

---

### 👨‍🎓 DEV JÚNIOR - Tarefas

#### Dia 1-2: Ambiente e Estudo
- [ ] Instalar Node.js 18+ LTS
- [ ] Instalar NestJS CLI globalmente
  ```bash
  npm i -g @nestjs/cli
  ```
- [ ] Estudar documentação NestJS (Fundamentals)
- [ ] Estudar TypeORM/Prisma
- [ ] Clonar repositório
- [ ] Rodar projeto localmente
- [ ] Explorar estrutura de pastas

#### Dia 3: Entity User
- [ ] Criar `user.entity.ts` com todos campos do Laravel
  - id (uuid)
  - name
  - email (unique)
  - password (hashed)
  - phone
  - avatar
  - status
  - role
  - phone_verified
  - employees
  - monthly_billing
  - cnpj
  - company_data (json)
  - created_at
  - updated_at
- [ ] Criar migration
- [ ] Testar criação da tabela

#### Dia 4: Entity Client
- [ ] Criar `client.entity.ts`
  - id (uuid)
  - name
  - email
  - status
  - cf_code
  - plan_status
  - company_data (json)
  - deleted_at (soft delete)
  - timestamps
- [ ] Criar `client-user.entity.ts` (pivot)
- [ ] Definir relacionamentos
- [ ] Criar migrations

#### Dia 5: Entities Planos
- [ ] Criar `plan.entity.ts`
  - id (uuid)
  - name
  - description
  - price
  - features (json)
  - is_active
  - timestamps
- [ ] Criar `subscription.entity.ts`
  - id (uuid)
  - user_id (fk)
  - plan_id (fk)
  - status
  - started_at
  - expires_at
  - timestamps
- [ ] Criar migrations
- [ ] Testar relacionamentos

---

## 📋 SEMANA 2: MÓDULOS PRINCIPAIS (Dias 6-10)

### 👨‍💼 DEV SÊNIOR - Tarefas

#### Dia 6: Módulo Produtos - Setup
- [x] Criar ProductsModule
- [x] Criar ProductsController (estrutura básica)
- [x] Criar ProductsService
- [x] Criar ProductSearchService
- [x] Setup de cache (Redis)
- [x] Configurar cache keys strategy

#### Dia 7: Integrações Alibaba
- [x] Criar AlibabaModule (em integrations/)
- [x] Portar TmService para tm.service.ts
  - Método: searchProductsByKeyword
  - Método: searchProductsByImage
  - Método: getProductDetails
  - Método: getProductSkuDetails
  - Método: getProductShipping
- [x] Portar OtService para ot.service.ts
  - Método: searchProductsByKeywordAlibaba
  - Método: searchProductsByImageAlibaba
  - Método: getProductDetailsAlibaba
- [x] Configurar HTTP client (axios)
- [x] Implementar retry logic

#### Dia 8: Product Normalizers
- [x] Criar ProductNormalizerService
- [x] Criar Alibaba1688Normalizer
  - normalizeSearchResponse
  - normalizeDetailResponse
- [x] Criar AlibabaNormalizer
  - normalizeSearchResponse
  - normalizeDetailResponse
- [x] Criar Product DTO
- [ ] Tests unitários dos normalizers

#### Dia 9: ProductCatalog e Favorites
- [x] Criar entity ProductCatalog (Prisma)
  - id (uuid)
  - item_id
  - title
  - price
  - image_url
  - category_ids (json)
  - sales_quantity
  - is_similar (nullable)
  - metadata (json)
  - timestamps
- [x] Criar ProductCatalogService
- [x] Criar FavoriteProduct entity
- [x] Criar FavoriteProductsController
- [x] Criar FavoriteProductsService

#### Dia 10: AI Module
- [x] Criar AIModule
- [x] Portar OpenAIService
  - Método: completion
  - Método: chatCompletion
  - Método: analyzeProductSimilarity
- [x] Portar AnthropicService (Claude)
- [x] Criar AIController
- [ ] Implementar streaming de respostas (SSE)
- [ ] Tests

---

### 👨‍🎓 DEV JÚNIOR - Tarefas

#### Dia 6: UsersModule - CRUD
- [x] Criar UsersModule
- [x] Criar UsersController
  - GET /users (listagem com paginação)
  - GET /users/:id (detalhes)
  - POST /users (criar)
  - PATCH /users/:id (atualizar)
  - DELETE /users/:id (soft delete)
  - GET /users/leads (leads)
  - POST /users/:id/avatar (upload avatar)
- [x] Criar UsersService com toda lógica
- [x] Criar DTOs (CreateUserDto, UpdateUserDto, FilterUserDto)

#### Dia 7: UsersModule - Extras
- [ ] Implementar upload de avatar (Multer)
- [ ] Implementar filtros e busca
- [ ] Implementar paginação
- [ ] PATCH /users/:id/phone (atualizar telefone)
- [ ] PATCH /users/:id/validate-phone (validar telefone)
- [ ] Tests unitários do UsersService

#### Dia 8: UserAddress
- [x] Criar entity UserAddress
  - id (uuid)
  - user_id (fk)
  - street
  - number
  - complement
  - neighborhood
  - city
  - state
  - zip_code
  - country
  - is_default
  - timestamps
- [x] Criar UserAddressController
- [x] Criar UserAddressService
- [x] PATCH /user-address-default/:id
- [ ] Tests

#### Dia 9: ClientsModule
- [x] Criar ClientsModule
- [x] Criar ClientsController
  - Resource completo (CRUD)
  - GET /clients/active-plans
- [x] Criar ClientsService
- [x] Criar DTOs (CreateClientDto, UpdateClientDto)
- [x] Implementar relacionamento com User
- [ ] Tests unitários

#### Dia 10: PlansModule
- [x] Criar PlansModule
- [x] Criar PlansController
  - Resource completo
  - POST /plans/:id/image (upload)
  - GET /plans-active
- [x] Criar PlansService
- [x] Criar SubscriptionsController
  - Resource completo
- [x] Criar SubscriptionsService
- [x] Criar DTOs
- [ ] Tests

---

## 📋 SEMANA 3: MÓDULOS DE NEGÓCIO (Dias 11-15)

### 👨‍💼 DEV SÊNIOR - Tarefas

#### Dia 11: Solicitations - Entities
- [x] Criar entity Solicitation (Prisma)
  - id (uuid)
  - user_id (fk)
  - client_id (fk nullable)
  - type
  - status (enum)
  - quantity
  - code
  - responsible_type (polymorphic)
  - responsible_id (polymorphic)
  - timestamps
- [x] Criar entity SolicitationItem (Prisma)
  - id (uuid)
  - solicitation_id (fk)
  - product_data (json)
  - quantity
  - price
  - status
  - timestamps
- [x] Criar entity SolicitationItemAttachment (Prisma)
- [x] Schema Prisma já contém as migrations

#### Dia 12: Solicitations - CRUD
- [x] Criar SolicitationsModule
- [x] Criar SolicitationsController
  - GET /solicitations (com filtros)
  - GET /solicitations/:id
  - POST /solicitations
  - PATCH /solicitations/:id
  - DELETE /solicitations/:id
- [x] Criar SolicitationsService
- [x] Criar DTOs
- [x] Implementar auto-generate code

#### Dia 13: Solicitations - Features Avançadas
- [x] GET /solicitations/statistics
  - Total de solicitações
  - Valor total
  - Usuários únicos
  - Solicitações em aberto
  - Total de itens
- [x] GET /solicitations/kanban
- [x] POST /solicitations/assign/responsibility
- [x] Criar SolicitationItemsController
  - POST /solicitations/:id/items
  - DELETE /solicitations/:id/items/:item_id
- [ ] Implementar observers (lifecycle hooks)

#### Dia 14: Cart - Estrutura
- [x] Criar entity Cart (Prisma)
  - id (uuid)
  - user_id (fk)
  - solicitation_id (fk nullable)
  - items (json)
  - subtotal
  - shipping_cost
  - tax
  - total
  - pricing_data (json)
  - timestamps
- [x] Criar CartModule
- [x] Criar CartController
- [x] Criar CartService

#### Dia 15: Cart - Funcionalidades
- [x] POST /cart (adicionar item)
- [x] PATCH /cart/:id (atualizar item)
- [x] DELETE /cart/:id (remover item)
- [x] DELETE /cart/clear (limpar carrinho)
- [x] POST /cart/sync (sincronizar)
- [x] GET /carts (admin list)
- [x] Criar CartNormalizerService
- [x] Implementar cálculo de preços
- [x] Implementar cálculo de frete
- [ ] Tests

---

### 👨‍🎓 DEV JÚNIOR - Tarefas

#### Dia 11: NotificationsModule
- [x] Criar entity Notification (Prisma)
  - id (uuid)
  - user_id (fk)
  - type
  - data (json)
  - read_at (nullable)
  - timestamps
- [x] Criar NotificationsModule
- [x] Criar NotificationsController
  - GET /notifications (com paginação)
  - PUT /notifications/:id (mark as read)
  - PUT /notifications/mark-all-as-read
  - PUT /notifications/mark-all-as-unread
  - DELETE /notifications (delete all)
- [x] Criar NotificationsService

#### Dia 12: NotificationsModule - Extras
- [x] Implementar filtros (read/unread)
- [ ] Implementar real-time com WebSockets (opcional)
- [x] Criar DTOs
- [ ] Tests unitários
- [ ] Tests E2E

#### Dia 13: SettingsModule
- [x] Criar SettingsModule
- [x] Criar entity BoardingType (Prisma)
  - id (uuid)
  - name
  - description
  - brazil_expenses (decimal)
  - is_active
  - timestamps
- [x] Criar entity Freight (Prisma)
  - id (uuid)
  - origin
  - destination
  - cost
  - days
  - timestamps
- [x] Criar BoardingTypesController (Resource)
- [x] Criar BoardingTypesService
- [x] GET /settings/default-boarding-type
- [x] GET /settings/quotation

#### Dia 14: StatisticsModule
- [x] Criar StatisticsModule
- [x] Criar StatisticsController
- [x] Criar StatisticsService
- [x] GET /statistics/total-clients-by-plan
  - Query com agregação
  - Group by plan
- [x] GET /statistics/monthly-metrics
  - Receita mensal
  - Novos usuários
  - Novas solicitações
  - Taxa de conversão
- [x] GET /get-statistics-admin-dashboard
- [ ] Tests

#### Dia 15: TaxCalculatorModule
- [x] Criar TaxCalculatorModule
- [x] Criar entity TaxCalculation (Prisma)
  - id (uuid)
  - user_id (nullable)
  - product_data (json)
  - ncm_code
  - calculation_result (json)
  - timestamps
- [x] Criar entity CalculatorUser (Prisma)
  - id (uuid)
  - name
  - email
  - phone
  - company
  - timestamps
- [x] Criar TaxCalculationController
- [x] Criar CalculatorUsersController
- [x] Criar services correspondentes

---

## 📋 SEMANA 4: INTEGRAÇÕES E JOBS (Dias 16-20)

### 👨‍💼 DEV SÊNIOR - Tarefas

#### Dia 16: Bull Setup
- [ ] Instalar @nestjs/bull e bull
- [ ] Configurar BullModule no AppModule
- [ ] Setup Redis connection
- [ ] Configurar Bull Dashboard
- [ ] Criar JobsModule
- [ ] Criar queues:
  - catalog-queue
  - email-queue
  - export-queue
  - lead-queue
  - product-similarity-queue

#### Dia 17: Catalog Processor
- [ ] Criar CatalogProcessor
- [ ] Implementar job: process-catalog
  - Buscar categorias do Mercado Livre
  - Disparar job para cada categoria
- [ ] Implementar job: process-category
  - Buscar produtos da categoria
  - Adicionar ao catálogo
- [ ] Implementar job: add-product-to-catalog
  - Validar produto
  - Salvar no banco
- [ ] Implementar retry strategy
- [ ] Tests

#### Dia 18: Translation Module
- [x] Criar TranslationModule (em integrations/)
- [x] Portar AzureTranslatorService
  - translateText
  - detectLanguage
- [x] Portar GoogleTranslationService
  - translate
  - detectLanguage
  - getSupportedLanguages
- [x] Criar TranslationController
  - POST /translation/text
  - POST /translation/titles
  - POST /translation/product
  - POST /translation/detect-chinese
  - DELETE /translation/clear-cache
- [x] Implementar cache de traduções (24h TTL)
- [ ] Tests

#### Dia 19: CRM e SMS
- [x] Criar CRMModule (em integrations/)
- [x] Portar GoHighLevelService
  - createOrUpdateContact
  - addTag
  - removeTag
  - getContact
- [x] Portar N8NService
  - triggerWebhook
  - sendLeadToN8N
  - sendSolicitationToN8N
  - sendCustomEvent
- [x] Criar SMSModule / OTPModule
- [x] Portar TwilioService
  - sendOTP
  - validateOTP
  - resendOTP
  - sendSMS
- [x] Criar OTPController
  - POST /otp/send
  - POST /otp/validate
  - POST /otp/resend
- [ ] Tests

#### Dia 20: Webhooks e Leads
- [x] Criar WebhooksModule
- [x] Criar WebhooksController
  - POST /webhooks/typeform
  - POST /webhooks/generic
  - GET /webhooks/logs (ADMIN)
- [ ] Implementar signature validation
- [x] Criar LeadsModule
- [x] Criar LeadsController
  - POST /leads (criar lead)
  - GET /leads (listar com filtros)
  - GET /leads/stats/origin
  - GET /leads/stats/status
  - POST /leads/:id/convert
- [ ] Implementar throttling (10 req/min)
- [x] Integrar com GoHighLevelService (serviço criado, pronto para uso)
- [ ] Tests

---

### 👨‍🎓 DEV JÚNIOR - Tarefas

#### Dia 16: TaxCalculator - Features
- [ ] Implementar PricingService
  - calculateImportTax
  - calculateShipping
  - calculateTotalCost
- [ ] Implementar lógica de NCM
- [ ] POST /ncm/item (buscar NCM por descrição)
- [ ] POST /ncm/by-code (buscar NCM por código)
- [ ] Criar entity NCM
  - code
  - description
  - tax_rate
- [ ] GET /tax-calculations-list (admin)
- [ ] Tests

#### Dia 17: Mail Module
- [x] Criar MailModule
- [x] Criar MailService
- [x] Configurar SMTP (nodemailer)
- [x] Criar métodos de envio:
  - sendEmail (genérico)
  - sendNewUserEmail
  - sendPasswordResetEmail
  - sendNewSolicitationEmail
  - sendBulkEmail
- [ ] Criar EmailProcessor (Bull)
- [ ] Implementar jobs assíncronos
- [ ] Tests

#### Dia 18: Export Module
- [x] Criar ExportsModule
- [x] Criar ExportController
  - POST /export/request (enfileirar)
  - GET /exports (listar)
  - GET /exports/pending
- [x] Criar ExportService
  - Sistema de status (PENDING/PROCESSING/COMPLETED/FAILED)
  - requestExport
  - updateStatus
- [ ] Criar ExportProcessor (Bull)
- [ ] Implementar geração de arquivos:
  - exportToExcel
  - exportToPDF
  - exportToCSV
- [ ] Tests

#### Dia 19: CLI Commands
- [ ] Instalar nest-commander
- [ ] Criar CLIModule
- [ ] Criar comando: check-expired-subscriptions
  - Buscar subscriptions expiradas
  - Enviar notificações
  - Atualizar status
- [ ] Criar comando: cleanup-temp-images
  - Buscar imagens antigas
  - Deletar do storage
- [ ] Criar comando: clear-product-cache
  - Limpar cache Redis
  - Specific keys ou all
- [ ] Criar comando: process-catalog
  - Disparar job de catalog
- [ ] Criar comando: populate-cnpj-data
  - Buscar dados de CNPJ
  - Atualizar usuários
- [ ] Tests

#### Dia 20: Helpers e Utilidades
- [ ] Criar StringHelper
  - slugify
  - sanitize
  - truncate
  - etc
- [ ] Criar ProxyController
  - GET /proxy-image
  - GET /proxy-paises
- [ ] Criar NCMService
  - Busca por descrição
  - Busca por código
  - Cache de NCMs
- [ ] Criar FreightService
  - POST /frete/calcular
  - Buscar local mais próximo
  - Calcular CBM/Peso
- [ ] Implementar MercadoLivreService
  - categoriesList
  - getProductsByCategory
- [ ] Tests

---

## 📋 SEMANA 5: TESTES E DEPLOY (Dias 21-25)

### 👨‍💼 DEV SÊNIOR - Tarefas

#### Dia 21: Testes E2E - Parte 1
- [ ] Setup de testes E2E
- [ ] Criar test database
- [ ] Tests de autenticação
  - Login
  - Registro
  - Password reset
  - Refresh token
- [ ] Tests de produtos
  - Busca por keyword
  - Busca por imagem
  - Detalhes do produto
  - Favoritos

#### Dia 22: Testes E2E - Parte 2
- [ ] Tests de solicitações
  - CRUD completo
  - Kanban
  - Estatísticas
  - Assign responsibility
- [ ] Tests de carrinho
  - Adicionar item
  - Remover item
  - Sincronizar
  - Calcular preços
- [ ] Tests de jobs
  - Catalog processing
  - Email sending

#### Dia 23: Performance
- [ ] Análise de queries (query log)
- [ ] Criar indexes necessários
  - user.email
  - solicitation.user_id
  - solicitation.status
  - product_catalog.category_ids (GIN index para JSON)
  - etc
- [ ] Otimizar queries N+1
- [ ] Implementar eager/lazy loading
- [ ] Connection pooling
- [ ] Configurar rate limiting
- [ ] Load testing (Artillery/k6)

#### Dia 24: CI/CD
- [ ] Criar .github/workflows/ci.yml
  - Run tests
  - Run linter
  - Build
- [ ] Criar .github/workflows/deploy.yml
  - Deploy to staging
  - Deploy to production
- [ ] Configurar secrets
- [ ] Criar Dockerfile otimizado
  - Multi-stage build
  - Node alpine
- [ ] Criar docker-compose.yml

#### Dia 25: Monitoring e Deploy
- [ ] Configurar New Relic
- [ ] Setup de logs (Winston + CloudWatch/ELK)
- [ ] Health check endpoint (/health)
- [ ] Metrics endpoint (/metrics)
- [ ] Deploy para staging
- [ ] Smoke tests em staging
- [ ] Preparar rollback plan

---

### 👨‍🎓 DEV JÚNIOR - Tarefas

#### Dia 21: Testes Unitários - Parte 1
- [ ] Setup de testes unitários
- [ ] Mock de dependências
- [ ] Tests de UsersService
  - create
  - findAll
  - findOne
  - update
  - delete
- [ ] Tests de ClientsService
- [ ] Tests de PlansService
- [ ] Tests de SubscriptionsService

#### Dia 22: Testes Unitários - Parte 2
- [ ] Tests de NotificationsService
- [ ] Tests de StatisticsService
- [ ] Tests de MailService
- [ ] Tests de ExportService
- [ ] Tests de helpers
  - StringHelper
  - DateHelper
  - etc

#### Dia 23: Documentação - Swagger
- [ ] Configurar Swagger
- [ ] Adicionar decorators em todos controllers
  - @ApiTags
  - @ApiOperation
  - @ApiResponse
  - @ApiBearerAuth
- [ ] Documentar todos DTOs
  - @ApiProperty
- [ ] Exemplos de requests/responses
- [ ] Gerar documentação estática
- [ ] Publicar em /api/docs

#### Dia 24: Documentação - Geral
- [ ] README.md completo
  - Descrição do projeto
  - Como rodar localmente
  - Variáveis de ambiente
  - Scripts disponíveis
  - Arquitetura
- [ ] CONTRIBUTING.md
  - Como contribuir
  - Code style
  - Git flow
- [ ] Criar Postman Collection
- [ ] Exportar environment variables

#### Dia 25: Bugfixes e Polimento
- [ ] Revisar todos endpoints
- [ ] Corrigir bugs encontrados
- [ ] Validações extras
- [ ] Error messages consistentes
- [ ] Logs apropriados em todos lugares
- [ ] Security headers (Helmet)
- [ ] CORS configuration
- [ ] Rate limiting em endpoints públicos

---

## 📋 DIAS 26-30: TRANSIÇÃO

### 👨‍💼 + 👨‍🎓 (Trabalho Conjunto)

#### Dia 26: Testes de Aceitação
- [ ] Testar todos fluxos principais
  - Cadastro de usuário
  - Login
  - Busca de produtos
  - Criação de solicitação
  - Carrinho completo
  - Calculadora de impostos
- [ ] Comparar comportamento PHP vs NestJS
- [ ] Verificar integrações externas
- [ ] Verificar jobs em background

#### Dia 27: Performance Testing
- [ ] Load testing de endpoints críticos
  - /products/search
  - /solicitations
  - /cart
- [ ] Stress testing
- [ ] Identificar gargalos
- [ ] Otimizar se necessário

#### Dia 28: Migração de Dados
- [ ] Backup completo do banco PHP
- [ ] Verificar compatibilidade de schemas
- [ ] Criar scripts de migração (se necessário)
- [ ] Migração de dados em staging
- [ ] Validar integridade dos dados
- [ ] Testes com dados reais

#### Dia 29: Deploy Production
- [ ] Review final de código
- [ ] Merge para main
- [ ] Deploy para production (canary/blue-green)
- [ ] Monitoramento ativo
  - Logs em tempo real
  - Metrics dashboard
  - Error tracking
- [ ] Comunicar ao time
- [ ] Estar pronto para rollback

#### Dia 30: Estabilização
- [ ] Monitorar erros
- [ ] Hotfixes se necessário
- [ ] Documentação de issues encontradas
- [ ] Post-mortem meeting
  - O que funcionou bem
  - O que pode melhorar
  - Lições aprendidas
- [ ] Celebrar! 🎉

---

## 🎯 CHECKLIST GERAL DE COMPLETUDE

### Backend Features
- [ ] Todas as 531+ linhas de rotas migradas
- [ ] Todos os 25 controllers migrados
- [ ] Todos os 20 models migrados
- [ ] Todos os 17 services migrados
- [ ] Todos os 13 jobs migrados
- [ ] Todos os 13 middlewares/guards migrados
- [ ] Todas as 7 commands CLI migradas
- [ ] Todas as 60 migrations aplicadas

### Quality Assurance
- [ ] Code coverage > 80% (services)
- [ ] Code coverage > 60% (controllers)
- [ ] E2E tests de fluxos críticos
- [ ] Performance igual ou melhor que PHP
- [ ] Sem erros de linting
- [ ] Sem vulnerabilidades de segurança

### Documentation
- [ ] Swagger completo
- [ ] README atualizado
- [ ] Postman collection
- [ ] Architecture docs
- [ ] API examples

### DevOps
- [ ] CI/CD funcionando
- [ ] Docker funcionando
- [ ] Monitoring configurado
- [ ] Logs centralizados
- [ ] Health checks
- [ ] Backup strategy

---

## 📊 TRACKING DE PROGRESSO

### Como usar este checklist:
1. Marcar [ ] como [x] quando completar
2. Adicionar comentários se necessário
3. Usar como base para daily standups
4. Atualizar estimativas conforme necessário
5. Comunicar blockers imediatamente

### Legenda:
- [ ] = Não iniciado
- [x] = Completo
- [⚠️] = Bloqueado/Issue
- [🔄] = Em progresso

---

**Última atualização:** 2025-11-11
**Status:** PRONTO PARA INICIAR


