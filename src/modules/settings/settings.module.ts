import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { BoardingTypesController } from './controllers/boarding-types.controller'
import { FreightsController } from './controllers/freights.controller'
import { BoardingTypesService } from './services/boarding-types.service'
import { FreightsService } from './services/freights.service'

@Module({
  imports: [DatabaseModule],
  controllers: [BoardingTypesController, FreightsController],
  providers: [BoardingTypesService, FreightsService],
  exports: [BoardingTypesService, FreightsService],
})
export class SettingsModule {}


