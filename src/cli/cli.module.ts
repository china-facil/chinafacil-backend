import { BullModule } from '@nestjs/bull'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '../database/database.module'
import { PlansModule } from '../modules/plans/plans.module'
import { CheckExpiredSubscriptionsCommand } from './commands/check-expired-subscriptions.command'
import { CleanupTempImagesCommand } from './commands/cleanup-temp-images.command'
import { ClearProductCacheCommand } from './commands/clear-product-cache.command'
import { ProcessCatalogCommand } from './commands/process-catalog.command'
import { PopulateCnpjDataCommand } from './commands/populate-cnpj-data.command'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    PlansModule,
    BullModule.registerQueue({
      name: 'catalog-queue',
    }),
    HttpModule,
  ],
  providers: [
    CheckExpiredSubscriptionsCommand,
    CleanupTempImagesCommand,
    ClearProductCacheCommand,
    ProcessCatalogCommand,
    PopulateCnpjDataCommand,
  ],
})
export class CliModule {}

