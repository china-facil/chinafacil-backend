import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { AdminActionType } from '@prisma/client'
import { FilterAdminLogDto } from './dto'

@Injectable()
export class AdminLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(
    adminId: string,
    action: AdminActionType,
    resource: string,
  ) {
    return this.prisma.adminLog.create({
      data: {
        adminId,
        action,
        resource,
      },
    })
  }

  async findAll(filterDto: FilterAdminLogDto) {
    const {
      search,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filterDto

    const skip = (page - 1) * limit
    const take = limit

    const where: any = {}

    if (action) {
      where.action = action
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDateTime
      }
    }

    if (search) {
      where.OR = [
        { admin: { name: { contains: search } } },
        { admin: { email: { contains: search } } },
        { resource: { contains: search } },
      ]
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminLog.findMany({
        where,
        skip,
        take,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.adminLog.count({ where }),
    ])

    return {
      data: logs.map((log) => ({
        id: log.id,
        adminName: log.admin.name,
        adminEmail: log.admin.email,
        action: log.action,
        resource: log.resource,
        createdAt: log.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}

