import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { PlansController } from './controllers/plans.controller'
import { SubscriptionsController } from './controllers/subscriptions.controller'
import { PlansService } from './services/plans.service'
import { SubscriptionsService } from './services/subscriptions.service'
import { SubscriptionExpirationCronService } from './services/subscription-expiration-cron.service'

@Module({
  imports: [DatabaseModule],
  controllers: [PlansController, SubscriptionsController],
  providers: [PlansService, SubscriptionsService, SubscriptionExpirationCronService],
  exports: [PlansService, SubscriptionsService],
})
export class PlansModule {}
