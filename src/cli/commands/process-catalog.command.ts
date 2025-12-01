import { Command, CommandRunner } from 'nest-commander'
import { Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { ProcessCatalogJobDto } from '../../jobs/dto/catalog-job.dto'

@Command({
  name: 'process-catalog',
  description: 'Dispara o job de processamento de catálogo de produtos',
})
export class ProcessCatalogCommand extends CommandRunner {
  private readonly logger = new Logger(ProcessCatalogCommand.name)

  constructor(
    @InjectQueue('catalog-queue') private readonly catalogQueue: Queue,
  ) {
    super()
  }

  async run(): Promise<void> {
    this.logger.log('Disparando job de processamento de catálogo...')

    try {
      const job = await this.catalogQueue.add(
        'process-catalog',
        {} as ProcessCatalogJobDto,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      )

      this.logger.log(`✅ Job de catálogo disparado com sucesso! ID: ${job.id}`)
      this.logger.log(`   Use o Bull Board Dashboard para acompanhar o progresso`)
    } catch (error: any) {
      this.logger.error(`Erro ao disparar job de catálogo: ${error.message}`, error.stack)
      throw error
    }
  }
}









