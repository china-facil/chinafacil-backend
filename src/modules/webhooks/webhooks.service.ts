import { Injectable, Logger } from '@nestjs/common'
import { LeadOrigin, LeadStatus } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { GenericWebhookDto, TypeformWebhookDto } from './dto'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(private readonly prisma: PrismaService) {}

  async handleTypeformWebhook(typeformWebhookDto: TypeformWebhookDto) {
    try {
      const { form_response } = typeformWebhookDto
      const answers = form_response.answers || []

      const extractAnswer = (field: string) => {
        const answer = answers.find((a: any) => a.field?.ref === field)
        return answer?.text || answer?.email || answer?.phone_number || ''
      }

      const name = extractAnswer('name') || 'Lead Typeform'
      const email = extractAnswer('email')
      const phone = extractAnswer('phone')
      const company = extractAnswer('company')

      if (email) {
        const lead = await this.prisma.lead.upsert({
          where: { email },
          update: {
            name,
            phone,
            company,
            status: LeadStatus.NEW,
            metadata: form_response,
          },
          create: {
            name,
            email,
            phone,
            company,
            origin: LeadOrigin.TYPEFORM,
            status: LeadStatus.NEW,
            metadata: form_response,
          },
        })

        this.logger.log(`Typeform lead created/updated: ${lead.id}`)

        return {
          success: true,
          leadId: lead.id,
        }
      }

      return {
        success: false,
        message: 'Email not found in form response',
      }
    } catch (error) {
      this.logger.error(`Typeform webhook error: ${error.message}`)
      throw error
    }
  }

  async handleGenericWebhook(genericWebhookDto: GenericWebhookDto) {
    try {
      const webhookLog = await this.prisma.webhookLog.create({
        data: {
          event: genericWebhookDto.source || 'generic',
          source: genericWebhookDto.source,
          payload: genericWebhookDto.payload,
          status: 'processed',
          processedAt: new Date(),
        },
      })

      this.logger.log(`Generic webhook logged: ${webhookLog.id}`)

      return {
        success: true,
        logId: webhookLog.id,
      }
    } catch (error) {
      this.logger.error(`Generic webhook error: ${error.message}`)
      throw error
    }
  }

  async getWebhookLogs(limit: number = 50) {
    const logs = await this.prisma.webhookLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return logs
  }
}


