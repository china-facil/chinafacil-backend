import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import {
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from '../dto'

@Injectable()
export class UserAddressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createUserAddressDto: CreateUserAddressDto) {
    const addressCount = await this.prisma.userAddress.count({
      where: { userId },
    })

    const address = await this.prisma.userAddress.create({
      data: {
        ...createUserAddressDto,
        userId,
        isDefault: addressCount === 0,
      },
    })

    return address
  }

  async findAll(userId: string) {
    const addresses = await this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return addresses
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!address) {
      throw new NotFoundException('Endereço não encontrado')
    }

    return address
  }

  async update(
    id: string,
    userId: string,
    updateUserAddressDto: UpdateUserAddressDto,
  ) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!address) {
      throw new NotFoundException('Endereço não encontrado')
    }

    const updatedAddress = await this.prisma.userAddress.update({
      where: { id },
      data: updateUserAddressDto,
    })

    return updatedAddress
  }

  async remove(id: string, userId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!address) {
      throw new NotFoundException('Endereço não encontrado')
    }

    await this.prisma.userAddress.delete({
      where: { id },
    })

    if (address.isDefault) {
      const firstAddress = await this.prisma.userAddress.findFirst({
        where: { userId },
      })

      if (firstAddress) {
        await this.prisma.userAddress.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        })
      }
    }

    return {
      message: 'Endereço excluído com sucesso',
    }
  }

  async setDefault(id: string, userId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!address) {
      throw new NotFoundException('Endereço não encontrado')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      })

      await tx.userAddress.update({
        where: { id },
        data: { isDefault: true },
      })
    })

    return {
      message: 'Endereço padrão atualizado com sucesso',
    }
  }
}

