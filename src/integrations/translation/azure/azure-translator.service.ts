import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class AzureTranslatorService {
  private readonly logger = new Logger(AzureTranslatorService.name)
  private readonly apiKey: string
  private readonly endpoint: string
  private readonly region: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('AZURE_TRANSLATOR_KEY') || ''
    this.endpoint =
      this.configService.get('AZURE_TRANSLATOR_ENDPOINT') ||
      'https://api.cognitive.microsofttranslator.com'
    this.region = this.configService.get('AZURE_TRANSLATOR_REGION') || 'eastus'
  }

  async translateText(
    text: string | string[],
    from: string,
    to: string,
  ): Promise<any> {
    try {
      const url = `${this.endpoint}/translate`
      const texts = Array.isArray(text) ? text : [text]

      const response = await firstValueFrom(
        this.httpService.post(
          url,
          texts.map((t) => ({ text: t })),
          {
            params: {
              'api-version': '3.0',
              from,
              to,
            },
            headers: {
              'Ocp-Apim-Subscription-Key': this.apiKey,
              'Ocp-Apim-Subscription-Region': this.region,
              'Content-Type': 'application/json',
            },
          },
        ),
      )

      return response.data
    } catch (error) {
      this.logger.error(`Azure translation error: ${error.message}`)
      throw error
    }
  }

  async detectLanguage(text: string): Promise<any> {
    try {
      const url = `${this.endpoint}/detect`

      const response = await firstValueFrom(
        this.httpService.post(url, [{ text }], {
          params: {
            'api-version': '3.0',
          },
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Ocp-Apim-Subscription-Region': this.region,
            'Content-Type': 'application/json',
          },
        }),
      )

      return response.data[0]
    } catch (error) {
      this.logger.error(`Azure detect language error: ${error.message}`)
      throw error
    }
  }
}


