import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { UpdateOtProductsFlagDto, UpdateHomepageCarouselFlagDto } from './dto'

@Injectable()
export class FeatureFlagsService {

  constructor(private readonly prisma: PrismaService) {}

  async getOtProductsFlag() {
    let flag = await this.prisma.flagsOtProducts.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!flag) {
      flag = await this.prisma.flagsOtProducts.create({
        data: {
          isActive: true,
          pageSize: 20,
        },
      })
    }

    return flag
  }

  async updateOtProductsFlag(updateDto: UpdateOtProductsFlagDto) {
    let flag = await this.prisma.flagsOtProducts.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!flag) {
      flag = await this.prisma.flagsOtProducts.create({
        data: {
          isActive: updateDto.isActive ?? true,
          pageSize: updateDto.pageSize ?? 20,
        },
      })
    } else {
      flag = await this.prisma.flagsOtProducts.update({
        where: { id: flag.id },
        data: {
          ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
          ...(updateDto.pageSize !== undefined && { pageSize: updateDto.pageSize }),
        },
      })
    }

    return flag
  }

  async getHomepageCarouselFlag() {
    let flag = await this.prisma.flagsHomepageCarousel.findFirst({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    if (!flag) {
      flag = await this.prisma.flagsHomepageCarousel.findFirst({
        orderBy: { order: 'asc' },
      })

      if (!flag) {
        flag = await this.prisma.flagsHomepageCarousel.create({
          data: {
            isActive: true,
            slides: [] as Prisma.InputJsonValue,
            order: 0,
          },
        })
      }
    }

    return flag
  }

  async getAllHomepageCarouselFlags() {
    const flags = await this.prisma.flagsHomepageCarousel.findMany({
      orderBy: { order: 'asc' },
    })

    if (flags.length === 0) {
      const defaultFlag = await this.prisma.flagsHomepageCarousel.create({
        data: {
          isActive: true,
          slides: [] as Prisma.InputJsonValue,
          order: 0,
        },
      })
      return [defaultFlag]
    }

    return flags
  }

  async updateHomepageCarouselFlag(id: string, updateDto: UpdateHomepageCarouselFlagDto) {
    const flag = await this.prisma.flagsHomepageCarousel.findUnique({
      where: { id },
    })

    if (!flag) {
      throw new NotFoundException('Flag de carrossel não encontrada')
    }

    const updatedFlag = await this.prisma.flagsHomepageCarousel.update({
      where: { id },
      data: {
        ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
        ...(updateDto.slides !== undefined && { slides: updateDto.slides as unknown as Prisma.InputJsonValue }),
        ...(updateDto.order !== undefined && { order: updateDto.order }),
      },
    })

    return updatedFlag
  }

  async createHomepageCarouselFlag(createDto: UpdateHomepageCarouselFlagDto) {
    const maxOrder = await this.prisma.flagsHomepageCarousel.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newFlag = await this.prisma.flagsHomepageCarousel.create({
      data: {
        isActive: createDto.isActive ?? true,
        slides: (createDto.slides ?? []) as unknown as Prisma.InputJsonValue,
        order: createDto.order ?? (maxOrder ? maxOrder.order + 1 : 0),
      },
    })

    return newFlag
  }

  async deleteHomepageCarouselFlag(id: string) {
    const flag = await this.prisma.flagsHomepageCarousel.findUnique({
      where: { id },
    })

    if (!flag) {
      throw new NotFoundException('Flag de carrossel não encontrada')
    }

    await this.prisma.flagsHomepageCarousel.delete({
      where: { id },
    })

    return { message: 'Flag de carrossel removida com sucesso' }
  }
}

