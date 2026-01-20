import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'

@Injectable()
export class SolicitationTrackingService {
  private readonly orderProcess = {
    step1: {
      order_received: 'Pedido recebido',
      analyzing_costs_logistics: 'Analisando custos e logística',
      awaiting_customer_approval: 'Aguardando aprovação do cliente',
      awaiting_payment: 'Aguardando pagamento',
    },
    step2: {
      order_confirmed: 'Pedido confirmado',
      in_production_separation: 'Em produção / Separação',
      order_ready_for_shipment: 'Pedido pronto para embarque',
      awaiting_shipping_reservation: 'Aguardando reserva para envio',
      preparing_for_shipment: 'Em preparação para embarque',
    },
    step3: {
      shipped: 'Embarcado',
      pending_taxes_fees: 'Taxas e impostos pendentes (opcional)',
      arrived_in_brazil: 'Chegou ao Brasil',
      awaiting_customs_clearance: 'Aguardando liberação na alfândega',
    },
    step4: {
      customs_cleared: 'Liberado pela alfândega',
      in_transit_to_final_destination: 'Em transporte para destino final',
      order_delivered: 'Pedido entregue',
    },
  }

  private readonly orderStatusValue = {
    'step1:order_received': 0,
    'step1:analyzing_costs_logistics': 1,
    'step1:awaiting_customer_approval': 2,
    'step1:awaiting_payment': 3,
    'step2:order_confirmed': 4,
    'step2:in_production_separation': 5,
    'step2:order_ready_for_shipment': 6,
    'step2:awaiting_shipping_reservation': 7,
    'step2:preparing_for_shipment': 8,
    'step3:shipped': 9,
    'step3:pending_taxes_fees': 10,
    'step3:arrived_in_brazil': 11,
    'step3:awaiting_customs_clearance': 12,
    'step4:customs_cleared': 13,
    'step4:in_transit_to_final_destination': 14,
    'step4:order_delivered': 15,
  }

  constructor(private readonly prisma: PrismaService) {}

  async getTrackingStatus(solicitationId: string) {
    const lastTrack = await this.prisma.solicitationTrack.findFirst({
      where: { solicitationId },
      orderBy: { createdAt: 'desc' },
    })

    if (!lastTrack) {
      throw new NotFoundException('Nenhum rastreamento encontrado para esta solicitação')
    }

    const actualStepKey = this.orderStatusValue[lastTrack.status as keyof typeof this.orderStatusValue]
    const availableSteps = Object.fromEntries(
      Object.entries(this.orderStatusValue).filter(([_, value]) => value > actualStepKey)
    )

    return {
      steps: this.orderProcess,
      avaliable_steps: availableSteps,
      steps_values: this.orderStatusValue,
    }
  }

  async getStatusSolicitation(solicitationId: string) {
    const tracks = await this.prisma.solicitationTrack.findMany({
      where: { solicitationId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return tracks.map(track => {
      const [step, status] = track.status.split(':')
      const orderProcess = this.orderProcess as any
      return {
        complete_status: track.status,
        step,
        status,
        status_text: orderProcess[step]?.[status] || track.status,
        start_date: track.createdAt,
        end_date: track.deadline,
        created_at: track.createdAt,
        user_role: track.user?.role || null,
        user_name: track.user?.name || null,
      }
    })
  }

  async addStatusSolicitation(solicitationId: string, userId: string, status: string, timeDate?: Date) {
    const lastTrack = await this.prisma.solicitationTrack.findFirst({
      where: { solicitationId },
      orderBy: { createdAt: 'desc' },
    })

    const statusValue = this.orderStatusValue as Record<string, number>
    
    if (lastTrack && statusValue[status] <= statusValue[lastTrack.status]) {
      throw new BadRequestException('Não é possível retornar a uma etapa anterior')
    }

    const newTrack = await this.prisma.solicitationTrack.create({
      data: {
        userId,
        solicitationId,
        status,
        deadline: timeDate || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    const [step, statusKey] = newTrack.status.split(':')
    const orderProcess = this.orderProcess as any
    
    return [{
      complete_status: newTrack.status,
      step,
      status: statusKey,
      status_text: orderProcess[step]?.[statusKey] || newTrack.status,
      start_date: newTrack.createdAt,
      end_date: newTrack.deadline,
      created_at: newTrack.createdAt,
      user_role: newTrack.user?.role || null,
      user_name: newTrack.user?.name || null,
    }]
  }
}

