import { Injectable, Logger } from '@nestjs/common'
import { SolicitationStatus, SubscriptionStatus } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name)
  
  constructor(private readonly prisma: PrismaService) {}

  async getTotalClientsByPlan() {
    try {
      const plans = await this.prisma.$queryRaw<Array<{ plan: string; total: bigint }>>`
        SELECT 
          c.name as plan,
          COUNT(s.id) as total
        FROM clients c
        LEFT JOIN subscriptions s ON s.plan_id = c.id AND s.status = 'active'
        WHERE c.deleted_at IS NULL
        GROUP BY c.id, c.name
        ORDER BY CASE 
          WHEN UPPER(c.name) = 'SILVER' THEN 1
          WHEN UPPER(c.name) = 'GOLD' THEN 2
          WHEN UPPER(c.name) = 'BLACK' THEN 3
          WHEN UPPER(c.name) = 'PLATINUM' THEN 4
          ELSE 5
        END
      `

      this.logger.log(`Plans found: ${JSON.stringify(plans)}`)

      if (!plans || plans.length === 0) {
        return {
          status: 'success',
          data: {
            series: [0, 0, 0, 0],
            categories: ['Silver', 'Gold', 'Black', 'Platinum'],
          },
        }
      }

      const response = {
        series: plans.map(p => Number(p.total)),
        categories: plans.map(p => p.plan),
      }

      return {
        status: 'success',
        data: response,
      }
    } catch (error) {
      this.logger.error(`Error getting clients by plan: ${error.message}`)
      return {
        status: 'success',
        data: {
          series: [0, 0, 0, 0],
          categories: ['Silver', 'Gold', 'Black', 'Platinum'],
        },
      }
    }
  }

  async getMonthlyMetricsChart(metric: string = 'revenue') {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    const series: number[] = []
    const categories: string[] = []

    for (let month = 1; month <= currentMonth; month++) {
      const startDate = new Date(currentYear, month - 1, 1)
      const endDate = new Date(currentYear, month, 0, 23, 59, 59)

      let value = 0

      switch (metric) {
        case 'revenue':
          const solicitationsWithCart = await this.prisma.solicitation.findMany({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              cart: { isNot: null },
            },
            include: {
              cart: true,
            },
          })
          value = this.calculateCartTotal(solicitationsWithCart)
          break

        case 'leads':
          value = await this.prisma.user.count({
            where: {
              role: 'lead',
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          break

        case 'clients':
          value = await this.prisma.user.count({
            where: {
              role: 'client',
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          break

        case 'solicitations':
          value = await this.prisma.solicitation.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          break

        default:
          value = 0
      }

      series.push(Math.round(value * 100) / 100)
      categories.push(monthNames[month - 1])
    }

    return {
      status: 'success',
      data: {
        series,
        categories,
      },
    }
  }

  private calculateCartTotal(solicitationsWithCart: any[]): number {
    let total = 0
    this.logger.log(`Processing ${solicitationsWithCart.length} solicitations with cart`)
    
    for (const solicitation of solicitationsWithCart) {
      if (!solicitation.cart?.items) {
        this.logger.log(`Solicitation ${solicitation.id} has no cart items`)
        continue
      }
      
      let items = solicitation.cart.items
      
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items)
        } catch (e) {
          this.logger.error(`Failed to parse items for solicitation ${solicitation.id}`)
          continue
        }
      }
      
      if (!Array.isArray(items)) {
        this.logger.log(`Items is not an array for solicitation ${solicitation.id}, type: ${typeof items}`)
        continue
      }
      
      for (const item of items) {
        if (item.variations && Array.isArray(item.variations)) {
          for (const variation of item.variations) {
            const price = parseFloat(variation.price || 0)
            const quantity = parseFloat(variation.quantity || 0)
            total += price * quantity
          }
        }
      }
    }
    
    this.logger.log(`Total calculated: ${total}`)
    return total
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
      totalRevenueSubscriptions,
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
            in: [SolicitationStatus.open, SolicitationStatus.in_progress],
          },
        },
      }),
      this.prisma.solicitation.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: SolicitationStatus.finished,
        },
      }),
      this.prisma.subscription.findMany({
        where: {
          currentPeriodStart: {
            gte: startDate,
            lt: endDate,
          },
          status: SubscriptionStatus.active,
        },
        include: {
          client: {
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

    const totalRevenue = totalRevenueSubscriptions.reduce((sum, sub) => {
      return sum + (sub.price ? Number(sub.price) : 0)
    }, 0)

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
      totalRevenue,
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
          status: SolicitationStatus.open,
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: SubscriptionStatus.active,
        },
      }),
      this.prisma.plan.count({
        where: {
          deletedAt: null,
        },
      }),
    ])

    const validUserIds = await this.prisma.user.findMany({
      select: { id: true },
    });
    const validUserIdSet = new Set(validUserIds.map((u) => u.id));

    const allSolicitations = await this.prisma.solicitation.findMany({
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    });

    const validSolicitations = allSolicitations.filter((s) => validUserIdSet.has(s.userId));

    const recentSolicitations = await Promise.all(
      validSolicitations.slice(0, 5).map(async (solicitation) => {
        const user = await this.prisma.user.findUnique({
          where: { id: solicitation.userId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
        return {
          ...solicitation,
          user,
        };
      })
    );

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


