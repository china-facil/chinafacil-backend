import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreateCalculatorUserDto } from '../dto'
import * as crypto from 'crypto'

@Injectable()
export class CalculatorUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCalculatorUserDto: CreateCalculatorUserDto) {
    const existing = await this.prisma.calculatorUser.findFirst({
      where: { email: createCalculatorUserDto.email },
    })

    if (existing) {
      return existing
    }

    const calculatorUser = await this.prisma.calculatorUser.create({
      data: {
        id: crypto.randomUUID(),
        email: createCalculatorUserDto.email,
        telefone: createCalculatorUserDto.telefone || '',
      },
    })

    return calculatorUser
  }

  async findAll() {
    const users = await this.prisma.calculatorUser.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return users
  }
}


