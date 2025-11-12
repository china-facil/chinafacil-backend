import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreateFreightDto, UpdateFreightDto } from '../dto'

@Injectable()
export class FreightsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFreightDto: CreateFreightDto) {
    const freight = await this.prisma.freight.create({
      data: createFreightDto,
    })

    return freight
  }

  async findAll() {
    const freights = await this.prisma.freight.findMany({
      orderBy: {
        origin: 'asc',
      },
    })

    return freights
  }

  async findOne(id: string) {
    const freight = await this.prisma.freight.findUnique({
      where: { id },
    })

    if (!freight) {
      throw new NotFoundException('Frete não encontrado')
    }

    return freight
  }

  async update(id: string, updateFreightDto: UpdateFreightDto) {
    const freight = await this.prisma.freight.findUnique({
      where: { id },
    })

    if (!freight) {
      throw new NotFoundException('Frete não encontrado')
    }

    const updatedFreight = await this.prisma.freight.update({
      where: { id },
      data: updateFreightDto,
    })

    return updatedFreight
  }

  async remove(id: string) {
    const freight = await this.prisma.freight.findUnique({
      where: { id },
    })

    if (!freight) {
      throw new NotFoundException('Frete não encontrado')
    }

    await this.prisma.freight.delete({
      where: { id },
    })

    return {
      message: 'Frete removido com sucesso',
    }
  }
}

