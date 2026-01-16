import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { SolicitationItemsController } from './controllers/solicitation-items.controller'
import { SolicitationTrackingController } from './controllers/solicitation-tracking.controller'
import { SolicitationsController } from './controllers/solicitations.controller'
import { SolicitationObserver } from './observers/solicitation.observer'
import { SolicitationItemsService } from './services/solicitation-items.service'
import { SolicitationTrackingService } from './services/solicitation-tracking.service'
import { SolicitationsService } from './services/solicitations.service'

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [SolicitationsController, SolicitationItemsController, SolicitationTrackingController],
  providers: [SolicitationsService, SolicitationItemsService, SolicitationTrackingService, SolicitationObserver],
  exports: [SolicitationsService, SolicitationItemsService, SolicitationTrackingService],
})
export class SolicitationsModule {}


