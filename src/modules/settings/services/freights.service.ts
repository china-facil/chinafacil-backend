import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import {
  CalculateFreightDto,
  CreateFreightDto,
  UpdateFreightDto,
} from '../dto'

@Injectable()
export class FreightsService {
  private readonly logger = new Logger(FreightsService.name)

  private readonly freightTables = [
    { maxWeight: 1000, pricePerKm: 8.71225 },
    { maxWeight: 3000, pricePerKm: 9.5580625 },
    { maxWeight: 6000, pricePerKm: 10.4039375 },
    { maxWeight: 12000, pricePerKm: 11.334375 },
    { maxWeight: 25000, pricePerKm: 14.23125 },
  ]

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

  async calculateFreight(calculateDto: CalculateFreightDto) {
    const { origin, destination, weight, volume, cifValue, distance } =
      calculateDto

    const freight = await this.findNearestFreight(origin, destination)

    if (!freight && !distance) {
      throw new NotFoundException(
        'Frete não encontrado e distância não fornecida',
      )
    }

    const calculatedDistance = distance || Number(freight?.days) || 0

    if (calculatedDistance === 0) {
      return {
        total: 0,
        breakdown: {},
        message: 'Distância não disponível',
      }
    }

    const pricePerKm = this.getPricePerKm(weight)
    const freightByKm = this.round2(calculatedDistance * pricePerKm)

    const breakdown: any = {
      distance: calculatedDistance,
      weight,
      pricePerKm,
      freightByKm,
    }

    if (volume) {
      breakdown.volume = volume
      breakdown.cbm = this.calculateCBM(volume, weight)
    }

    if (cifValue && freight) {
      const gris = this.round2((cifValue * Number(freight.cost)) / 100)
      breakdown.cifValue = cifValue
      breakdown.gris = gris
    }

    const total = freightByKm + (breakdown.gris || 0)

    return {
      total: this.round2(total),
      breakdown,
    }
  }

  async findNearestFreight(origin: string, destination: string) {
    const freights = await this.prisma.freight.findMany({
      where: {
        OR: [
          { origin: { contains: origin } },
          { destination: { contains: destination } },
        ],
      },
      orderBy: {
        days: 'asc',
      },
      take: 1,
    })

    return freights[0] || null
  }

  calculateCBM(volume: number, weight: number): number {
    const cbm = volume / 1000000
    const weightInKg = weight / 1000
    return Math.max(cbm, weightInKg / 167)
  }

  private getPricePerKm(weight: number): number {
    for (const table of this.freightTables) {
      if (weight <= table.maxWeight) {
        return table.pricePerKm
      }
    }
    return 0
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100
  }
}


