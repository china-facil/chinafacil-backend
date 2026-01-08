import { Injectable, Logger } from '@nestjs/common'
import { INestApplication } from '@nestjs/common/interfaces'
import { getQueueToken } from '@nestjs/bull'
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class BullBoardService {
  private readonly logger = new Logger(BullBoardService.name)
  private app: INestApplication
  private isConfigured = false

  constructor(private readonly configService: ConfigService) {}

  setApp(app: INestApplication) {
    this.app = app
  }

  setupBullBoard() {
    if (this.isConfigured) {
      this.logger.warn('Bull Board já foi configurado')
      return
    }

    if (!this.app) {
      this.logger.error('App instance não foi definida')
      return
    }
    try {
      const serverAdapter = new ExpressAdapter()
      serverAdapter.setBasePath('/admin/queues')

      const queues = []
      const queueNames = [
        'email-queue',
        'export-queue',
        'catalog-queue',
        'lead-queue',
        'product-similarity-queue',
      ]

      for (const queueName of queueNames) {
        try {
          const queue = this.app.get(getQueueToken(queueName))
          queues.push(new BullAdapter(queue))
        } catch (error) {
          this.logger.warn(`Fila ${queueName} não encontrada`)
        }
      }

      if (queues.length > 0) {
        createBullBoard({
          queues,
          serverAdapter,
        })

        this.app.use('/admin/queues', serverAdapter.getRouter())
        this.isConfigured = true
        const port = this.configService.get('PORT') || 3000
        this.logger.log(`Bull Board configurado: http://localhost:${port}/admin/queues`)
      } else {
        this.logger.warn('Nenhuma fila encontrada para configurar o Bull Board')
      }
    } catch (error) {
      this.logger.error(`Erro ao configurar Bull Board: ${error.message}`, error.stack)
    }
  }
}

