import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { PlansService } from './plans.service'
import { PrismaService } from '../../../database/prisma.service'

describe('PlansService', () => {
  let service: PlansService
  let prismaService: PrismaService

  const mockPlan = {
    id: 'plan-123',
    name: 'Plano Básico',
    description: 'Plano básico de serviços',
    price: 99.99,
    features: { feature1: true, feature2: false },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        {
          provide: PrismaService,
          useValue: {
            plan: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            subscription: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<PlansService>(PlansService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createPlanDto = {
      name: 'Novo Plano',
      description: 'Descrição do novo plano',
      price: 149.99,
      features: { feature1: true },
    }

    it('deve criar novo plano com sucesso', async () => {
      jest.spyOn(prismaService.plan, 'create').mockResolvedValue({
        ...mockPlan,
        ...createPlanDto,
        id: 'new-plan-123',
      } as any)

      const result = await service.create(createPlanDto)

      expect(result).toBeDefined()
      expect(result.name).toBe(createPlanDto.name)
      expect(prismaService.plan.create).toHaveBeenCalledWith({
        data: createPlanDto,
      })
    })
  })

  describe('findAll', () => {
    it('deve retornar lista de planos ordenados por data', async () => {
      const mockPlans = [mockPlan]
      jest.spyOn(prismaService.plan, 'findMany').mockResolvedValue(mockPlans as any)

      const result = await service.findAll()

      expect(result).toHaveLength(1)
      expect(prismaService.plan.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
        include: expect.any(Object),
      })
    })
  })

  describe('findActive', () => {
    it('deve retornar apenas planos ativos ordenados por preço', async () => {
      const activePlans = [{ ...mockPlan, isActive: true }]
      jest.spyOn(prismaService.plan, 'findMany').mockResolvedValue(activePlans as any)

      const result = await service.findActive()

      expect(result).toHaveLength(1)
      expect(prismaService.plan.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          price: 'asc',
        },
      })
    })
  })

  describe('findOne', () => {
    it('deve retornar plano quando encontrado', async () => {
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(mockPlan as any)

      const result = await service.findOne('plan-123')

      expect(result).toEqual(mockPlan)
      expect(prismaService.plan.findUnique).toHaveBeenCalledWith({
        where: { id: 'plan-123' },
        include: expect.any(Object),
      })
    })

    it('deve lançar exceção quando plano não encontrado', async () => {
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(null)

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    const updatePlanDto = {
      name: 'Plano Atualizado',
    }

    it('deve atualizar plano com sucesso', async () => {
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(mockPlan as any)
      jest.spyOn(prismaService.plan, 'update').mockResolvedValue({
        ...mockPlan,
        ...updatePlanDto,
      } as any)

      const result = await service.update('plan-123', updatePlanDto)

      expect(result.name).toBe(updatePlanDto.name)
      expect(prismaService.plan.update).toHaveBeenCalledWith({
        where: { id: 'plan-123' },
        data: updatePlanDto,
      })
    })

    it('deve lançar exceção quando plano não encontrado', async () => {
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(null)

      await expect(service.update('non-existent', updatePlanDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('deve deletar plano quando não há assinaturas', async () => {
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(mockPlan as any)
      jest.spyOn(prismaService.subscription, 'count').mockResolvedValue(0)
      jest.spyOn(prismaService.plan, 'delete').mockResolvedValue(mockPlan as any)

      const result = await service.remove('plan-123')

      expect(result.message).toBe('Plano removido com sucesso')
      expect(prismaService.plan.delete).toHaveBeenCalledWith({
        where: { id: 'plan-123' },
      })
    })

    it('deve desativar plano quando há assinaturas ativas', async () => {
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(mockPlan as any)
      jest.spyOn(prismaService.subscription, 'count').mockResolvedValue(5)
      jest.spyOn(prismaService.plan, 'update').mockResolvedValue({
        ...mockPlan,
        isActive: false,
      } as any)

      const result = await service.remove('plan-123')

      expect(result.message).toBe('Plano desativado (existem assinaturas ativas)')
      expect(prismaService.plan.update).toHaveBeenCalledWith({
        where: { id: 'plan-123' },
        data: { isActive: false },
      })
    })

    it('deve lançar exceção quando plano não encontrado', async () => {
      jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(null)

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException)
    })
  })
})

