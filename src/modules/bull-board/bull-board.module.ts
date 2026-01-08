import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullBoardService } from './bull-board.service'

@Module({
  imports: [ConfigModule],
  providers: [BullBoardService],
  exports: [BullBoardService],
})
export class BullBoardModule {}

