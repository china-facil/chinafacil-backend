import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { SolicitationItemsController } from './controllers/solicitation-items.controller'
import { SolicitationsController } from './controllers/solicitations.controller'
import { SolicitationItemsService } from './services/solicitation-items.service'
import { SolicitationsService } from './services/solicitations.service'

@Module({
  imports: [DatabaseModule],
  controllers: [SolicitationsController, SolicitationItemsController],
  providers: [SolicitationsService, SolicitationItemsService],
  exports: [SolicitationsService, SolicitationItemsService],
})
export class SolicitationsModule {}


