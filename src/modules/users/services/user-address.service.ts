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
      },
    })

    // Se for o primeiro endereço, definir como padrão
    if (addressCount === 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddress: address.id },
      })
    }

    return address
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { defaultAddress: true },
    })

    const addresses = await this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Ordenar para que o endereço padrão apareça primeiro
    if (user?.defaultAddress) {
      addresses.sort((a, b) => {
        if (a.id === user.defaultAddress) return -1
        if (b.id === user.defaultAddress) return 1
        return 0
      })
    }

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

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { defaultAddress: true },
    })

    await this.prisma.userAddress.delete({
      where: { id },
    })

    // Se o endereço removido era o padrão, limpar default_address
    if (user?.defaultAddress === id) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddress: null },
      })
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

    await this.prisma.user.update({
      where: { id: userId },
      data: { defaultAddress: id },
    })

    return {
      message: 'Endereço padrão atualizado com sucesso',
    }
  }
}



