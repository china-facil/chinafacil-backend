import { Injectable, Logger } from '@nestjs/common'
import { GenericWebhookDto, TypeformWebhookDto } from './dto'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

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
        this.logger.log(`Typeform webhook received for: ${email}`)

        return {
          success: true,
          message: 'Webhook processado com sucesso',
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
      const source = genericWebhookDto.source || 'generic'
      this.logger.log(`Generic webhook received from: ${source}`)

      return {
        success: true,
        message: 'Webhook processado com sucesso',
      }
    } catch (error) {
      this.logger.error(`Generic webhook error: ${error.message}`)
      throw error
    }
  }

  async getWebhookLogs(limit: number = 50) {
    return []
  }
}


