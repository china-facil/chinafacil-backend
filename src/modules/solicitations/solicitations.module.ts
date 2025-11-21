import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { SolicitationItemsController } from './controllers/solicitation-items.controller'
import { SolicitationsController } from './controllers/solicitations.controller'
import { SolicitationObserver } from './observers/solicitation.observer'
import { SolicitationItemsService } from './services/solicitation-items.service'
import { SolicitationsService } from './services/solicitations.service'

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [SolicitationsController, SolicitationItemsController],
  providers: [SolicitationsService, SolicitationItemsService, SolicitationObserver],
  exports: [SolicitationsService, SolicitationItemsService],
})
export class SolicitationsModule {}


