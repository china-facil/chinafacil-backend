import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class GoHighLevelService {
  private readonly logger = new Logger(GoHighLevelService.name)
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('GOHIGHLEVEL_API_KEY') || ''
    this.baseUrl =
      this.configService.get('GOHIGHLEVEL_BASE_URL') ||
      'https://rest.gohighlevel.com/v1'
  }

  async createOrUpdateContact(contactData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/contacts/`, contactData, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      )

      this.logger.log(`Contact created/updated: ${response.data.contact.id}`)

      return response.data
    } catch (error) {
      this.logger.error(`GoHighLevel create contact error: ${error.message}`)
      throw error
    }
  }

  async addTag(contactId: string, tags: string[]) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/contacts/${contactId}/tags`,
          { tags },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      )

      this.logger.log(`Tags added to contact: ${contactId}`)

      return response.data
    } catch (error) {
      this.logger.error(`GoHighLevel add tag error: ${error.message}`)
      throw error
    }
  }

  async removeTag(contactId: string, tags: string[]) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/contacts/${contactId}/tags`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          data: { tags },
        }),
      )

      this.logger.log(`Tags removed from contact: ${contactId}`)

      return response.data
    } catch (error) {
      this.logger.error(`GoHighLevel remove tag error: ${error.message}`)
      throw error
    }
  }

  async getContact(contactId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/contacts/${contactId}`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }),
      )

      return response.data
    } catch (error) {
      this.logger.error(`GoHighLevel get contact error: ${error.message}`)
      throw error
    }
  }
}

