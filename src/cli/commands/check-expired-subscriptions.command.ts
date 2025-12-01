import { Command, CommandRunner } from 'nest-commander'
import { PrismaService } from '../../database/prisma.service'
import { SubscriptionStatus, UserRole } from '@prisma/client'
import { Logger } from '@nestjs/common'

@Command({
  name: 'check-expired-subscriptions',
  description: 'Verifica e desativa subscriptions expiradas, alterando a role dos usuários para USER',
})
export class CheckExpiredSubscriptionsCommand extends CommandRunner {
  private readonly logger = new Logger(CheckExpiredSubscriptionsCommand.name)

  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async run(): Promise<void> {
    this.logger.log('Verificando subscriptions expiradas...')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.active,
        currentPeriodEnd: {
          lte: today,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (expiredSubscriptions.length === 0) {
      this.logger.log('Nenhuma subscription expirada encontrada.')
      return
    }

    let processedCount = 0
    let errorCount = 0

    for (const subscription of expiredSubscriptions) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: SubscriptionStatus.inactive,
            },
          })

          if (subscription.user && subscription.user.role !== UserRole.user) {
            await tx.user.update({
              where: { id: subscription.user.id },
              data: {
                role: UserRole.user,
              },
            })
          }

          await tx.notification.create({
            data: {
              type: 'WARNING',
              notifiableType: 'App\\Models\\User',
              notifiableId: subscription.user.id,
              data: JSON.stringify({
                message: `Sua assinatura do plano ${subscription.plan.name} expirou. Entre em contato para renovar.`,
                subscriptionId: subscription.id,
                planName: subscription.plan.name,
                expiredAt: subscription.currentPeriodEnd?.toISOString(),
              }),
            },
          })
        })

        this.logger.log(
          `Subscription ID ${subscription.id} desativada. Usuário ${subscription.user.name} (${subscription.user.email}) atualizado.`,
        )
        processedCount++
      } catch (error) {
        this.logger.error(
          `Erro ao processar subscription ID ${subscription.id}: ${error.message}`,
          error.stack,
        )
        errorCount++
      }
    }

    this.logger.log(
      `Processamento concluído: ${processedCount} subscriptions processadas com sucesso, ${errorCount} erros.`,
    )
  }
}

