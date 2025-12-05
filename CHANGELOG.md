# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.2.0 (2025-12-05)


### 📚 Documentação

* atualiza checklist marcando EmailProcessor e ExportProcessor como concluídos ([29735b4](https://github.com/china-facil/chinafacil-backend/commit/29735b4c332fbed5ee9c43703cc8537cf003a768))
* atualiza checklist marcando tasks concluídas ([97cc28e](https://github.com/china-facil/chinafacil-backend/commit/97cc28edf6b8be670005190011c31ff69b01ace7))


### ♻️ Refatoração

* remove pasta database/entities não utilizada ([4a29c79](https://github.com/china-facil/chinafacil-backend/commit/4a29c794e831faafede7b0c0a3b53e618b685e96))


### 🐛 Correções

* add eslint config and use remote db for tests ([fbe0ac4](https://github.com/china-facil/chinafacil-backend/commit/fbe0ac49a361dd08728aafe9aaff6b529edb2cda))
* add logs module and fix gitignore pattern ([cd66853](https://github.com/china-facil/chinafacil-backend/commit/cd6685337d275523434163a302f8ff7813ee97cc))
* adiciona tratamento de PrismaClientInitializationError no filtro de exceções ([643e333](https://github.com/china-facil/chinafacil-backend/commit/643e33339d628badfe10a9acd1139388e8cb3161))
* adicionar modelos faltantes ao schema Prisma e instalar dependências ([319e0c5](https://github.com/china-facil/chinafacil-backend/commit/319e0c5b59418ddb3ec9f18eb72d05f547aaa4db))
* correct deploy directory name to chinafacil-backend ([1b549b8](https://github.com/china-facil/chinafacil-backend/commit/1b549b83d198bd3728681c91665c7e841c220126))
* corrige erros em endpoints de produtos ([e71a8dd](https://github.com/china-facil/chinafacil-backend/commit/e71a8dd71164cea9685c1891d047f94116c31314))
* corrige imports de módulos e caminho do CurrentUser decorator ([d48e119](https://github.com/china-facil/chinafacil-backend/commit/d48e1196cf3286a6d900dc462c47e491ef2b418b))
* corrige schema Prisma para refletir estrutura real do banco ([10df759](https://github.com/china-facil/chinafacil-backend/commit/10df75901306e8dee02e0bc7ff282a35dca98db2))
* corrige testes para seguir padrão de integração ([0be55a5](https://github.com/china-facil/chinafacil-backend/commit/0be55a5eb01791ecc994335204f6cbd03d3dd6a3))
* escape heredoc for CircleCI 2.1+ ([ecf5e85](https://github.com/china-facil/chinafacil-backend/commit/ecf5e8580f0ea6110609e66da77af6a89838031a))
* eslint config, use remote test db, skip external API tests ([517b153](https://github.com/china-facil/chinafacil-backend/commit/517b15390a6e0b1a18796eb346214ca648ccc188))
* melhora tratamento de erros de conexão no login e Prisma ([e2adb5d](https://github.com/china-facil/chinafacil-backend/commit/e2adb5df10706fc84a6c4fe98554b493e63388dc))
* melhora tratamento de erros e query em getPopularProducts ([b0cc81f](https://github.com/china-facil/chinafacil-backend/commit/b0cc81fafa12c4828b18dc74a5950aa0c85acc5c))
* passa getCNY para transformProductCatalogToResponse em getPopularProducts ([1c069e6](https://github.com/china-facil/chinafacil-backend/commit/1c069e67eb856999f972145a8edf48e6927d6a2e))
* passa getCNY para transformProductCatalogToResponse em getProductsByCategory ([a675ba2](https://github.com/china-facil/chinafacil-backend/commit/a675ba2f8cf11fcdef55ce9fdade1101ef7ed544))
* use DATABASE_URL directly from CircleCI env vars ([42501b1](https://github.com/china-facil/chinafacil-backend/commit/42501b15e49207838240d24190b5858c123a6025))


### ✨ Funcionalidades

* add automatic rollback on deploy failure ([7c86e8f](https://github.com/china-facil/chinafacil-backend/commit/7c86e8f9473f338b0dc6167d70a4950eba3cc550))
* adiciona métodos de cálculo de frete ao FreightsService ([8f68b89](https://github.com/china-facil/chinafacil-backend/commit/8f68b8973a2ac78226d3a410daf553afed978e05))
* adiciona queues do Bull e corrige erros de compilação ([6334851](https://github.com/china-facil/chinafacil-backend/commit/6334851c295b283a8abeda43164979f71a104d16))
* adiciona Transaction Interceptor para gerenciar transações do Prisma ([e320433](https://github.com/china-facil/chinafacil-backend/commit/e320433582117d19336547711abb90eda248460f))
* adiciona transformação de ProductCatalog para formato do PHP ([19a000d](https://github.com/china-facil/chinafacil-backend/commit/19a000df7903468aa844550e4d7c782bb049eb1c))
* adicionar configuração Docker (Docker Compose, Dockerfile, .dockerignore) ([2308438](https://github.com/china-facil/chinafacil-backend/commit/23084387ec7e5591ea5cb0d9308b5d1a85167852))
* adicionar DTOs de autenticação ([3100405](https://github.com/china-facil/chinafacil-backend/commit/3100405d631e001d40b3c55b6e814df2aec06427))
* **cli:** adiciona comando cleanup-temp-images para limpar imagens temporárias antigas ([5f14cd9](https://github.com/china-facil/chinafacil-backend/commit/5f14cd94e53cadebd33c86ea6149c90f4a0babe1))
* **cli:** adiciona comando clear-product-cache para limpar cache Redis ([4dce820](https://github.com/china-facil/chinafacil-backend/commit/4dce82010bff61623f2a7a56d2ed651ffda137dd))
* **cli:** adiciona comandos process-catalog e populate-cnpj-data ([d8e49f9](https://github.com/china-facil/chinafacil-backend/commit/d8e49f9ce61bfb11455ae67742da4293bf73f945))
* configura Bull Dashboard para monitoramento de filas ([cbb1429](https://github.com/china-facil/chinafacil-backend/commit/cbb14293bcfec1f7dedcf62a844389da225a77f6))
* expande StringHelper e cria DateHelper para centralizar operações comuns ([91d24e9](https://github.com/china-facil/chinafacil-backend/commit/91d24e957409ef85b9016061c3088999ba668495))
* implementa CatalogProcessor para processamento de catálogo ([27a975a](https://github.com/china-facil/chinafacil-backend/commit/27a975a89b3713bae3fe07e2419bf63e8a77cfd1))
* implementa EmailProcessor com Bull para jobs assíncronos de email ([0c23066](https://github.com/china-facil/chinafacil-backend/commit/0c2306648ea6136285870fa2d897c96c4d563d84))
* implementa endpoint de cotação de moedas ([90b4d5b](https://github.com/china-facil/chinafacil-backend/commit/90b4d5b20b545c03d6bbc033c5806aa5f400faf7))
* implementa endpoints faltantes de produtos e corrige proxy-paises ([5cd034f](https://github.com/china-facil/chinafacil-backend/commit/5cd034f75727401166519b96207371a73176cc4e))
* implementa ExportProcessor com Bull para processar exportações ([bdb114f](https://github.com/china-facil/chinafacil-backend/commit/bdb114f9bc280c0046fe504bbbf8e749fc046486))
* implementa MercadoLivreService para integração com Mercado Livre ([bf9917b](https://github.com/china-facil/chinafacil-backend/commit/bf9917b852c851402f0d6dc6a98ec1a5079f37ea))
* implementa módulo UserAddress completo ([4e6a76f](https://github.com/china-facil/chinafacil-backend/commit/4e6a76f329df652e8bafba3c32df4857cacd6774))
* implementa NCMService para busca de códigos NCM ([a84ae00](https://github.com/china-facil/chinafacil-backend/commit/a84ae000d68ac5ef65ddebe059b0723e20afbda8))
* implementa PricingService para cálculos de importação ([c7a08d7](https://github.com/china-facil/chinafacil-backend/commit/c7a08d7dd70ea5bf4ffc37ae12c7597bdb4c989c))
* implementa ProxyController para proxy de imagens e países ([191e4f1](https://github.com/china-facil/chinafacil-backend/commit/191e4f11f77db10a49140f5bd44d47d3c3b3f738))
* implementa retry strategy no CatalogProcessor ([e4540b3](https://github.com/china-facil/chinafacil-backend/commit/e4540b37aa8ec303f3a3adde1f581c7f2d03df82))
* implementar AIModule e TranslationModule ([0fb4f68](https://github.com/china-facil/chinafacil-backend/commit/0fb4f689751cfb689cd9fc30f4699b7abb575385))
* implementar ClientsModule e PlansModule completos ([4edcb0b](https://github.com/china-facil/chinafacil-backend/commit/4edcb0bf688c455336a754ec999874aeeaceee9f))
* implementar CRMModule, SMSModule/OTPModule + atualizar checklist ([9c8c10b](https://github.com/china-facil/chinafacil-backend/commit/9c8c10b8ca47096fe44971afbeb1ceb771713611))
* implementar MailModule, ExportsModule, LeadsModule e WebhooksModule ([1bbe1ea](https://github.com/china-facil/chinafacil-backend/commit/1bbe1ea1878f4e52d642db1578ffa2d2bf28ef96))
* implementar observers para solicitations, SSE streaming no AI, melhorias no NCM service e validações adicionais ([5d999db](https://github.com/china-facil/chinafacil-backend/commit/5d999dbe297119cf2f40ab31c93a5a7836977108))
* implementar ProductsModule completo com integrações Alibaba ([4f211a6](https://github.com/china-facil/chinafacil-backend/commit/4f211a6d5ffb85d379aa432e7343cf970f6378db))
* implementar sistema de autenticação completo ([3cfeb8e](https://github.com/china-facil/chinafacil-backend/commit/3cfeb8edd53004fa4c706be9cf7513264e7ae4ff))
* implementar SolicitationsModule, CartModule e NotificationsModule ([56a84ae](https://github.com/china-facil/chinafacil-backend/commit/56a84ae2bdc25654412b2683c0622f5753fe9ed7))
* implementar StatisticsModule, SettingsModule e TaxCalculatorModule ([87ac303](https://github.com/china-facil/chinafacil-backend/commit/87ac3032548adb45867013375f9006f8231fc870))
* implementar throttling de 10 req/min no endpoint POST /leads ([4da342e](https://github.com/china-facil/chinafacil-backend/commit/4da342e41ea72aa767496d547d8112f4917462d0))
* implementar UsersModule completo com CRUD e funcionalidades extras ([b7c8df3](https://github.com/china-facil/chinafacil-backend/commit/b7c8df37b460f1d7c8ed978844477ee2f3083412))
* implementar validação de assinatura de webhook ([cb6b7d0](https://github.com/china-facil/chinafacil-backend/commit/cb6b7d09eb48b3fb2f3979aeb3dcd0fd36808b48))
* melhorar endpoint GET /tax-calculations com filtros e paginação ([45db5b4](https://github.com/china-facil/chinafacil-backend/commit/45db5b4e3b11f583c53489b2506d278cf698ad37))
* melhorar tratamento de erros do Prisma no AllExceptionsFilter ([16aaf6c](https://github.com/china-facil/chinafacil-backend/commit/16aaf6ceb4733b04f68b5f71d22c845d62acb824))
* pre commit husky + release + circle ([60020b2](https://github.com/china-facil/chinafacil-backend/commit/60020b27923c114a0cf8534429d6f10e185aeb08))
* use docker compose for production instead of PM2 ([6121314](https://github.com/china-facil/chinafacil-backend/commit/61213143b349ca395debb5e7c922817770774e4d))
