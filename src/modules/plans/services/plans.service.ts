import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreatePlanDto, UpdatePlanDto } from '../dto'

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    const plan = await this.prisma.plan.create({
      data: createPlanDto,
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
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    })

    return plans
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
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
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    })

    if (!plan) {
      throw new NotFoundException('Plano não encontrado')
    }

    const updatedPlan = await this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    })

    return updatedPlan
  }

  async remove(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    })

    if (!plan) {
      throw new NotFoundException('Plano não encontrado')
    }

    const subscriptionsCount = await this.prisma.subscription.count({
      where: { planId: id },
    })

    if (subscriptionsCount > 0) {
      await this.prisma.plan.update({
        where: { id },
        data: { isActive: false },
      })

      return {
        message: 'Plano desativado (existem assinaturas ativas)',
      }
    }

    await this.prisma.plan.delete({
      where: { id },
    })

    return {
      message: 'Plano removido com sucesso',
    }
  }
}

