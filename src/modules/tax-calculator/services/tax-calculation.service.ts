import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreateTaxCalculationDto, FilterTaxCalculationDto } from '../dto'

@Injectable()
export class TaxCalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaxCalculationDto: CreateTaxCalculationDto) {
    const calculation = await this.prisma.taxCalculation.create({
      data: createTaxCalculationDto,
    })

    return calculation
  }

  async findAll(filterDto?: FilterTaxCalculationDto) {
    const {
      userId,
      ncmCode,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filterDto || {}

    const skip = (page - 1) * limit
    const take = limit

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (ncmCode) {
      where.ncmCode = ncmCode
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [calculations, total] = await Promise.all([
      this.prisma.taxCalculation.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.taxCalculation.count({ where }),
    ])

    const calculationsWithUsers = await Promise.all(
      calculations.map(async (calc) => {
        if (!calc.userId) {
          return { ...calc, user: null }
        }
        const user = await this.prisma.user.findUnique({
          where: { id: calc.userId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
        return { ...calc, user }
      }),
    )

    return {
      data: calculationsWithUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
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


