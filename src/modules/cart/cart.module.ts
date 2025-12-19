import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'
import { PdfGeneratorService } from './services/pdf-generator.service'

@Module({
  imports: [DatabaseModule],
  controllers: [CartController],
  providers: [CartService, PdfGeneratorService],
  exports: [CartService, PdfGeneratorService],
})
export class CartModule {}


