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

  async findClients() {
    const clients = await this.prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return clients
  }

  async findActiveClients() {
    const clients = await this.prisma.client.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        supplierSearch: true,
        viabilityStudy: true,
      },
    })

    return {
      status: 'success',
      data: clients.map(client => ({
        id: client.id,
        name: client.name,
        supplier_search: client.supplierSearch,
        viability_study: client.viabilityStudy,
      })),
    }
  }

  async findOne(id: string) {
    const planId = BigInt(id)
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
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

    await this.prisma.plan.update({
      where: { id: planId },
      data: { deletedAt: new Date() },
    })

    return {
      message: 'Plano desativado com sucesso',
    }
  }
}
