import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { CreateSolicitationItemDto } from '../dto'

@Injectable()
export class SolicitationItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async addItem(solicitationId: string, createItemDto: CreateSolicitationItemDto) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id: solicitationId },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    const item = await this.prisma.solicitationItem.create({
      data: {
        solicitationId,
        ...createItemDto,
      },
    })

    await this.prisma.solicitation.update({
      where: { id: solicitationId },
      data: {
        quantity: {
          increment: createItemDto.quantity,
        },
      },
    })

    return item
  }

  async removeItem(solicitationId: string, itemId: string) {
    const item = await this.prisma.solicitationItem.findUnique({
      where: { id: itemId },
    })

    if (!item || item.solicitationId !== solicitationId) {
      throw new NotFoundException('Item não encontrado')
    }

    await this.prisma.solicitationItem.delete({
      where: { id: itemId },
    })

    await this.prisma.solicitation.update({
      where: { id: solicitationId },
      data: {
        quantity: {
          decrement: item.quantity,
        },
      },
    })

    return {
      message: 'Item removido com sucesso',
    }
  }
}


