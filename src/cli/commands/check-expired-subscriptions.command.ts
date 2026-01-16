import { Command, CommandRunner } from 'nest-commander'
import { Logger } from '@nestjs/common'
import { SubscriptionsService } from '../../modules/plans/services/subscriptions.service'

@Command({
  name: 'check-expired-subscriptions',
  description: 'Verifica e desativa subscriptions expiradas, alterando a role dos usuários para LEAD',
})
export class CheckExpiredSubscriptionsCommand extends CommandRunner {
  private readonly logger = new Logger(CheckExpiredSubscriptionsCommand.name)

  constructor(private readonly subscriptionsService: SubscriptionsService) {
    super()
  }

  async run(): Promise<void> {
    this.logger.log('Verificando subscriptions expiradas...')

    try {
      const result = await this.subscriptionsService.expireSubscriptions()

      if (result.processedCount === 0) {
        this.logger.log('Nenhuma subscription expirada encontrada.')
        return
      }

      this.logger.log(
        `Processamento concluído: ${result.processedCount} subscriptions processadas com sucesso, ${result.errorCount} erros.`,
      )
    } catch (error: any) {
      this.logger.error(
        `Erro ao processar subscriptions expiradas: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }
}
