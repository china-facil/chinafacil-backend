import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { CalculatorUsersController } from './controllers/calculator-users.controller'
import { TaxCalculationController } from './controllers/tax-calculation.controller'
import { CalculatorUsersService } from './services/calculator-users.service'
import { TaxCalculationService } from './services/tax-calculation.service'

@Module({
  imports: [DatabaseModule],
  controllers: [TaxCalculationController, CalculatorUsersController],
  providers: [TaxCalculationService, CalculatorUsersService],
  exports: [TaxCalculationService, CalculatorUsersService],
})
export class TaxCalculatorModule {}

