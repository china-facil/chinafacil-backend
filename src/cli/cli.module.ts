import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CheckExpiredSubscriptionsCommand } from './commands/check-expired-subscriptions.command'

@Module({
  imports: [DatabaseModule],
  providers: [CheckExpiredSubscriptionsCommand],
})
export class CliModule {}

