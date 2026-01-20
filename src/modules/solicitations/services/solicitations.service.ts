import { Injectable, NotFoundException } from '@nestjs/common'
import { SolicitationStatus } from '@prisma/client'
import { PrismaService } from '../../../database/prisma.service'
import {
  AssignResponsibilityDto,
  CreateSolicitationDto,
  FilterSolicitationDto,
  UpdateSolicitationDto,
} from '../dto'

@Injectable()
export class SolicitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSolicitationDto: CreateSolicitationDto) {
    const code = await this.generateCode()
    const { cart, pricing_data, ...solicitationData } = createSolicitationDto

    const solicitation = await this.prisma.solicitation.create({
      data: {
        ...solicitationData,
        code,
        status: createSolicitationDto.status || SolicitationStatus.open,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (cart && cart.length > 0) {
      await this.prisma.cart.create({
        data: {
          userId: createSolicitationDto.userId,
          solicitationId: solicitation.id,
          items: cart,
          pricingData: pricing_data || null,
        },
      })
    }

    if (createSolicitationDto.userId) {
      await this.prisma.solicitationTrack.create({
        data: {
          solicitationId: solicitation.id,
          userId: createSolicitationDto.userId,
        },
      })
    }

    return solicitation
  }

  async findAll(filterDto: FilterSolicitationDto) {
    const { 
      search, 
      status, 
      userId, 
      clientId, 
      page = 1, 
      limit, 
      items_per_page, 
      date_start, 
      date_end,
      order,
      'order-key': orderKey,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filterDto
    const take = items_per_page || limit || 10

    const skip = (page - 1) * take

    const where: any = {}

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { type: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (date_start && date_end) {
      where.createdAt = {
        gte: new Date(`${date_start} 00:00:00`),
        lte: new Date(`${date_end} 23:59:59`),
      }
    }

    const validUserIds = await this.prisma.user.findMany({
      select: { id: true },
    });

    const validUserIdArray = validUserIds.map((user) => user.id);

    if (userId) {
      if (validUserIdArray.includes(userId)) {
        where.userId = userId;
      } else {
        where.userId = {
          in: [],
        };
      }
    } else {
      if (validUserIdArray.length > 0) {
        where.userId = {
          in: validUserIdArray,
        };
      } else {
        where.userId = {
          in: [],
        };
      }
    }

    const fieldMapping: Record<string, string> = {
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'user_id': 'userId',
      'client_id': 'clientId',
      'responsible_type': 'responsibleType',
      'responsible_id': 'responsibleId',
    }

    const actualSortBy = fieldMapping[orderKey || ''] || orderKey || sortBy
    const actualSortOrder = (order || sortOrder) as 'asc' | 'desc'

    const getOrderBy = () => {
      const sortField = actualSortBy.toLowerCase()
      
      if (sortField === 'solicitante' || sortField === 'user_name' || sortField === 'user.name') {
        return {
          user: {
            name: actualSortOrder,
          },
        }
      }
      
      if (sortField === 'user_role' || sortField === 'user.role' || sortField === 'userrole') {
        return {
          user: {
            role: actualSortOrder,
          },
        }
      }
      
      if (sortField === 'tipo' || sortField === 'type') {
        return {
          type: actualSortOrder,
        }
      }
      
      const validFields = [
        'id', 'code', 'status', 'type', 'quantity', 
        'createdat', 'created_at', 'updatedat', 'updated_at',
        'userid', 'user_id', 'clientid', 'client_id',
        'responsibletype', 'responsible_type', 'responsibleid', 'responsible_id',
        'from'
      ]
      
      const normalizedField = sortField.replace(/_/g, '')
      if (validFields.some(field => normalizedField === field || sortField === field)) {
        const prismaField = actualSortBy.includes('_') 
          ? fieldMapping[actualSortBy] || actualSortBy
          : actualSortBy
        return {
          [prismaField]: actualSortOrder,
        }
      }
      
      return {
        createdAt: actualSortOrder,
      }
    }

    const [solicitations, total] = await Promise.all([
      this.prisma.solicitation.findMany({
        where,
        skip,
        take,
        orderBy: getOrderBy(),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          cart: true,
          items: {
            select: {
              id: true,
              actionOf: true,
              message: true,
              status: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.solicitation.count({ where }),
    ])

    const solicitationsWithTotal = solicitations.map(solicitation => {
      let cartTotal = 0
      if (solicitation.cart?.items) {
        let items: any = solicitation.cart.items
        
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items)
          } catch (e) {
            items = []
          }
        }
        
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item?.variations && Array.isArray(item.variations)) {
              for (const variation of item.variations) {
                const price = parseFloat(variation.price || 0)
                const quantity = parseFloat(variation.quantity || 0)
                cartTotal += price * quantity
              }
            }
          }
        }
      }
      return {
        ...solicitation,
        cart: solicitation.cart ? {
          ...solicitation.cart,
          total: cartTotal,
        } : null,
      }
    })

    return {
      status: 'success',
      data: solicitationsWithTotal,
      meta: {
        total,
        last_page: Math.ceil(total / take),
        current_page: page,
        per_page: take,
      },
    }
  }

  async findOne(id: string) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            attachments: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        trackingItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        cart: true,
      },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    return solicitation
  }

  async update(id: string, updateSolicitationDto: UpdateSolicitationDto) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    const updatedSolicitation = await this.prisma.solicitation.update({
      where: { id },
      data: updateSolicitationDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return updatedSolicitation
  }

  async remove(id: string) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    await this.prisma.solicitation.delete({
      where: { id },
    })

    return {
      message: 'Solicitação removida com sucesso',
    }
  }

  async getStatistics(dateStart?: string, dateEnd?: string) {
    const validUserIds = await this.prisma.user.findMany({
      select: { id: true },
    })

    const validUserIdArray = validUserIds.map((user) => user.id).filter((id) => id !== null && id !== undefined)

    const baseFilter: any = {
      from: 'chinafacil',
    }

    if (dateStart) {
      baseFilter.createdAt = {
        ...baseFilter.createdAt,
        gte: new Date(`${dateStart} 00:00:00`),
      }
    }

    if (dateEnd) {
      baseFilter.createdAt = {
        ...baseFilter.createdAt,
        lte: new Date(`${dateEnd} 23:59:59`),
      }
    }

    if (validUserIdArray.length > 0) {
      baseFilter.userId = {
        in: validUserIdArray,
      }
    } else {
      baseFilter.userId = {
        in: [],
      }
    }

    const openFilter = {
      ...baseFilter,
      status: SolicitationStatus.open,
    }

    const [totalSolicitations, openSolicitations, solicitationsWithCart, uniqueUsersResult] = await Promise.all([
      this.prisma.solicitation.count({
        where: baseFilter,
      }),
      this.prisma.solicitation.count({
        where: openFilter,
      }),
      this.prisma.solicitation.findMany({
        where: {
          ...baseFilter,
          cart: { isNot: null },
        },
        include: {
          cart: true,
        },
      }),
      this.prisma.solicitation.groupBy({
        by: ['userId'],
        where: baseFilter,
      }),
    ])

    const totalValue = this.calculateTotalCartValue(solicitationsWithCart)
    const totalItems = this.calculateTotalCartItems(solicitationsWithCart)

    return {
      status: 'success',
      data: {
        totalSolicitations,
        totalValue,
        uniqueUsers: uniqueUsersResult.length,
        openSolicitations,
        totalItems,
      },
    }
  }

  private calculateTotalCartValue(solicitationsWithCart: any[]): number {
    let grandTotal = 0

    for (const solicitation of solicitationsWithCart) {
      if (!solicitation.cart?.items) continue

      let items: any = solicitation.cart.items
      
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items)
        } catch (e) {
          continue
        }
      }
      
      if (!Array.isArray(items)) continue

      for (const item of items) {
        if (item?.variations && Array.isArray(item.variations)) {
          for (const variation of item.variations) {
            const price = parseFloat(variation.price || 0)
            const quantity = parseFloat(variation.quantity || 0)
            grandTotal += price * quantity
          }
        }
      }
    }

    return grandTotal
  }

  private calculateTotalCartItems(solicitationsWithCart: any[]): number {
    let totalItems = 0

    for (const solicitation of solicitationsWithCart) {
      if (!solicitation.cart?.items) continue

      let items: any = solicitation.cart.items
      
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items)
        } catch (e) {
          continue
        }
      }
      
      if (Array.isArray(items)) {
        totalItems += items.length
      }
    }

    return totalItems
  }

  async getKanban() {
    const validUserIds = await this.prisma.user.findMany({
      select: { id: true },
    });
    const validUserIdArray = validUserIds.map((user) => user.id);

    const solicitations = await this.prisma.solicitation.findMany({
      where: {
        userId: {
          in: validUserIdArray.length > 0 ? validUserIdArray : [],
        },
      },
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
        items: {
          select: {
            id: true,
            actionOf: true,
            status: true,
          },
        },
      },
    })

    type SolicitationWithRelations = typeof solicitations[0]
    const kanban: Record<SolicitationStatus, SolicitationWithRelations[]> = {
      [SolicitationStatus.open]: [],
      [SolicitationStatus.in_progress]: [],
      [SolicitationStatus.finished]: [],
      [SolicitationStatus.pending]: [],
    }

    solicitations.forEach((solicitation) => {
      if (kanban[solicitation.status]) {
        kanban[solicitation.status].push(solicitation)
      }
    })

    return kanban
  }

  async assignResponsibility(
    id: string,
    assignDto: AssignResponsibilityDto,
  ) {
    const solicitation = await this.prisma.solicitation.findUnique({
      where: { id },
    })

    if (!solicitation) {
      throw new NotFoundException('Solicitação não encontrada')
    }

    const updatedSolicitation = await this.prisma.solicitation.update({
      where: { id },
      data: {
        responsibleType: assignDto.responsibleType,
        responsibleId: assignDto.responsibleId,
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
    })

    return updatedSolicitation
  }

  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    
    const count = await this.prisma.solicitation.count({
      where: {
        createdAt: {
          gte: new Date(year, new Date().getMonth(), 1),
          lt: new Date(year, new Date().getMonth() + 1, 1),
        },
      },
    })

    const sequence = String(count + 1).padStart(4, '0')
    return `SOL-${year}${month}-${sequence}`
  }
}


