import { Injectable, Logger } from '@nestjs/common'
import { GoHighLevelService } from '../../integrations/crm/gohighlevel/gohighlevel.service'
import { GenericWebhookDto, TypeformWebhookDto } from './dto'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(private readonly goHighLevelService: GoHighLevelService) {}

  private extractFieldValue(answer: any): string {
    if (!answer) return ''

    if (answer.type === 'text') {
      return answer.text || ''
    }

    if (answer.type === 'email') {
      return answer.email || ''
    }

    if (answer.type === 'phone_number') {
      return answer.phone_number || ''
    }

    if (answer.type === 'choice') {
      return answer.choice?.label || ''
    }

    if (answer.type === 'choices') {
      return answer.choices?.labels?.join(', ') || ''
    }

    return ''
  }

  private extractContactData(typeformWebhookDto: TypeformWebhookDto): {
    firstName?: string
    email?: string
    phone?: string
    customFields?: Record<string, any>
  } | null {
    try {
      const { form_response } = typeformWebhookDto
      const answers = form_response.answers || []

      const fieldMapping: Record<string, string> = {
        '6eebffe1-0eb8-4380-a3b1-c03451d2948b': 'firstName',
        '8210b17e-f183-4992-9771-a85e7e81c451': 'email',
        'c4fde505-cee8-4aa5-bbe7-8fba3f335a5c': 'phone',
        '4e172388-2217-47d7-aae7-5270d9d2886f': 'company_name',
        '314f57e4-9d1f-42fe-94ba-33ccd99dc477': 'products_interest',
        'b51761cd-ccec-464d-a664-03f7985df387': 'monthly_revenue',
        '2023937b-1fb3-4ee8-a3fb-ec0cb74ad009': 'investment_available',
        '4acfca40-bc76-4e67-9dcd-31c363b41dea': 'contact_preference',
      }

      const contactData: any = {}
      const customFields: Record<string, any> = {}

      for (const answer of answers) {
        const fieldRef = answer.field?.ref
        if (!fieldRef || !fieldMapping[fieldRef]) continue

        const value = this.extractFieldValue(answer)
        if (!value) continue

        const mappedField = fieldMapping[fieldRef]

        if (['firstName', 'email', 'phone'].includes(mappedField)) {
          contactData[mappedField] = value
        } else {
          customFields[mappedField] = value
        }
      }

      if (!contactData.firstName && !contactData.email && !contactData.phone) {
        return null
      }

      if (Object.keys(customFields).length > 0) {
        contactData.customFields = customFields
      }

      return contactData
    } catch (error) {
      this.logger.error(`Error extracting contact data: ${error.message}`)
      return null
    }
  }

  async handleTypeformWebhook(typeformWebhookDto: TypeformWebhookDto) {
    try {
      const contactData = this.extractContactData(typeformWebhookDto)

      if (!contactData) {
        this.logger.warn('⚠️ Invalid contact data from Typeform webhook')
        return {
          success: false,
          message: 'Invalid contact data',
        }
      }

      this.logger.log(`📥 Typeform webhook received for: ${contactData.email || contactData.phone}`)

      const mappedCustomFields = contactData.customFields
        ? this.goHighLevelService.mapCustomFields(contactData.customFields)
        : undefined

      const result = await this.goHighLevelService.createOrUpdateContact({
        firstName: contactData.firstName,
        email: contactData.email,
        phone: contactData.phone,
        tags: ['lead-importação-typeform'],
        customFields: mappedCustomFields,
      })

      if (result.success) {
        this.logger.log(`✅ Contact ${result.action || 'created/updated'}: ${result.contact_id}`)
        return {
          success: true,
          message: 'Webhook processado com sucesso',
          contact_id: result.contact_id,
        }
      } else {
        this.logger.error(`❌ Failed to create/update contact: ${result.error}`)
        return {
          success: false,
          message: result.error || 'Erro ao processar contato no GoHighLevel',
        }
      }
    } catch (error) {
      this.logger.error(`❌ Typeform webhook error: ${error.message}`)
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
