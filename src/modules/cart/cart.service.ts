import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateCartDto, UpdateCartDto } from './dto'

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createCartDto: CreateCartDto) {
    const existingCart = await this.prisma.cart.findFirst({
      where: { userId },
    })

    if (existingCart) {
      return this.update(existingCart.id, createCartDto)
    }

    const cart = await this.prisma.cart.create({
      data: {
        userId,
        ...createCartDto,
      },
    })

    return cart
  }

  async findByUser(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return cart
  }

  async findAll() {
    const carts = await this.prisma.cart.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        solicitation: {
          select: {
            id: true,
            code: true,
            status: true,
          },
        },
      },
    })

    return carts
  }

  async update(id: string, updateCartDto: UpdateCartDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
    })

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado')
    }

    const updatedCart = await this.prisma.cart.update({
      where: { id },
      data: updateCartDto,
    })

    return updatedCart
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    })

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado')
    }

    await this.prisma.cart.delete({
      where: { id: cart.id },
    })

    return {
      message: 'Carrinho limpo com sucesso',
    }
  }

  async sync(userId: string, createCartDto: CreateCartDto) {
    return this.create(userId, createCartDto)
  }
}


