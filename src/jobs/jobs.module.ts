import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CRMModule } from '../modules/crm/crm.module'
import { MailModule } from '../modules/mail/mail.module'
import { ExportsModule } from '../modules/exports/exports.module'
import { MarketplaceModule } from '../integrations/marketplace/marketplace.module'
import { EmailProcessor } from './processors/email.processor'
import { ExportProcessor } from './processors/export.processor'
import { CatalogProcessor } from './processors/catalog.processor'
import { LeadProcessor } from './processors/lead.processor'

@Module({
  imports: [
    DatabaseModule,
    CRMModule,
    BullModule.registerQueue(
      {
        name: 'email-queue',
      },
      {
        name: 'export-queue',
      },
      {
        name: 'catalog-queue',
      },
      {
        name: 'lead-queue',
      },
      {
        name: 'product-similarity-queue',
      },
    ),
    MailModule,
    ExportsModule,
    MarketplaceModule,
  ],
  providers: [EmailProcessor, ExportProcessor, CatalogProcessor, LeadProcessor],
  exports: [EmailProcessor, ExportProcessor, CatalogProcessor, LeadProcessor],
})
export class JobsModule {}
