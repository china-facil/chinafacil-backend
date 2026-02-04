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
    postalCode: '01234567',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createAddressDto = {
    street: 'Rua Nova',
    number: '456',
    neighborhood: 'Jardim',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01234567',
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
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
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
      } as any)
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({} as any)

      const result = await service.create('user-123', createAddressDto)

      expect(result).toEqual(expect.objectContaining(createAddressDto))
      expect(prismaService.userAddress.create).toHaveBeenCalledWith({
        data: {
          ...createAddressDto,
          userId: 'user-123',
        },
      })
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { defaultAddress: 'address-123' },
      })
    })

    it('deve criar endereço sem definir como padrão se já existir outro', async () => {
      jest.spyOn(prismaService.userAddress, 'count').mockResolvedValue(1)
      jest.spyOn(prismaService.userAddress, 'create').mockResolvedValue({
        ...mockAddress,
        ...createAddressDto,
      } as any)

      const result = await service.create('user-123', createAddressDto)

      expect(result).toEqual(expect.objectContaining(createAddressDto))
      expect(prismaService.userAddress.create).toHaveBeenCalledWith({
        data: {
          ...createAddressDto,
          userId: 'user-123',
        },
      })
      expect(prismaService.user.update).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('deve retornar lista de endereços ordenados por padrão primeiro', async () => {
      const addresses = [
        { ...mockAddress },
        { ...mockAddress, id: 'address-456' },
      ]
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        defaultAddress: 'address-456',
      } as any)
      jest.spyOn(prismaService.userAddress, 'findMany').mockResolvedValue(addresses as any)

      const result = await service.findAll('user-123')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('address-456')
      expect(prismaService.userAddress.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: {
          createdAt: 'desc',
        },
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
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(mockAddress as any)
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        defaultAddress: 'address-123',
      } as any)
      jest.spyOn(prismaService.userAddress, 'delete').mockResolvedValue({} as any)
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({} as any)

      const result = await service.remove('address-123', 'user-123')

      expect(result.message).toBe('Endereço excluído com sucesso')
      expect(prismaService.userAddress.delete).toHaveBeenCalledWith({
        where: { id: 'address-123' },
      })
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { defaultAddress: null },
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
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({} as any)

      const result = await service.setDefault('address-123', 'user-123')

      expect(result.message).toBe('Endereço padrão atualizado com sucesso')
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { defaultAddress: 'address-123' },
      })
    })

    it('deve lançar exceção quando endereço não encontrado', async () => {
      jest.spyOn(prismaService.userAddress, 'findFirst').mockResolvedValue(null)

      await expect(service.setDefault('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})









