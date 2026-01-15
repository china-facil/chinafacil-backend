import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreateBoardingTypeDto, UpdateBoardingTypeDto } from '../dto'

@Injectable()
export class BoardingTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBoardingTypeDto: CreateBoardingTypeDto) {
    const boardingType = await this.prisma.boardingType.create({
      data: createBoardingTypeDto,
    })

    return boardingType
  }

  async findAll() {
    const boardingTypes = await this.prisma.boardingType.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return boardingTypes
  }

  async findActive() {
    const boardingTypes = await this.prisma.boardingType.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return boardingTypes
  }

  async findOne(id: string) {
    const boardingType = await this.prisma.boardingType.findUnique({
      where: { id },
    })

    if (!boardingType) {
      throw new NotFoundException('Tipo de embarque não encontrado')
    }

    return boardingType
  }

  async findDefault() {
    const boardingType = await this.prisma.boardingType.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    return boardingType
  }

  async findByVolume(volume: number) {
    const boardingTypes = await this.prisma.boardingType.findMany({
      where: {
        cmbStart: {
          lte: volume,
        },
        cmbEnd: {
          gte: volume,
        },
      },
      orderBy: [
        {
          cmbEnd: 'asc',
        },
        {
          cmbStart: 'desc',
        },
      ],
    })

    if (boardingTypes.length === 0) {
      return this.findDefault()
    }

    return boardingTypes[0]
  }

  async update(id: string, updateBoardingTypeDto: UpdateBoardingTypeDto) {
    const boardingType = await this.prisma.boardingType.findUnique({
      where: { id },
    })

    if (!boardingType) {
      throw new NotFoundException('Tipo de embarque não encontrado')
    }

    const updatedBoardingType = await this.prisma.boardingType.update({
      where: { id },
      data: updateBoardingTypeDto,
    })

    return updatedBoardingType
  }

  async remove(id: string) {
    const boardingType = await this.prisma.boardingType.findUnique({
      where: { id },
    })

    if (!boardingType) {
      throw new NotFoundException('Tipo de embarque não encontrado')
    }

    await this.prisma.boardingType.delete({
      where: { id },
    })

    return {
      message: 'Tipo de embarque removido com sucesso',
    }
  }
}


