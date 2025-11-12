import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import {
  CreateClientDto,
  FilterClientDto,
  UpdateClientDto,
} from './dto'

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: createClientDto,
    })

    return client
  }

  async findAll(filterDto: FilterClientDto) {
    const { search, status, page, limit } = filterDto

    const skip = (page - 1) * limit
    const take = limit

    const where: any = {
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { cfCode: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          solicitations: {
            select: {
              id: true,
              code: true,
              status: true,
            },
            take: 5,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ])

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        solicitations: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!client) {
      throw new NotFoundException('Cliente não encontrado')
    }

    return client
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundException('Cliente não encontrado')
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    })

    return updatedClient
  }

  async remove(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundException('Cliente não encontrado')
    }

    await this.prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    return {
      message: 'Cliente removido com sucesso',
    }
  }

  async findActivePlans() {
    const clients = await this.prisma.client.findMany({
      where: {
        deletedAt: null,
        planStatus: 'active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        cfCode: true,
        planStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return clients
  }

  async attachUser(clientId: string, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundException('Cliente não encontrado')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const existing = await this.prisma.clientUser.findUnique({
      where: {
        userId_clientId: {
          userId,
          clientId,
        },
      },
    })

    if (existing) {
      throw new BadRequestException('Usuário já vinculado a este cliente')
    }

    await this.prisma.clientUser.create({
      data: {
        userId,
        clientId,
      },
    })

    return {
      message: 'Usuário vinculado ao cliente com sucesso',
    }
  }

  async detachUser(clientId: string, userId: string) {
    const existing = await this.prisma.clientUser.findUnique({
      where: {
        userId_clientId: {
          userId,
          clientId,
        },
      },
    })

    if (!existing) {
      throw new NotFoundException('Vínculo não encontrado')
    }

    await this.prisma.clientUser.delete({
      where: {
        userId_clientId: {
          userId,
          clientId,
        },
      },
    })

    return {
      message: 'Usuário desvinculado do cliente com sucesso',
    }
  }
}

