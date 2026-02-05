import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import {
  CreateSellerDto,
  FilterSellerDto,
  UpdateSellerDto,
} from './dto'

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSellerDto: CreateSellerDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createSellerDto.userId },
    })

    if (!user) {
      throw new BadRequestException('Usuário não encontrado')
    }

    const existingSellerByUser = await this.prisma.seller.findUnique({
      where: { userId: createSellerDto.userId },
    })

    if (existingSellerByUser) {
      throw new BadRequestException('Este usuário já possui um registro de vendedor')
    }

    const existingSellerByEmail = await this.prisma.seller.findUnique({
      where: { email: createSellerDto.email },
    })

    if (existingSellerByEmail) {
      throw new BadRequestException('Email já cadastrado')
    }

    const seller = await this.prisma.seller.create({
      data: createSellerDto,
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

    return seller
  }

  async findAll(filterDto: FilterSellerDto) {
    const { search, status, userId, page = 1, limit = 10 } = filterDto

    const skip = (page - 1) * limit
    const take = limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    const [sellers, total] = await Promise.all([
      this.prisma.seller.findMany({
        where,
        skip,
        take,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
      }),
      this.prisma.seller.count({ where }),
    ])

    const sellersWithClientCount = sellers.map((seller) => ({
      ...seller,
      clientCount: seller._count.users,
      _count: undefined,
    }))

    return {
      data: sellersWithClientCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!seller) {
      throw new NotFoundException('Vendedor não encontrado')
    }

    return {
      ...seller,
      clientCount: seller._count.users,
      _count: undefined,
    }
  }

  async update(id: string, updateSellerDto: UpdateSellerDto) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
    })

    if (!seller) {
      throw new NotFoundException('Vendedor não encontrado')
    }

    if (updateSellerDto.email && updateSellerDto.email !== seller.email) {
      const existingSeller = await this.prisma.seller.findUnique({
        where: { email: updateSellerDto.email },
      })

      if (existingSeller) {
        throw new BadRequestException('Email já cadastrado')
      }
    }

    const updatedSeller = await this.prisma.seller.update({
      where: { id },
      data: updateSellerDto,
    })

    return updatedSeller
  }

  async remove(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
    })

    if (!seller) {
      throw new NotFoundException('Vendedor não encontrado')
    }

    const usersCount = await this.prisma.user.count({
      where: { sellerId: id },
    })

    if (usersCount > 0) {
      throw new BadRequestException(
        'Não é possível remover vendedor com clientes vinculados',
      )
    }

    await this.prisma.seller.delete({
      where: { id },
    })

    return {
      message: 'Vendedor removido com sucesso',
    }
  }
}

