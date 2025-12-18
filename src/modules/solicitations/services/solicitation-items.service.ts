import { Injectable, NotFoundException } from '@nestjs/common'
import { SolicitationItemActionOf, SolicitationItemStatus } from '@prisma/client'
import { PrismaService } from '../../../database/prisma.service'
import { CreateSolicitationItemDto } from '../dto'

@Injectable()
export class SolicitationItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async addItem(
    solicitationId: string,
    userId: string,
    createItemDto: CreateSolicitationItemDto,
  ) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id: solicitationId },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 3)

    const item = await this.prisma.solicitationItem.create({
      data: {
        solicitationId,
        userId,
        actionOf: createItemDto.actionOf as SolicitationItemActionOf,
        clientActionRequired: createItemDto.clientActionRequired ?? false,
        message: createItemDto.message,
        status: (createItemDto.status as SolicitationItemStatus) || SolicitationItemStatus.open,
        deadline,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: true,
      },
    })

    return item
  }

  async removeItem(solicitationId: string, itemId: string, userId: string, userRole: string) {
    const item = await this.prisma.solicitationItem.findFirst({
      where: {
        id: itemId,
        solicitationId,
      },
    })

    if (!item) {
      throw new NotFoundException('Item não encontrado')
    }

    if (item.userId !== userId && userRole !== 'admin') {
      throw new NotFoundException('Você não tem permissão para excluir esse item')
    }

    await this.prisma.solicitation.update({
      where: { id: solicitationId },
      data: {
        status: 'pending',
      },
    })

    await this.prisma.solicitationItem.delete({
      where: { id: itemId },
    })

    return {
      message: 'Item removido com sucesso',
    }
  }
}
