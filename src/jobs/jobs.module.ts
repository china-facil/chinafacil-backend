import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { MailModule } from '../modules/mail/mail.module'
import { ExportsModule } from '../modules/exports/exports.module'
import { EmailProcessor } from './processors/email.processor'
import { ExportProcessor } from './processors/export.processor'

@Module({
  imports: [
    DatabaseModule,
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
  ],
  providers: [EmailProcessor, ExportProcessor],
  exports: [EmailProcessor, ExportProcessor],
})
export class JobsModule {}

