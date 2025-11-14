import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { ExportsController } from './exports.controller'
import { ExportsService } from './exports.service'

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'export-queue',
    }),
  ],
  controllers: [ExportsController],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}


