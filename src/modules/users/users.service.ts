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
        role: createUserDto.role || UserRole.USER,
        status: createUserDto.status || UserStatus.ACTIVE,
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
              plan: true,
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
            plan: true,
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
        role: UserRole.USER,
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
}

