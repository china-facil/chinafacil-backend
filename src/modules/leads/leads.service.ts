import { Injectable, NotFoundException } from '@nestjs/common'
import { LeadStatus } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { CreateLeadDto, FilterLeadDto, UpdateLeadDto } from './dto'

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    const existing = await this.prisma.lead.findFirst({
      where: { email: createLeadDto.email },
    })

    if (existing) {
      return existing
    }

    const lead = await this.prisma.lead.create({
      data: {
        ...createLeadDto,
        status: createLeadDto.status || LeadStatus.NEW,
      },
    })

    return lead
  }

  async findAll(filterLeadDto: FilterLeadDto) {
    const { search, status, origin, page = 1, limit = 10 } = filterLeadDto

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { company: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (origin) {
      where.origin = origin
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.lead.count({ where }),
    ])

    return {
      data: leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    return lead
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const lead = await this.findOne(id)

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
    })

    return updatedLead
  }

  async remove(id: string) {
    const lead = await this.findOne(id)

    await this.prisma.lead.delete({
      where: { id },
    })

    return {
      message: 'Lead removido com sucesso',
    }
  }

  async convertToUser(id: string) {
    const lead = await this.findOne(id)

    await this.prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.CONVERTED,
      },
    })

    return {
      message: 'Lead marcado como convertido',
      lead,
    }
  }

  async getStatsByOrigin() {
    const stats = await this.prisma.lead.groupBy({
      by: ['origin'],
      _count: {
        id: true,
      },
    })

    return stats.map((item) => ({
      origin: item.origin,
      count: item._count.id,
    }))
  }

  async getStatsByStatus() {
    const stats = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    return stats.map((item) => ({
      status: item.status,
      count: item._count.id,
    }))
  }
}


