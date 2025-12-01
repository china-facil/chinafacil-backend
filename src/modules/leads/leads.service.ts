import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { CreateLeadDto, FilterLeadDto, UpdateLeadDto } from './dto'
import * as crypto from 'crypto'

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    const existing = await this.prisma.user.findFirst({
      where: { 
        email: createLeadDto.email,
      },
    })

    if (existing) {
      return existing
    }

    const lead = await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: createLeadDto.name,
        email: createLeadDto.email,
        phone: createLeadDto.phone,
        password: crypto.randomBytes(32).toString('hex'),
        role: UserRole.lead,
        companyData: createLeadDto.company ? { company: createLeadDto.company } : undefined,
      },
    })

    return lead
  }

  async findAll(filterLeadDto: FilterLeadDto) {
    const { search, page = 1, limit = 10 } = filterLeadDto

    const where: any = {
      role: UserRole.lead,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [leads, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyData: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
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
    const lead = await this.prisma.user.findFirst({
      where: { 
        id,
        role: UserRole.lead,
      },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    return lead
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const lead = await this.findOne(id)

    const updateData: any = {}
    if (updateLeadDto.name) updateData.name = updateLeadDto.name
    if (updateLeadDto.email) updateData.email = updateLeadDto.email
    if (updateLeadDto.phone !== undefined) updateData.phone = updateLeadDto.phone
    if (updateLeadDto.company !== undefined) {
      updateData.companyData = updateLeadDto.company ? { company: updateLeadDto.company } : null
    }

    const updatedLead = await this.prisma.user.update({
      where: { id },
      data: updateData,
    })

    return updatedLead
  }

  async remove(id: string) {
    const lead = await this.findOne(id)

    await this.prisma.user.delete({
      where: { id },
    })

    return {
      message: 'Lead removido com sucesso',
    }
  }

  async convertToUser(id: string) {
    const lead = await this.findOne(id)

    return {
      message: 'Lead já é um usuário',
      lead,
    }
  }

  async getStatsByOrigin() {
    return []
  }

  async getStatsByStatus() {
    return []
  }
}


