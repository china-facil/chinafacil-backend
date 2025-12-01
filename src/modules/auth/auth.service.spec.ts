import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { AuthService } from './auth.service'
import { PrismaService } from '../../database/prisma.service'
import { UserRole, UserStatus } from '@prisma/client'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService
  let prismaService: PrismaService
  let jwtService: JwtService
  let configService: ConfigService

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: UserRole.user,
    status: UserStatus.active,
    phone: null,
    avatar: null,
    phoneVerified: false,
    employees: null,
    monthlyBilling: null,
    cnpj: null,
    companyData: null,
    emailVerifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    subscription: null,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRATION: '7d',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_REFRESH_EXPIRATION: '30d',
              }
              return config[key]
            }),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    prismaService = module.get<PrismaService>(PrismaService)
    jwtService = module.get<JwtService>(JwtService)
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('validateUser', () => {
    it('deve retornar usuário quando credenciais são válidas', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.validateUser('test@example.com', 'password123')

      expect(result).toBeDefined()
      expect(result.id).toBe(mockUser.id)
      expect(result.email).toBe(mockUser.email)
      expect(result.password).toBeUndefined()
    })

    it('deve retornar null quando usuário não existe', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

      const result = await service.validateUser('notfound@example.com', 'password123')

      expect(result).toBeNull()
    })

    it('deve retornar null quando senha é inválida', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await service.validateUser('test@example.com', 'wrongpassword')

      expect(result).toBeNull()
    })

    it('deve lançar exceção quando usuário está suspenso', async () => {
      const suspendedUser = { ...mockUser, status: UserStatus.suspended }
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(suspendedUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('deve lançar exceção quando usuário está inativo', async () => {
      const inactiveUser = { ...mockUser, status: UserStatus.inactive }
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(inactiveUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('login', () => {
    it('deve retornar tokens quando login é bem-sucedido', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-token')

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('tokenType', 'Bearer')
      expect(jwtService.sign).toHaveBeenCalledTimes(2)
    })

    it('deve lançar exceção quando credenciais são inválidas', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('register', () => {
    const registerDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      phone: '11999999999',
      cnpj: null,
      companyData: null,
    }

    it('deve criar novo usuário com sucesso', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        ...mockUser,
        ...registerDto,
        id: 'new-user-123',
      } as any)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-token')

      const result = await service.register(registerDto)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('user')
      expect(prismaService.user.create).toHaveBeenCalled()
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10)
    })

    it('deve lançar exceção quando email já existe', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException)
    })
  })
})



