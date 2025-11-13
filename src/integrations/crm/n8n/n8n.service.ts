import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class N8NService {
  private readonly logger = new Logger(N8NService.name)
  private readonly webhookUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webhookUrl = this.configService.get('N8N_WEBHOOK_URL') || ''
  }

  async triggerWebhook(data: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.webhookUrl, data, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )

      this.logger.log(`N8N webhook triggered successfully`)

      return response.data
    } catch (error) {
      this.logger.error(`N8N webhook error: ${error.message}`)
      throw error
    }
  }

  async sendLeadToN8N(leadData: any) {
    return this.triggerWebhook({
      type: 'lead',
      data: leadData,
    })
  }

  async sendSolicitationToN8N(solicitationData: any) {
    return this.triggerWebhook({
      type: 'solicitation',
      data: solicitationData,
    })
  }

  async sendCustomEvent(eventName: string, eventData: any) {
    return this.triggerWebhook({
      type: 'custom',
      event: eventName,
      data: eventData,
    })
  }
}


