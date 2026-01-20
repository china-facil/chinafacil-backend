import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UserRole, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../database/prisma.service'
import {
  CreateUserDto,
  FilterUserDto,
  UpdatePhoneDto,
  UpdateUserDto,
} from './dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || UserRole.lead,
        status: createUserDto.status || UserStatus.active,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        phoneVerified: true,
        employees: true,
        monthlyBilling: true,
        cnpj: true,
        companyData: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  }

  async findAll(filterDto: FilterUserDto) {
    const { 
      search, 
      role, 
      status, 
      page = 1, 
      limit = 10, 
      items_per_page,
      phone_verified,
      date_start,
      date_end,
      order,
      'order-key': orderKey,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = filterDto

    const perPage = items_per_page || limit
    const skip = (page - 1) * perPage
    const take = perPage

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    if (phone_verified !== undefined) {
      where.phoneVerified = phone_verified
    }

    if (date_start && date_end) {
      where.createdAt = {
        gte: new Date(`${date_start} 00:00:00`),
        lte: new Date(`${date_end} 23:59:59`),
      }
    }

    const actualSortBy = orderKey || sortBy
    const actualSortOrder = order || sortOrder

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          [actualSortBy as string]: actualSortOrder,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          phoneVerified: true,
          employees: true,
          monthlyBilling: true,
          cnpj: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            include: {
              client: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      status: 'success',
      data: {
        data: users.map(user => ({
          ...user,
          phone_verified: user.phoneVerified,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
          monthly_billing: user.monthlyBilling,
        })),
        total,
        totalPage: Math.ceil(total / perPage),
        current_page: page,
        per_page: perPage,
      },
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        phoneVerified: true,
        employees: true,
        monthlyBilling: true,
        cnpj: true,
        companyData: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          include: {
                                                                                                                                  client: true,
          },
        },
        addresses: true,
        favorites: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      })

      if (existingUser) {
        throw new BadRequestException('Email já cadastrado')
      }
    }

    const updateData: any = { ...updateUserDto }

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        phoneVerified: true,
        employees: true,
        monthlyBilling: true,
        cnpj: true,
        companyData: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    await this.prisma.user.delete({
      where: { id },
    })

    return {
      message: 'Usuário removido com sucesso',
    }
  }

  async findLeads() {
    const leads = await this.prisma.user.findMany({
      where: {
        role: UserRole.user,
        subscription: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return leads
  }

  async updatePhone(id: string, updatePhoneDto: UpdatePhoneDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        phone: updatePhoneDto.phone,
        phoneVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerified: true,
      },
    })

    return updatedUser
  }

  async validatePhone(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        phoneVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerified: true,
      },
    })

    return updatedUser
  }

  async updateAvatar(id: string, avatarUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        avatar: avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    })

    return updatedUser
  }

  async getDataUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            client: true,
          },
        },
        addresses: true,
        favorites: {
          select: {
            itemId: true,
          },
        },
        clientUsers: {
          include: {
            client: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    // Buscar abilities do banco (polymorphic relation)
    const abilitiesResult = await this.prisma.$queryRaw<
      Array<{ action: string; subject: string }>
    >`
      SELECT action, subject 
      FROM abilities 
      WHERE abilitiable_type = 'App\\Models\\User' 
      AND abilitiable_id = ${userId}
    `

    const abilities =
      abilitiesResult.length > 0
        ? abilitiesResult
        : this.getDefaultAbilities(user.role)

    const favoritesIds = user.favorites
      .map((f) => f.itemId)
      .filter((id): id is string => id !== null)

    const clients = user.clientUsers.map((cu) => cu.client)

    return {
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone || null,
        avatar: user.avatar || null,
        email: user.email,
        role: user.role,
        cnpj: user.cnpj || null,
        status: user.status,
        leads: [], // TODO: Implementar se necessário
        email_verified_at: user.emailVerifiedAt?.toISOString() || null,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
        abilities,
        clients,
        address: user.addresses || [],
        phone_verified: user.phoneVerified,
        favorites: favoritesIds,
        employees: user.employees || null,
        monthly_billing: user.monthlyBilling || null,
      },
    }
  }

  private getDefaultAbilities(role: UserRole): Array<{ action: string; subject: string }> {
    switch (role) {
      case UserRole.admin:
        return [{ action: 'manage', subject: 'all' }]
      case UserRole.user:
        return [
          { action: 'read', subject: 'Solicitations' },
          { action: 'read', subject: 'General' },
          { action: 'read', subject: 'UserProfile' },
          { action: 'read', subject: 'Logout' },
          { action: 'read', subject: 'Auth' },
          { action: 'read', subject: 'ClientDashboard' },
        ]
      case UserRole.seller:
        return [
          { action: 'read', subject: 'Solicitations' },
          { action: 'manage', subject: 'Solicitations' },
          { action: 'read', subject: 'General' },
          { action: 'read', subject: 'UserProfile' },
          { action: 'read', subject: 'Auth' },
          { action: 'read', subject: 'Logout' },
          { action: 'read', subject: 'ClientDashboard' },
        ]
      default:
        return []
    }
  }

  async getStatisticsAdminDashboard(startDate?: string, endDate?: string) {
    const dateFilter: any = {}
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(`${startDate} 00:00:00`),
        lte: new Date(`${endDate} 23:59:59`),
      }
    }

    const validUserIds = await this.prisma.user.findMany({
      select: { id: true },
    })

    const validUserIdArray = validUserIds.map((user) => user.id).filter((id) => id !== null && id !== undefined)

    const solicitationFilter: any = {
      ...dateFilter,
      from: 'chinafacil',
    }

    if (validUserIdArray.length > 0) {
      solicitationFilter.userId = {
        in: validUserIdArray,
      }
    } else {
      solicitationFilter.userId = {
        in: [],
      }
    }

    const [totalLeads, totalClients, totalUsers, totalSolicitations, solicitationsWithCart] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: UserRole.lead,
          ...dateFilter,
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.client,
          ...(startDate && endDate ? {
            subscription: {
              createdAt: {
                gte: new Date(`${startDate} 00:00:00`),
                lte: new Date(`${endDate} 23:59:59`),
              },
            },
          } : {}),
        },
      }),
      this.prisma.user.count(),
      this.prisma.solicitation.count({
        where: solicitationFilter,
      }),
      this.prisma.solicitation.findMany({
        where: {
          ...solicitationFilter,
          cart: { isNot: null },
        },
        include: {
          cart: true,
        },
      }),
    ])

    const totalMonthValue = this.calculateTotalCartValue(solicitationsWithCart)

    return {
      status: 'success',
      data: {
        totalLeads,
        totalClients,
        totalSolicitations,
        totalUsers,
        totalMonthValue,
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
}

