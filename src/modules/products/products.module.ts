import { Module, forwardRef } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '../../database/database.module'
import { ChinaMarketplaceModule } from '../../integrations/china-marketplace/china-marketplace.module'
import { MarketplaceModule } from '../../integrations/marketplace/marketplace.module'
import { OpenAIService } from '../../integrations/ai-providers/openai/openai.service'
import { AIModule } from '../ai/ai.module'
import { SettingsModule } from '../settings/settings.module'
import { ProductsController } from './controllers/products.controller'
import { ProductsService } from './services/products.service'
import { ProductCatalogService } from './services/product-catalog.service'
import { Alibaba1688Normalizer } from './services/normalizers/alibaba-1688.normalizer'
import { AlibabaIntlNormalizer } from './services/normalizers/alibaba-intl.normalizer'
import { ProductNormalizerService } from './services/normalizers/product-normalizer.service'

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    ConfigModule,
    CacheModule.register(),
    forwardRef(() => ChinaMarketplaceModule),
    MarketplaceModule,
    AIModule,
    SettingsModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductCatalogService,
    ProductNormalizerService,
    Alibaba1688Normalizer,
    AlibabaIntlNormalizer,
    OpenAIService,
  ],
  exports: [ProductsService, ProductNormalizerService],
})
export class ProductsModule {}


