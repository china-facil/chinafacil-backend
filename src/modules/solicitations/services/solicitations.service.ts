import { Injectable, NotFoundException } from '@nestjs/common'
import { SolicitationStatus } from '@prisma/client'
import { PrismaService } from '../../../database/prisma.service'
import {
  AssignResponsibilityDto,
  CreateSolicitationDto,
  FilterSolicitationDto,
  UpdateSolicitationDto,
} from '../dto'

@Injectable()
export class SolicitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSolicitationDto: CreateSolicitationDto) {
    const code = await this.generateCode()

    const solicitation = await this.prisma.solicitation.create({
      data: {
        ...createSolicitationDto,
        code,
        status: createSolicitationDto.status || SolicitationStatus.OPEN,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return solicitation
  }

  async findAll(filterDto: FilterSolicitationDto) {
    const { search, status, userId, clientId, page = 1, limit = 10 } = filterDto

    const skip = (page - 1) * limit
    const take = limit

    const where: any = {}

    if (search) {
      where.code = { contains: search }
    }

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    if (clientId) {
      where.clientId = clientId
    }

    const [solicitations, total] = await Promise.all([
      this.prisma.solicitation.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              status: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.solicitation.count({ where }),
    ])

    return {
      data: solicitations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    const solicitation = await this.prisma.solicitation.findUnique({
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
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            attachments: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        trackingItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        cart: true,
      },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    return solicitation
  }

  async update(id: string, updateSolicitationDto: UpdateSolicitationDto) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    const updatedSolicitation = await this.prisma.solicitation.update({
      where: { id },
      data: updateSolicitationDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return updatedSolicitation
  }

  async remove(id: string) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    await this.prisma.solicitation.delete({
      where: { id },
    })

    return {
      message: 'Solicitação removida com sucesso',
    }
  }

  async getStatistics() {
    const [
      totalSolicitations,
      openSolicitations,
      totalItems,
      uniqueUsers,
      totalValue,
    ] = await Promise.all([
      this.prisma.solicitation.count(),
      this.prisma.solicitation.count({
        where: { status: SolicitationStatus.OPEN },
      }),
      this.prisma.solicitationItem.count(),
      this.prisma.solicitation.groupBy({
        by: ['userId'],
      }),
      this.prisma.solicitationItem.aggregate({
        _sum: {
          price: true,
        },
      }),
    ])

    return {
      totalSolicitations,
      openSolicitations,
      totalItems,
      uniqueUsers: uniqueUsers.length,
      totalValue: totalValue._sum.price || 0,
    }
  }

  async getKanban() {
    const solicitations = await this.prisma.solicitation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
          },
        },
      },
    })

    type SolicitationWithRelations = typeof solicitations[0]
    const kanban: Record<SolicitationStatus, SolicitationWithRelations[]> = {
      [SolicitationStatus.OPEN]: [],
      [SolicitationStatus.IN_PROGRESS]: [],
      [SolicitationStatus.COMPLETED]: [],
      [SolicitationStatus.CANCELLED]: [],
    }

    solicitations.forEach((solicitation) => {
      if (kanban[solicitation.status]) {
        kanban[solicitation.status].push(solicitation)
      }
    })

    return kanban
  }

  async assignResponsibility(
    id: string,
    assignDto: AssignResponsibilityDto,
  ) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    const updatedSolicitation = await this.prisma.solicitation.update({
      where: { id },
      data: {
        responsibleType: assignDto.responsibleType,
        responsibleId: assignDto.responsibleId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return updatedSolicitation
  }

  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    
    const count = await this.prisma.solicitation.count({
      where: {
        createdAt: {
          gte: new Date(year, new Date().getMonth(), 1),
          lt: new Date(year, new Date().getMonth() + 1, 1),
        },
      },
    })

    const sequence = String(count + 1).padStart(4, '0')
    return `SOL-${year}${month}-${sequence}`
  }
}


