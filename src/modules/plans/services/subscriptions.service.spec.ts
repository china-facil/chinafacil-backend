import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { PrismaService } from '../../../database/prisma.service'
import { SubscriptionStatus } from '@prisma/client'

describe('SubscriptionsService', () => {
  let service: SubscriptionsService
  let prismaService: PrismaService

  const mockSubscription = {
    id: 'sub-123',
    userId: 'user-123',
    planId: 'plan-123',
    status: SubscriptionStatus.ACTIVE,
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  }

  const mockPlan = {
    id: 'plan-123',
    name: 'Plano Básico',
    price: 99.99,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: {
            subscription: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            plan: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<SubscriptionsService>(SubscriptionsService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createSubscriptionDto = {
      userId: 'user-123',
      planId: 'plan-123',
      status: SubscriptionStatus.PENDING,
    }

    it('deve criar nova assinatura com sucesso', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(mockPlan as any)
      jest.spyOn(prismaService.subscription, 'create').mockResolvedValue({
        ...mockSubscription,
        ...createSubscriptionDto,
        user: mockUser,
        plan: mockPlan,
      } as any)

      const result = await service.create(createSubscriptionDto)

      expect(result).toBeDefined()
      expect(result.userId).toBe(createSubscriptionDto.userId)
      expect(prismaService.subscription.create).toHaveBeenCalled()
    })

    it('deve lançar exceção quando usuário já possui assinatura', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(mockSubscription as any)

      await expect(service.create(createSubscriptionDto)).rejects.toThrow(BadRequestException)
    })

    it('deve lançar exceção quando usuário não encontrado', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

      await expect(service.create(createSubscriptionDto)).rejects.toThrow(NotFoundException)
    })

    it('deve lançar exceção quando plano não encontrado', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(null)

      await expect(service.create(createSubscriptionDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll', () => {
    it('deve retornar lista de assinaturas ordenadas por data', async () => {
      const subscriptions = [mockSubscription]
      jest.spyOn(prismaService.subscription, 'findMany').mockResolvedValue(subscriptions as any)

      const result = await service.findAll()

      expect(result).toHaveLength(1)
      expect(prismaService.subscription.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
        include: expect.any(Object),
      })
    })
  })

  describe('findOne', () => {
    it('deve retornar assinatura quando encontrada', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(mockSubscription as any)

      const result = await service.findOne('sub-123')

      expect(result).toEqual(mockSubscription)
      expect(prismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        include: expect.any(Object),
      })
    })

    it('deve lançar exceção quando assinatura não encontrada', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findByUser', () => {
    it('deve retornar assinatura do usuário', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(mockSubscription as any)

      const result = await service.findByUser('user-123')

      expect(result).toEqual(mockSubscription)
      expect(prismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: expect.any(Object),
      })
    })

    it('deve retornar null quando usuário não possui assinatura', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)

      const result = await service.findByUser('user-123')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    const updateSubscriptionDto = {
      status: SubscriptionStatus.ACTIVE,
    }

    it('deve atualizar assinatura com sucesso', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(mockSubscription as any)
      jest.spyOn(prismaService.subscription, 'update').mockResolvedValue({
        ...mockSubscription,
        ...updateSubscriptionDto,
      } as any)

      const result = await service.update('sub-123', updateSubscriptionDto)

      expect(result.status).toBe(updateSubscriptionDto.status)
      expect(prismaService.subscription.update).toHaveBeenCalled()
    })

    it('deve validar plano quando planId é atualizado', async () => {
      const updateDto = { planId: 'new-plan-123' }
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(mockSubscription as any)
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(mockPlan as any)
      jest.spyOn(prismaService.subscription, 'update').mockResolvedValue({
        ...mockSubscription,
        planId: 'new-plan-123',
      } as any)

      await service.update('sub-123', updateDto)

      expect(prismaService.plan.findUnique).toHaveBeenCalledWith({
        where: { id: 'new-plan-123' },
      })
    })

    it('deve lançar exceção quando assinatura não encontrada', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)

      await expect(service.update('non-existent', updateSubscriptionDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('deve remover assinatura com sucesso', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(mockSubscription as any)
      jest.spyOn(prismaService.subscription, 'delete').mockResolvedValue(mockSubscription as any)

      const result = await service.remove('sub-123')

      expect(result.message).toBe('Assinatura removida com sucesso')
      expect(prismaService.subscription.delete).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
      })
    })

    it('deve lançar exceção quando assinatura não encontrada', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('cancel', () => {
    it('deve cancelar assinatura com sucesso', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(mockSubscription as any)
      jest.spyOn(prismaService.subscription, 'update').mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELLED,
      } as any)

      const result = await service.cancel('sub-123')

      expect(result.status).toBe(SubscriptionStatus.CANCELLED)
      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        data: {
          status: SubscriptionStatus.CANCELLED,
        },
        include: expect.any(Object),
      })
    })

    it('deve lançar exceção quando assinatura não encontrada', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)

      await expect(service.cancel('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('activate', () => {
    it('deve ativar assinatura com sucesso', async () => {
      const pendingSubscription = {
        ...mockSubscription,
        status: SubscriptionStatus.PENDING,
        startedAt: null,
      }
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(pendingSubscription as any)
      jest.spyOn(prismaService.subscription, 'update').mockResolvedValue({
        ...pendingSubscription,
        status: SubscriptionStatus.ACTIVE,
        startedAt: expect.any(Date),
      } as any)

      const result = await service.activate('sub-123')

      expect(result.status).toBe(SubscriptionStatus.ACTIVE)
      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startedAt: expect.any(Date),
        },
        include: expect.any(Object),
      })
    })

    it('deve manter startedAt quando já existe', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(mockSubscription as any)
      jest.spyOn(prismaService.subscription, 'update').mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.ACTIVE,
      } as any)

      await service.activate('sub-123')

      expect(prismaService.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            startedAt: mockSubscription.startedAt,
          }),
        }),
      )
    })

    it('deve lançar exceção quando assinatura não encontrada', async () => {
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue(null)

      await expect(service.activate('non-existent')).rejects.toThrow(NotFoundException)
    })
  })
})

