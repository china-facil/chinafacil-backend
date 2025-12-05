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
        role: createUserDto.role || UserRole.user,
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
    const { search, role, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filterDto

    const skip = (page - 1) * limit
    const take = limit

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

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy as string]: sortOrder,
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
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
}

