import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { SubscriptionsService } from './subscriptions.service'

@Injectable()
export class SubscriptionExpirationCronService {
  private readonly logger = new Logger(SubscriptionExpirationCronService.name)

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiredSubscriptions() {
    this.logger.log('Iniciando verificação de assinaturas expiradas...')

    try {
      const result = await this.subscriptionsService.expireSubscriptions()

      if (result.processedCount === 0) {
        this.logger.log('Nenhuma assinatura expirada encontrada.')
        return
      }

      this.logger.log(
        `Processamento concluído: ${result.processedCount} assinaturas processadas com sucesso, ${result.errorCount} erros.`,
      )
    } catch (error: any) {
      this.logger.error(
        `Erro ao processar assinaturas expiradas: ${error.message}`,
        error.stack,
      )
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiringSubscriptions() {
    this.logger.log('Iniciando verificação de assinaturas próximas de expirar...')

    try {
      const result = await this.subscriptionsService.notifyExpiringSubscriptions()

      if (result.processedCount === 0) {
        this.logger.log('Nenhuma assinatura próxima de expirar encontrada.')
        return
      }

      this.logger.log(
        `Processamento concluído: ${result.processedCount} notificações de expiração criadas com sucesso, ${result.errorCount} erros.`,
      )
    } catch (error: any) {
      this.logger.error(
        `Erro ao processar assinaturas próximas de expirar: ${error.message}`,
        error.stack,
      )
    }
  }
}
