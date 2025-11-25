import { Module, forwardRef } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { ProductsModule } from '../../modules/products/products.module'
import { TmService } from './services/tm.service'
import { OtService } from './services/ot.service'

@Module({
  imports: [HttpModule, ConfigModule, forwardRef(() => ProductsModule)],
  providers: [TmService, OtService],
  exports: [TmService, OtService],
})
export class AlibabaModule {}


