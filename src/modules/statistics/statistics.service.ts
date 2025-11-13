import { Injectable } from '@nestjs/common'
import { SolicitationStatus, SubscriptionStatus } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTotalClientsByPlan() {
    const subscriptions = await this.prisma.subscription.groupBy({
      by: ['planId'],
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
      _count: {
        id: true,
      },
    })

    const result = await Promise.all(
      subscriptions.map(async (sub) => {
        const plan = await this.prisma.plan.findUnique({
          where: { id: sub.planId },
          select: {
            id: true,
            name: true,
            price: true,
          },
        })

        return {
          plan,
          count: sub._count.id,
        }
      }),
    )

    return result
  }

  async getMonthlyMetrics(year?: number, month?: number) {
    const currentDate = new Date()
    const targetYear = year || currentDate.getFullYear()
    const targetMonth = month || currentDate.getMonth() + 1

    const startDate = new Date(targetYear, targetMonth - 1, 1)
    const endDate = new Date(targetYear, targetMonth, 1)

    const [
      newUsers,
      newSolicitations,
      activeSolicitations,
      completedSolicitations,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      this.prisma.solicitation.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      this.prisma.solicitation.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: {
            in: [SolicitationStatus.OPEN, SolicitationStatus.IN_PROGRESS],
          },
        },
      }),
      this.prisma.solicitation.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: SolicitationStatus.COMPLETED,
        },
      }),
      this.prisma.subscription.aggregate({
        where: {
          startedAt: {
            gte: startDate,
            lt: endDate,
          },
          status: SubscriptionStatus.ACTIVE,
        },
        _sum: {
          plan: {
            select: {
              price: true,
            },
          },
        },
      }),
    ])

    const conversionRate =
      newSolicitations > 0
        ? (completedSolicitations / newSolicitations) * 100
        : 0

    return {
      period: {
        year: targetYear,
        month: targetMonth,
      },
      newUsers,
      newSolicitations,
      activeSolicitations,
      completedSolicitations,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      totalRevenue: 0,
    }
  }

  async getAdminDashboardStatistics() {
    const [
      totalUsers,
      totalClients,
      totalSolicitations,
      openSolicitations,
      activeSubscriptions,
      totalPlans,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.client.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prisma.solicitation.count(),
      this.prisma.solicitation.count({
        where: {
          status: SolicitationStatus.OPEN,
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: SubscriptionStatus.ACTIVE,
        },
      }),
      this.prisma.plan.count({
        where: {
          isActive: true,
        },
      }),
    ])

    const recentSolicitations = await this.prisma.solicitation.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return {
      totals: {
        users: totalUsers,
        clients: totalClients,
        solicitations: totalSolicitations,
        openSolicitations,
        activeSubscriptions,
        plans: totalPlans,
      },
      recentSolicitations,
    }
  }

  async getSolicitationsByStatus() {
    const statusCounts = await this.prisma.solicitation.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    return statusCounts.map((item) => ({
      status: item.status,
      count: item._count.id,
    }))
  }

  async getUserGrowth(months: number = 6) {
    const result = []
    const currentDate = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      )
      const nextDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i + 1,
        1,
      )

      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      result.push({
        month: date.toISOString().slice(0, 7),
        count,
      })
    }

    return result
  }
}


