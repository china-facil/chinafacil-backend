import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { CRMModule } from "../crm/crm.module";
import { WebhookSignatureGuard } from '../../common/guards/webhook-signature.guard'
import { WebhooksController } from './webhooks.controller'
import { WebhooksService } from './webhooks.service'

@Module({
  imports: [DatabaseModule, CRMModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookSignatureGuard],
  exports: [WebhooksService],
})
export class WebhooksModule {}
