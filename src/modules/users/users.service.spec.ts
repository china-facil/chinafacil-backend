import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UsersService } from './users.service'
import { PrismaService } from '../../database/prisma.service'
import { UserRole, UserStatus } from '@prisma/client'

jest.mock('bcrypt')

describe('UsersService', () => {
  let service: UsersService
  let prismaService: PrismaService

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    phone: '11999999999',
    avatar: null,
    role: UserRole.user,
    status: UserStatus.active,
    phoneVerified: false,
    employees: null,
    monthlyBilling: null,
    cnpj: null,
    companyData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createUserDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      phone: '11988888888',
    }

    it('deve criar novo usuário com sucesso', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        ...mockUser,
        ...createUserDto,
        id: 'new-user-123',
      } as any)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')

      const result = await service.create(createUserDto)

      expect(result).toBeDefined()
      expect(result.email).toBe(createUserDto.email)
      expect(result.name).toBe(createUserDto.name)
      expect(prismaService.user.create).toHaveBeenCalled()
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10)
    })

    it('deve lançar exceção quando email já existe', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException)
    })

    it('deve usar role padrão LEAD quando não fornecido', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser as any)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')

      await service.create(createUserDto)

      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: UserRole.lead,
          }),
        }),
      )
    })
  })

  describe('findAll', () => {
    it('deve retornar lista de usuários com paginação', async () => {
      const mockUsers = [mockUser]
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers as any)
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(result.status).toBe('success')
      expect(result.data.data).toHaveLength(1)
      expect(result.data.total).toBe(1)
      expect(result.data.current_page).toBe(1)
      expect(result.data.per_page).toBe(10)
    })

    it('deve filtrar por search', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([])
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(0)

      await service.findAll({ search: 'test', page: 1, limit: 10 })

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'test' } },
              { email: { contains: 'test' } },
            ],
          }),
        }),
      )
    })

    it('deve filtrar por role', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([])
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(0)

      await service.findAll({ role: UserRole.admin, page: 1, limit: 10 })

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: UserRole.admin,
          }),
        }),
      )
    })
  })

  describe('findOne', () => {
    it('deve retornar usuário quando encontrado', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)

      const result = await service.findOne('user-123')

      expect(result).toEqual(mockUser)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      })
    })

    it('deve lançar exceção quando usuário não encontrado', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    const updateUserDto = {
      name: 'Updated Name',
    }

    it('deve atualizar usuário com sucesso', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      } as any)

      const result = await service.update('user-123', updateUserDto)

      expect(result.name).toBe(updateUserDto.name)
      expect(prismaService.user.update).toHaveBeenCalled()
    })

    it('deve lançar exceção quando usuário não encontrado', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

      await expect(service.update('non-existent', updateUserDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('deve deletar usuário permanentemente', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser as any)

      const result = await service.remove('user-123')

      expect(result.message).toBe('Usuário removido com sucesso')
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      })
    })

    it('deve lançar exceção quando usuário não encontrado', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findLeads', () => {
    it('deve retornar apenas usuários com role USER', async () => {
      const leads = [{ ...mockUser, role: UserRole.user }]
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(leads as any)

      const result = await service.findLeads()

      expect(result).toHaveLength(1)
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: UserRole.user,
          }),
        }),
      )
    })
  })
})

