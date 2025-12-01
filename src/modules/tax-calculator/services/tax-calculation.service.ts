import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreateTaxCalculationDto, FilterTaxCalculationDto } from '../dto'

@Injectable()
export class TaxCalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaxCalculationDto: CreateTaxCalculationDto) {
    const dto = createTaxCalculationDto as any

    if (!dto.productName) {
      throw new BadRequestException('productName é obrigatório')
    }
    if (dto.volumeUn === undefined || dto.volumeUn === null) {
      throw new BadRequestException('volumeUn é obrigatório')
    }
    if (dto.weightUn === undefined || dto.weightUn === null) {
      throw new BadRequestException('weightUn é obrigatório')
    }
    if (dto.quantity === undefined || dto.quantity === null) {
      throw new BadRequestException('quantity é obrigatório')
    }
    if (dto.unitPriceBrl === undefined || dto.unitPriceBrl === null) {
      throw new BadRequestException('unitPriceBrl é obrigatório')
    }
    if (!dto.currency) {
      throw new BadRequestException('currency é obrigatório')
    }
    if (!dto.volumeType) {
      throw new BadRequestException('volumeType é obrigatório')
    }
    if (!dto.weightType) {
      throw new BadRequestException('weightType é obrigatório')
    }
    if (dto.totalVolume === undefined || dto.totalVolume === null) {
      throw new BadRequestException('totalVolume é obrigatório')
    }
    if (dto.totalWeight === undefined || dto.totalWeight === null) {
      throw new BadRequestException('totalWeight é obrigatório')
    }
    if (dto.supplierPrice === undefined || dto.supplierPrice === null) {
      throw new BadRequestException('supplierPrice é obrigatório')
    }
    if (dto.totalCost === undefined || dto.totalCost === null) {
      throw new BadRequestException('totalCost é obrigatório')
    }

    if (
      isNaN(Number(createTaxCalculationDto.volumeUn)) ||
      Number(createTaxCalculationDto.volumeUn) < 0
    ) {
      throw new BadRequestException('volumeUn deve ser um número válido >= 0')
    }

    if (
      isNaN(Number(createTaxCalculationDto.weightUn)) ||
      Number(createTaxCalculationDto.weightUn) < 0
    ) {
      throw new BadRequestException('weightUn deve ser um número válido >= 0')
    }

    if (
      isNaN(Number(createTaxCalculationDto.quantity)) ||
      Number(createTaxCalculationDto.quantity) < 1
    ) {
      throw new BadRequestException('quantity deve ser um número inteiro >= 1')
    }

    if (
      isNaN(Number(createTaxCalculationDto.unitPriceBrl)) ||
      Number(createTaxCalculationDto.unitPriceBrl) < 0
    ) {
      throw new BadRequestException(
        'unitPriceBrl deve ser um número válido >= 0',
      )
    }

    if (!['BRL', 'USD'].includes(createTaxCalculationDto.currency)) {
      throw new BadRequestException('currency deve ser BRL ou USD')
    }

    if (!['unitario', 'total'].includes(createTaxCalculationDto.volumeType)) {
      throw new BadRequestException('volumeType deve ser unitario ou total')
    }

    if (!['unitario', 'total'].includes(createTaxCalculationDto.weightType)) {
      throw new BadRequestException('weightType deve ser unitario ou total')
    }

    const data: any = {
      productName: createTaxCalculationDto.productName,
      volumeUn: Number(createTaxCalculationDto.volumeUn),
      weightUn: Number(createTaxCalculationDto.weightUn),
      quantity: Number(createTaxCalculationDto.quantity),
      unitPriceBrl: Number(createTaxCalculationDto.unitPriceBrl),
      currency: createTaxCalculationDto.currency,
      volumeType: createTaxCalculationDto.volumeType,
      weightType: createTaxCalculationDto.weightType,
      totalVolume: Number(createTaxCalculationDto.totalVolume),
      totalWeight: Number(createTaxCalculationDto.totalWeight),
      supplierPrice: Number(createTaxCalculationDto.supplierPrice),
      totalCost: Number(createTaxCalculationDto.totalCost),
    }

    if (createTaxCalculationDto.userId) {
      data.userId = createTaxCalculationDto.userId
    }
    if (createTaxCalculationDto.userEmail) {
      data.userEmail = createTaxCalculationDto.userEmail
    }
    if (createTaxCalculationDto.tempUserId) {
      data.tempUserId = createTaxCalculationDto.tempUserId
    }
    if (createTaxCalculationDto.productImageUrl) {
      data.productImageUrl = createTaxCalculationDto.productImageUrl
    }
    if (createTaxCalculationDto.ncmCode) {
      data.ncmCode = createTaxCalculationDto.ncmCode
    }
    if (createTaxCalculationDto.unitPriceOriginal !== undefined) {
      data.unitPriceOriginal = Number(createTaxCalculationDto.unitPriceOriginal)
    }
    if (createTaxCalculationDto.yuanRate !== undefined) {
      data.yuanRate = Number(createTaxCalculationDto.yuanRate)
    }
    if (createTaxCalculationDto.dolarRate !== undefined) {
      data.dolarRate = Number(createTaxCalculationDto.dolarRate)
    }
    if (createTaxCalculationDto.distanceKm !== undefined) {
      data.distanceKm = Number(createTaxCalculationDto.distanceKm)
    }
    if (createTaxCalculationDto.calculationBreakdown) {
      data.calculationBreakdown = createTaxCalculationDto.calculationBreakdown
    }

    const calculation = await this.prisma.taxCalculation.create({
      data,
    })

    return {
      ...calculation,
      id: calculation.id.toString(),
    }
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
        const calcData = {
          ...calc,
          id: calc.id.toString(),
        }
        if (!calc.userId) {
          return { ...calcData, user: null }
        }
        const user = await this.prisma.user.findUnique({
          where: { id: calc.userId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
        return { ...calcData, user }
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

    return calculations.map((calc) => ({
      ...calc,
      id: calc.id.toString(),
    }))
  }
}


