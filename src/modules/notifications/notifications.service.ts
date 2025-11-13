import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateNotificationDto, FilterNotificationDto } from './dto'

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
    })

    return notification
  }

  async findByUser(userId: string, filterDto: FilterNotificationDto) {
    const { read, page, limit } = filterDto

    const skip = (page - 1) * limit
    const take = limit

    const where: any = { userId }

    if (read !== undefined) {
      if (read) {
        where.readAt = { not: null }
      } else {
        where.readAt = null
      }
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          userId,
          readAt: null,
        },
      }),
    ])

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    }
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    })

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notificação não encontrada')
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
    })

    return updatedNotification
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })

    return {
      message: 'Todas as notificações foram marcadas como lidas',
    }
  }

  async markAllAsUnread(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: { not: null },
      },
      data: {
        readAt: null,
      },
    })

    return {
      message: 'Todas as notificações foram marcadas como não lidas',
    }
  }

  async deleteAll(userId: string) {
    await this.prisma.notification.deleteMany({
      where: { userId },
    })

    return {
      message: 'Todas as notificações foram removidas',
    }
  }
}


