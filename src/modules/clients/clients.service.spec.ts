import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { PrismaService } from '../../database/prisma.service'

describe('ClientsService', () => {
  let service: ClientsService
  let prismaService: PrismaService

  const mockClient = {
    id: 'client-123',
    name: 'Test Client',
    email: 'client@example.com',
    status: 'active',
    cfCode: 'CF123',
    planStatus: 'active',
    companyData: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            clientUser: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<ClientsService>(ClientsService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createClientDto = {
      name: 'New Client',
      email: 'newclient@example.com',
      status: 'active',
    }

    it('deve criar novo cliente com sucesso', async () => {
      jest.spyOn(prismaService.client, 'create').mockResolvedValue({
        ...mockClient,
        ...createClientDto,
        id: 'new-client-123',
      } as any)

      const result = await service.create(createClientDto)

      expect(result).toBeDefined()
      expect(result.name).toBe(createClientDto.name)
      expect(result.email).toBe(createClientDto.email)
      expect(prismaService.client.create).toHaveBeenCalledWith({
        data: createClientDto,
      })
    })
  })

  describe('findAll', () => {
    it('deve retornar lista de clientes com paginação', async () => {
      const mockClients = [mockClient]
      jest.spyOn(prismaService.client, 'findMany').mockResolvedValue(mockClients as any)
      jest.spyOn(prismaService.client, 'count').mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(1)
      expect(result.meta.page).toBe(1)
      expect(result.meta.limit).toBe(10)
      expect(prismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        }),
      )
    })

    it('deve filtrar por search', async () => {
      jest.spyOn(prismaService.client, 'findMany').mockResolvedValue([])
      jest.spyOn(prismaService.client, 'count').mockResolvedValue(0)

      await service.findAll({ search: 'test', page: 1, limit: 10 })

      expect(prismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'test' } },
              { email: { contains: 'test' } },
              { cfCode: { contains: 'test' } },
            ],
          }),
        }),
      )
    })

    it('deve filtrar por status', async () => {
      jest.spyOn(prismaService.client, 'findMany').mockResolvedValue([])
      jest.spyOn(prismaService.client, 'count').mockResolvedValue(0)

      await service.findAll({ status: 'active', page: 1, limit: 10 })

      expect(prismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        }),
      )
    })
  })

  describe('findOne', () => {
    it('deve retornar cliente quando encontrado', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(mockClient as any)

      const result = await service.findOne('client-123')

      expect(result).toEqual(mockClient)
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: 'client-123', deletedAt: null },
      })
    })

    it('deve lançar exceção quando cliente não encontrado', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(null)

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    const updateClientDto = {
      name: 'Updated Client',
    }

    it('deve atualizar cliente com sucesso', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(mockClient as any)
      jest.spyOn(prismaService.client, 'update').mockResolvedValue({
        ...mockClient,
        ...updateClientDto,
      } as any)

      const result = await service.update('client-123', updateClientDto)

      expect(result.name).toBe(updateClientDto.name)
      expect(prismaService.client.update).toHaveBeenCalled()
    })

    it('deve lançar exceção quando cliente não encontrado', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(null)

      await expect(service.update('non-existent', updateClientDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('deve fazer soft delete do cliente', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(mockClient as any)
      jest.spyOn(prismaService.client, 'update').mockResolvedValue({
        ...mockClient,
        deletedAt: new Date(),
      } as any)

      const result = await service.remove('client-123')

      expect(result.message).toBe('Cliente removido com sucesso')
      expect(prismaService.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
          }),
        }),
      )
    })

    it('deve lançar exceção quando cliente não encontrado', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(null)

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findActivePlans', () => {
    it('deve retornar apenas clientes com planStatus active', async () => {
      const activeClients = [{ ...mockClient, planStatus: 'active' }]
      jest.spyOn(prismaService.client, 'findMany').mockResolvedValue(activeClients as any)

      const result = await service.findActivePlans()

      expect(result).toHaveLength(1)
      expect(prismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            planStatus: 'active',
          }),
        }),
      )
    })
  })

  describe('attachUser', () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'user@example.com',
    }

    it('deve vincular usuário ao cliente com sucesso', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(mockClient as any)
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      jest.spyOn(prismaService.clientUser, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prismaService.clientUser, 'create').mockResolvedValue({} as any)

      const result = await service.attachUser('client-123', 'user-123')

      expect(result.message).toBe('Usuário vinculado ao cliente com sucesso')
      expect(prismaService.clientUser.create).toHaveBeenCalled()
    })

    it('deve lançar exceção quando cliente não encontrado', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(null)

      await expect(service.attachUser('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('deve lançar exceção quando usuário já está vinculado', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(mockClient as any)
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any)
      jest.spyOn(prismaService.clientUser, 'findUnique').mockResolvedValue({} as any)

      await expect(service.attachUser('client-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('detachUser', () => {
    it('deve desvincular usuário do cliente com sucesso', async () => {
      jest.spyOn(prismaService.clientUser, 'findUnique').mockResolvedValue({} as any)
      jest.spyOn(prismaService.clientUser, 'delete').mockResolvedValue({} as any)

      const result = await service.detachUser('client-123', 'user-123')

      expect(result.message).toBe('Usuário desvinculado do cliente com sucesso')
      expect(prismaService.clientUser.delete).toHaveBeenCalled()
    })

    it('deve lançar exceção quando vínculo não encontrado', async () => {
      jest.spyOn(prismaService.clientUser, 'findUnique').mockResolvedValue(null)

      await expect(service.detachUser('client-123', 'user-123')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})









