import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CheckExpiredSubscriptionsCommand } from './commands/check-expired-subscriptions.command'
import { CleanupTempImagesCommand } from './commands/cleanup-temp-images.command'

@Module({
  imports: [DatabaseModule],
  providers: [CheckExpiredSubscriptionsCommand, CleanupTempImagesCommand],
})
export class CliModule {}

