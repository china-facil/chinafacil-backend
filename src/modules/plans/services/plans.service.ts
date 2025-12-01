import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreatePlanDto, UpdatePlanDto } from '../dto'

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    const plan = await this.prisma.plan.create({
      data: {
        name: createPlanDto.name,
        description: createPlanDto.description || '',
        price: createPlanDto.price,
        subtitle: createPlanDto.subtitle,
        image: createPlanDto.image,
      },
    })

    return plan
  }

  async findAll() {
    const plans = await this.prisma.plan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subscriptions: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    })

    return plans
  }

  async findActive() {
    const plans = await this.prisma.plan.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        price: 'asc',
      },
    })

    return plans
  }

  async findOne(id: string) {
    const planId = BigInt(id)
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    })

    if (!plan) {
      throw new NotFoundException('Plano não encontrado')
    }

    return plan
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    const planId = BigInt(id)
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new NotFoundException('Plano não encontrado')
    }

    const updatedPlan = await this.prisma.plan.update({
      where: { id: planId },
      data: updatePlanDto,
    })

    return updatedPlan
  }

  async remove(id: string) {
    const planId = BigInt(id)
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new NotFoundException('Plano não encontrado')
    }

    const subscriptionsCount = await this.prisma.subscription.count({
      where: { planId: planId },
    })

    if (subscriptionsCount > 0) {
      await this.prisma.plan.update({
        where: { id: planId },
        data: { deletedAt: new Date() },
      })

      return {
        message: 'Plano desativado (existem assinaturas ativas)',
      }
    }

    await this.prisma.plan.delete({
      where: { id: planId },
    })

    return {
      message: 'Plano removido com sucesso',
    }
  }
}


