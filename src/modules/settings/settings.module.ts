import { HttpModule } from '@nestjs/axios'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { BoardingTypesController } from './controllers/boarding-types.controller'
import { FreightsController } from './controllers/freights.controller'
import { QuotationController } from './controllers/quotation.controller'
import { BoardingTypesService } from './services/boarding-types.service'
import { FreightsService } from './services/freights.service'
import { QuotationService } from './services/quotation.service'

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    CacheModule.register({
      ttl: 86400000,
    }),
  ],
  controllers: [BoardingTypesController, FreightsController, QuotationController],
  providers: [BoardingTypesService, FreightsService, QuotationService],
  exports: [BoardingTypesService, FreightsService, QuotationService],
})
export class SettingsModule {}
