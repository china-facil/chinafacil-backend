import { Module } from '@nestjs/common'
import { BullBoardModule } from '@bull-board/nestjs'
import { ExpressAdapter } from '@bull-board/express'
import { BullAdapter } from '@bull-board/api/bullAdapter'

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'email-queue',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'export-queue',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'catalog-queue',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'lead-queue',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'product-similarity-queue',
      adapter: BullAdapter,
    }),
  ],
})
export class BullBoardModuleConfig {}

