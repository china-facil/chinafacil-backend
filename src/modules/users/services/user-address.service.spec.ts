import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { UserAddressService } from './user-address.service'
import { PrismaService } from '../../../database/prisma.service'

describe('UserAddressService', () => {
  let service: UserAddressService
  let prismaService: PrismaService

  const mockAddress = {
    id: 'address-123',
    userId: 'user-123',
    street: 'Rua Teste',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234567',
    country: 'Brasil',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createAddressDto = {
    street: 'Rua Nova',
    number: '456',
    complement: null,
    neighborhood: 'Jardim',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234567',
    country: 'Brasil',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAddressService,
        {
          provide: PrismaService,
          useValue: {
            userAddress: {
              count: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<UserAddressService>(UserAddressService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('deve criar novo endereço e definir como padrão se for o primeiro', async () => {
      jest.spyOn(prismaService.userAddress, 'count').mockResolvedValue(0)
      jest.spyOn(prismaService.userAddress, 'create').mockResolvedValue({
        ...mockAddress,
        ...createAddressDto,
        isDefault: true,
      } as any)

      const result = await service.create('user-123', createAddressDto)

      expect(result.isDefault).toBe(true)
      expect(prismaService.userAddress.create).toHaveBeenCalledWith({
        data: {
          ...createAddressDto,
          userId: 'user-123',
          isDefault: true,
        },
      })
    })

    it('deve criar endereço sem definir como padrão se já existir outro', async () => {
      jest.spyOn(prismaService.userAddress, 'count').mockResolvedValue(1)
      jest.spyOn(prismaService.userAddress, 'create').mockResolvedValue({
        ...mockAddress,
        ...createAddressDto,
        isDefault: false,
      } as any)

      const result = await service.create('user-123', createAddressDto)

      expect(result.isDefault).toBe(false)
      expect(prismaService.userAddress.create).toHaveBeenCalledWith({
        data: {
          ...createAddressDto,
          userId: 'user-123',
          isDefault: false,
        },
      })
    })
  })

  describe('findAll', () => {
    it('deve retornar lista de endereços ordenados por padrão primeiro', async () => {
      const addresses = [
        { ...mockAddress, isDefault: false },
        { ...mockAddress, id: 'address-456', isDefault: true },
      ]
      jest.spyOn(prismaService.userAddress, 'findMany').mockResolvedValue(addresses as any)

      const result = await service.findAll('user-123')

      expect(result).toHaveLength(2)
      expect(prismaService.userAddress.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      })
    })
  })

  describe('findOne', () => {
    it('deve retornar endereço quando encontrado', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(mockAddress as any)

      const result = await service.findOne('address-123', 'user-123')

      expect(result).toEqual(mockAddress)
      expect(prismaService.userAddress.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'address-123',
          userId: 'user-123',
        },
      })
    })

    it('deve lançar exceção quando endereço não encontrado', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(null)

      await expect(service.findOne('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('update', () => {
    const updateAddressDto = {
      street: 'Rua Atualizada',
    }

    it('deve atualizar endereço com sucesso', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(mockAddress as any)
      jest.spyOn(prismaService.userAddress, 'update').mockResolvedValue({
        ...mockAddress,
        ...updateAddressDto,
      } as any)

      const result = await service.update('address-123', 'user-123', updateAddressDto)

      expect(result.street).toBe(updateAddressDto.street)
      expect(prismaService.userAddress.update).toHaveBeenCalledWith({
        where: { id: 'address-123' },
        data: updateAddressDto,
      })
    })

    it('deve lançar exceção quando endereço não encontrado', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(null)

      await expect(
        service.update('non-existent', 'user-123', updateAddressDto),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('deve remover endereço e definir próximo como padrão se removido era padrão', async () => {
      const defaultAddress = { ...mockAddress, isDefault: true }
      const nextAddress = { ...mockAddress, id: 'address-456', isDefault: false }

      jest.spyOn(prismaService.userAddress, 'findFirst')
        .mockResolvedValueOnce(defaultAddress as any)
        .mockResolvedValueOnce(nextAddress as any)
      jest.spyOn(prismaService.userAddress, 'delete').mockResolvedValue({} as any)
      jest.spyOn(prismaService.userAddress, 'update').mockResolvedValue({
        ...nextAddress,
        isDefault: true,
      } as any)

      const result = await service.remove('address-123', 'user-123')

      expect(result.message).toBe('Endereço excluído com sucesso')
      expect(prismaService.userAddress.delete).toHaveBeenCalledWith({
        where: { id: 'address-123' },
      })
      expect(prismaService.userAddress.update).toHaveBeenCalledWith({
        where: { id: 'address-456' },
        data: { isDefault: true },
      })
    })

    it('deve remover endereço sem alterar padrão se não era padrão', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(mockAddress as any)
      jest.spyOn(prismaService.userAddress, 'delete').mockResolvedValue({} as any)

      const result = await service.remove('address-123', 'user-123')

      expect(result.message).toBe('Endereço excluído com sucesso')
      expect(prismaService.userAddress.delete).toHaveBeenCalled()
    })

    it('deve lançar exceção quando endereço não encontrado', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(null)

      await expect(service.remove('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('setDefault', () => {
    it('deve definir endereço como padrão e remover padrão dos outros', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(mockAddress as any)
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          userAddress: {
            updateMany: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({ ...mockAddress, isDefault: true }),
          },
        })
      })

      const result = await service.setDefault('address-123', 'user-123')

      expect(result.message).toBe('Endereço padrão atualizado com sucesso')
      expect(prismaService.$transaction).toHaveBeenCalled()
    })

    it('deve lançar exceção quando endereço não encontrado', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(null)

      await expect(service.setDefault('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})



