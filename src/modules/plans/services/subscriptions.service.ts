import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { SubscriptionStatus, UserRole } from '@prisma/client'
import { PrismaService } from '../../../database/prisma.service'
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId: createSubscriptionDto.userId },
    })

    if (existingSubscription) {
      throw new BadRequestException('Usuário já possui uma assinatura')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: createSubscriptionDto.userId },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const planId = createSubscriptionDto.planId
    const client = await this.prisma.client.findUnique({
      where: { id: planId },
    })

    if (!client) {
      throw new NotFoundException('Plano não encontrado')
    }

    const subscription = await this.prisma.$transaction(async (tx) => {
      const createdSubscription = await tx.subscription.create({
        data: {
          userId: createSubscriptionDto.userId,
          planId: planId,
          price: createSubscriptionDto.price || Number(client.price || 0),
          status: createSubscriptionDto.status || SubscriptionStatus.active,
          currentPeriodStart: createSubscriptionDto.currentPeriodStart
            ? new Date(createSubscriptionDto.currentPeriodStart)
            : new Date(),
          currentPeriodEnd: createSubscriptionDto.currentPeriodEnd
            ? new Date(createSubscriptionDto.currentPeriodEnd)
            : new Date(),
          supplierSearch: createSubscriptionDto.supplierSearch ?? 0,
          viabilityStudy: createSubscriptionDto.viabilityStudy ?? null,
        },
      })

      if (user.role !== UserRole.client) {
        await tx.user.update({
          where: { id: createSubscriptionDto.userId },
          data: {
            role: UserRole.client,
          },
        })
      }

      return createdSubscription
    })

    const subscriptionWithRelations = await this.prisma.subscription.findUnique({
      where: { id: subscription.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: true,
      },
    })

    return subscriptionWithRelations
  }

  async findAll(params?: {
    itemsPerPage?: number
    page?: number
    search?: string
    dateStart?: string
    dateEnd?: string
    order?: 'asc' | 'desc'
    orderKey?: string
  }) {
    const {
      itemsPerPage = 10,
      page = 1,
      search,
      dateStart,
      dateEnd,
      order = 'desc',
      orderKey = 'createdAt',
    } = params || {}

    const skip = (page - 1) * itemsPerPage
    const take = itemsPerPage

    const where: any = {}

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ]
    }

    if (dateStart && dateEnd) {
      where.createdAt = {
        gte: new Date(`${dateStart} 00:00:00`),
        lte: new Date(`${dateEnd} 23:59:59`),
      }
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take,
        orderBy: {
          [orderKey]: order,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          client: true,
        },
      }),
      this.prisma.subscription.count({ where }),
    ])

    return {
      status: 'success',
      data: {
        data: subscriptions.map(sub => ({
          ...sub,
          created_at: sub.createdAt,
          updated_at: sub.updatedAt,
          current_period_start: sub.currentPeriodStart,
          current_period_end: sub.currentPeriodEnd,
          plan_id: sub.planId,
          user_id: sub.userId,
        })),
        total,
        last_page: Math.ceil(total / itemsPerPage),
        current_page: page,
        per_page: itemsPerPage,
      },
    }
  }

  async findOne(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        client: true,
      },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    return subscription
  }

  async findByUser(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        client: true,
      },
    })

    return subscription
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updateData: any = {}

    if (updateSubscriptionDto.planId) {
      const client = await this.prisma.client.findUnique({
        where: { id: updateSubscriptionDto.planId },
      })

      if (!client) {
        throw new NotFoundException('Plano não encontrado')
      }

      updateData.planId = updateSubscriptionDto.planId
    }

    if (updateSubscriptionDto.status) {
      updateData.status = updateSubscriptionDto.status
    }

    if (updateSubscriptionDto.currentPeriodStart) {
      updateData.currentPeriodStart = new Date(updateSubscriptionDto.currentPeriodStart)
    }

    if (updateSubscriptionDto.currentPeriodEnd) {
      updateData.currentPeriodEnd = new Date(updateSubscriptionDto.currentPeriodEnd)
    }

    if (updateSubscriptionDto.price !== undefined) {
      updateData.price = updateSubscriptionDto.price
    }

    if (updateSubscriptionDto.supplierSearch !== undefined) {
      updateData.supplierSearch = Number(updateSubscriptionDto.supplierSearch)
    }

    if (updateSubscriptionDto.viabilityStudy !== undefined) {
      updateData.viabilityStudy = Number(updateSubscriptionDto.viabilityStudy)
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: true,
      },
    })

    return updatedSubscription
  }

  async remove(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.subscription.delete({
        where: { id },
      })

      if (subscription.user && subscription.user.role === UserRole.client) {
        await tx.user.update({
          where: { id: subscription.userId },
          data: {
            role: UserRole.user,
          },
        })
      }
    })

    return {
      message: 'Assinatura removida com sucesso',
    }
  }

  async cancel(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updatedSubscription = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.inactive,
        },
      })

      if (subscription.user && subscription.user.role === UserRole.client) {
        await tx.user.update({
          where: { id: subscription.userId },
          data: {
            role: UserRole.user,
          },
        })
      }

      return updated
    })

    const subscriptionWithRelations = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: true,
      },
    })

    return subscriptionWithRelations
  }

  async activate(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updatedSubscription = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.active,
          currentPeriodStart: subscription.currentPeriodStart || new Date(),
        },
      })

      if (subscription.user && subscription.user.role !== UserRole.client) {
        await tx.user.update({
          where: { id: subscription.userId },
          data: {
            role: UserRole.client,
          },
        })
      }

      return updated
    })

    const subscriptionWithRelations = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: true,
      },
    })

    return subscriptionWithRelations
  }
}


