import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '../database/database.module'
import { CheckExpiredSubscriptionsCommand } from './commands/check-expired-subscriptions.command'
import { CleanupTempImagesCommand } from './commands/cleanup-temp-images.command'
import { ClearProductCacheCommand } from './commands/clear-product-cache.command'

@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [
    CheckExpiredSubscriptionsCommand,
    CleanupTempImagesCommand,
    ClearProductCacheCommand,
  ],
})
export class CliModule {}

