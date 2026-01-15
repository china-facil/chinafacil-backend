import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'
import { CartPdfService } from './services/cart-pdf.service'
import { CartPdfTemplateService } from './services/cart-pdf-template.service'
import { TaxCalculatorModule } from '../tax-calculator/tax-calculator.module'

@Module({
  imports: [DatabaseModule, TaxCalculatorModule],
  controllers: [CartController],
  providers: [CartService, CartPdfService, CartPdfTemplateService],
  exports: [CartService],
})
export class CartModule {}


