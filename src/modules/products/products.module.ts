import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { DatabaseModule } from '../../database/database.module'
import { AlibabaModule } from '../../integrations/alibaba/alibaba.module'
import { ProductsController } from './controllers/products.controller'
import { ProductsService } from './services/products.service'
import { Alibaba1688Normalizer } from './services/normalizers/alibaba-1688.normalizer'
import { AlibabaIntlNormalizer } from './services/normalizers/alibaba-intl.normalizer'
import { ProductNormalizerService } from './services/normalizers/product-normalizer.service'

@Module({
  imports: [DatabaseModule, HttpModule, AlibabaModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductNormalizerService,
    Alibaba1688Normalizer,
    AlibabaIntlNormalizer,
  ],
  exports: [ProductsService, ProductNormalizerService],
})
export class ProductsModule {}


