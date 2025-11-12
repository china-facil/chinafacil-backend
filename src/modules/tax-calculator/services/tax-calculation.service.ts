import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreateTaxCalculationDto } from '../dto'

@Injectable()
export class TaxCalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaxCalculationDto: CreateTaxCalculationDto) {
    const calculation = await this.prisma.taxCalculation.create({
      data: createTaxCalculationDto,
    })

    return calculation
  }

  async findAll() {
    const calculations = await this.prisma.taxCalculation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })

    return calculations
  }

  async findByUser(userId: string) {
    const calculations = await this.prisma.taxCalculation.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return calculations
  }
}

