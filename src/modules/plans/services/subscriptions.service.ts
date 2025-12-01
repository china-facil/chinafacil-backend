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

    const planId = BigInt(createSubscriptionDto.planId)
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new NotFoundException('Plano não encontrado')
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        userId: createSubscriptionDto.userId,
        planId: planId,
        price: createSubscriptionDto.price || plan.price,
        status: createSubscriptionDto.status || SubscriptionStatus.active,
        currentPeriodStart: createSubscriptionDto.currentPeriodStart
          ? new Date(createSubscriptionDto.currentPeriodStart)
          : new Date(),
        currentPeriodEnd: createSubscriptionDto.currentPeriodEnd
          ? new Date(createSubscriptionDto.currentPeriodEnd)
          : new Date(),
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

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updateData: any = {}

    if (updateSubscriptionDto.planId) {
      const planId = BigInt(updateSubscriptionDto.planId)
      const plan = await this.prisma.plan.findUnique({
        where: { id: planId },
      })

      if (!plan) {
        throw new NotFoundException('Plano não encontrado')
      }

      updateData.planId = planId
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

  async remove(id: number) {
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

  async cancel(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.inactive,
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

  async activate(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada')
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.active,
        currentPeriodStart: subscription.currentPeriodStart || new Date(),
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


