import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { TmService } from './services/tm.service'
import { OtService } from './services/ot.service'

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [TmService, OtService],
  exports: [TmService, OtService],
})
export class AlibabaModule {}

