import { Test, TestingModule } from '@nestjs/testing'
import { ClientsService } from './clients.service'
import { PrismaService } from '../../database/prisma.service'

const mockClient = {
  id: 'client-uuid-1',
  name: 'Test Client',
  price: 99.90,
  supplierSearch: 10,
  viabilityStudy: 5,
  planStatus: 'active',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockPrismaService = {
  client: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  clientUser: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
}

describe('ClientsService', () => {
  let service: ClientsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<ClientsService>(ClientsService)

    jest.clearAllMocks()
  })

  describe('create', () => {
    it('deve criar um cliente', async () => {
      const createClientDto = {
        name: 'New Client',
        price: 149.90,
        supplierSearch: 20,
        viabilityStudy: 10,
        planStatus: 'active',
      }

      mockPrismaService.client.create.mockResolvedValue({
        id: 'new-client-uuid',
        ...createClientDto,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await service.create(createClientDto)

      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: createClientDto,
      })
      expect(result.name).toBe(createClientDto.name)
    })
  })

  describe('findAll', () => {
    it('deve retornar lista paginada de clientes', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([mockClient])
      mockPrismaService.client.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })

    it('deve filtrar por busca', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([mockClient])
      mockPrismaService.client.count.mockResolvedValue(1)

      await service.findAll({ search: 'test', page: 1, limit: 10 })

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'test' },
          }),
        }),
      )
    })

    it('deve filtrar por planStatus', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([mockClient])
      mockPrismaService.client.count.mockResolvedValue(1)

      await service.findAll({ planStatus: 'active', page: 1, limit: 10 })

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            planStatus: 'active',
          }),
        }),
      )
    })
  })

  describe('findOne', () => {
    it('deve retornar um cliente por id', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient)

      const result = await service.findOne('client-uuid-1')

      expect(result.id).toBe('client-uuid-1')
    })

    it('deve lançar erro se cliente não encontrado', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null)

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Cliente não encontrado',
      )
    })
  })

  describe('update', () => {
    it('deve atualizar um cliente', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient)
      mockPrismaService.client.update.mockResolvedValue({
        ...mockClient,
        name: 'Updated Client',
      })

      const result = await service.update('client-uuid-1', {
        name: 'Updated Client',
      })

      expect(result.name).toBe('Updated Client')
    })
  })

  describe('remove', () => {
    it('deve remover um cliente (soft delete)', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient)
      mockPrismaService.client.update.mockResolvedValue({
        ...mockClient,
        deletedAt: new Date(),
      })

      const result = await service.remove('client-uuid-1')

      expect(result.message).toBe('Cliente removido com sucesso')
    })
  })

  describe('attachUser', () => {
    it('deve vincular um usuário ao cliente', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient)
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        name: 'Test User',
        email: 'user@example.com',
      })
      mockPrismaService.clientUser.findUnique.mockResolvedValue(null)
      mockPrismaService.clientUser.create.mockResolvedValue({
        userId: 'user-uuid-1',
        clientId: 'client-uuid-1',
      })

      const result = await service.attachUser('client-uuid-1', 'user-uuid-1')

      expect(result.message).toBe('Usuário vinculado ao cliente com sucesso')
    })
  })
})
