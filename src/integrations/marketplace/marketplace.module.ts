import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MercadoLivreService } from './mercado-livre.service'

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [MercadoLivreService],
  exports: [MercadoLivreService],
})
export class MarketplaceModule {}




