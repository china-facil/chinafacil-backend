import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { SubscriptionStatus } from '@prisma/client'
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

    const plan = await this.prisma.plan.findUnique({
      where: { id: createSubscriptionDto.planId },
    })

    if (!plan) {
      throw new NotFoundException('Plano não encontrado')
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        userId: createSubscriptionDto.userId,
        planId: createSubscriptionDto.planId,
        status: createSubscriptionDto.status || SubscriptionStatus.PENDING,
        startedAt: createSubscriptionDto.startedAt
          ? new Date(createSubscriptionDto.startedAt)
          : null,
        expiresAt: createSubscriptionDto.expiresAt
          ? new Date(createSubscriptionDto.expiresAt)
          : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: true,
      },
    })

    return subscription
  }

  async findAll() {
    const subscriptions = await this.prisma.subscription.findMany({
      orderBy: {
        createdAt: 'desc',
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
        plan: true,
      },
    })

    return subscriptions
  }

  async findOne(id: string) {
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
        plan: true,
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
        plan: true,
      },
    })

    return subscription
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updateData: any = {}

    if (updateSubscriptionDto.planId) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: updateSubscriptionDto.planId },
      })

      if (!plan) {
        throw new NotFoundException('Plano não encontrado')
      }

      updateData.planId = updateSubscriptionDto.planId
    }

    if (updateSubscriptionDto.status) {
      updateData.status = updateSubscriptionDto.status
    }

    if (updateSubscriptionDto.startedAt) {
      updateData.startedAt = new Date(updateSubscriptionDto.startedAt)
    }

    if (updateSubscriptionDto.expiresAt) {
      updateData.expiresAt = new Date(updateSubscriptionDto.expiresAt)
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
        plan: true,
      },
    })

    return updatedSubscription
  }

  async remove(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    await this.prisma.subscription.delete({
      where: { id },
    })

    return {
      message: 'Assinatura removida com sucesso',
    }
  }

  async cancel(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: true,
      },
    })

    return updatedSubscription
  }

  async activate(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startedAt: subscription.startedAt || new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: true,
      },
    })

    return updatedSubscription
  }
}


