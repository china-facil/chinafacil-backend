import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { AIModule } from '../ai/ai.module'
import { DatabaseModule } from '../../database/database.module'
import { SettingsModule } from '../settings/settings.module'
import { CalculatorUsersController } from './controllers/calculator-users.controller'
import { NcmController } from './controllers/ncm.controller'
import { TaxCalculationController } from './controllers/tax-calculation.controller'
import { CalculatorUsersService } from './services/calculator-users.service'
import { NcmService } from './services/ncm.service'
import { TaxCalculationService } from './services/tax-calculation.service'
import { PricingService } from './services/pricing.service'

@Module({
  imports: [
    DatabaseModule,
    AIModule,
    SettingsModule,
    CacheModule.register({
      ttl: 604800000,
    }),
  ],
  controllers: [
    TaxCalculationController,
    CalculatorUsersController,
    NcmController,
  ],
  providers: [
    TaxCalculationService,
    CalculatorUsersService,
    NcmService,
    PricingService,
  ],
  exports: [
    TaxCalculationService,
    CalculatorUsersService,
    NcmService,
    PricingService,
  ],
})
export class TaxCalculatorModule {}


