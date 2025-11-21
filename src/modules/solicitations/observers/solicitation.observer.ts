import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { NotificationsService } from '../../notifications/notifications.service'

@Injectable()
export class SolicitationObserver implements OnModuleInit {
  private readonly logger = new Logger(SolicitationObserver.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.setupHooks()
  }

  private setupHooks() {
    this.prisma.$use(async (params, next) => {
      if (params.model === 'Solicitation') {
        if (params.action === 'create') {
          const result = await next(params)
          await this.onSolicitationCreated(result)
          return result
        }

        if (params.action === 'update') {
          const before = await this.prisma.solicitation.findUnique({
            where: { id: params.args.where.id },
          })

          const result = await next(params)

          if (before && result) {
            await this.onSolicitationUpdated(before, result)
          }

          return result
        }
      }

      return next(params)
    })
  }

  private async onSolicitationCreated(solicitation: any) {
    try {
      this.logger.log(`Solicitation created: ${solicitation.id}`)

      await this.notificationsService.create({
        userId: solicitation.userId,
        type: 'SUCCESS',
        data: {
          message: `Solicitação ${solicitation.code || solicitation.id} criada com sucesso`,
          solicitationId: solicitation.id,
        },
      })

      if (solicitation.clientId) {
        const client = await this.prisma.client.findUnique({
          where: { id: solicitation.clientId },
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        })

        if (client) {
          for (const clientUser of client.users) {
            await this.notificationsService.create({
              userId: clientUser.userId,
              type: 'INFO',
              data: {
                message: `Nova solicitação ${solicitation.code || solicitation.id} para o cliente ${client.name}`,
                solicitationId: solicitation.id,
                clientId: solicitation.clientId,
              },
            })
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error in onSolicitationCreated: ${error.message}`)
    }
  }

  private async onSolicitationUpdated(before: any, after: any) {
    try {
      this.logger.log(`Solicitation updated: ${after.id}`)

      if (before.status !== after.status) {
        await this.notificationsService.create({
          userId: after.userId,
          type: 'INFO',
          data: {
            message: `Status da solicitação ${after.code || after.id} alterado de ${before.status} para ${after.status}`,
            solicitationId: after.id,
            oldStatus: before.status,
            newStatus: after.status,
          },
        })
      }

      if (before.responsibleId !== after.responsibleId && after.responsibleId) {
        await this.notificationsService.create({
          userId: after.responsibleId,
          type: 'INFO',
          data: {
            message: `Você foi designado como responsável pela solicitação ${after.code || after.id}`,
            solicitationId: after.id,
          },
        })
      }
    } catch (error) {
      this.logger.error(`Error in onSolicitationUpdated: ${error.message}`)
    }
  }
}

