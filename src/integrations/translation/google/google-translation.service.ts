import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TranslationServiceClient } from '@google-cloud/translate'
import * as path from 'path'

@Injectable()
export class GoogleTranslationService implements OnModuleInit {
  private readonly logger = new Logger(GoogleTranslationService.name)
  private translateClient: TranslationServiceClient | null = null
  private projectId = 'china-facil-web'
  private location = 'global'

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const credentialsPath = path.join(process.cwd(), 'google_credentials.json')
      
      this.translateClient = new TranslationServiceClient({
        keyFilename: credentialsPath,
      })
      
      this.logger.log('Google Cloud Translation V3 inicializado com sucesso')
    } catch (error) {
      this.logger.error(`Erro ao inicializar Google Translation: ${error.message}`)
    }
  }

  isAvailable(): boolean {
    return this.translateClient !== null
  }

  async translate(
    text: string | string[],
    targetLanguage: string,
    sourceLanguage?: string,
  ): Promise<string[]> {
    if (!this.translateClient) {
      throw new Error('Google Translation não está configurado')
    }

    try {
      const texts = Array.isArray(text) ? text : [text]
      const parent = `projects/${this.projectId}/locations/${this.location}`

      const [response] = await this.translateClient.translateText({
        parent,
        contents: texts,
        sourceLanguageCode: sourceLanguage || 'zh-CN',
        targetLanguageCode: targetLanguage,
      })

      const translations = response.translations || []
      return translations.map((t) => t.translatedText || '')
    } catch (error) {
      this.logger.error(`Google translation error: ${error.message}`)
      throw error
    }
  }

  async detectLanguage(text: string): Promise<any> {
    if (!this.translateClient) {
      throw new Error('Google Translation não está configurado')
    }

    try {
      const parent = `projects/${this.projectId}/locations/${this.location}`

      const [response] = await this.translateClient.detectLanguage({
        parent,
        content: text,
      })

      const languages = response.languages || []
      if (languages.length > 0) {
        return {
          language: languages[0].languageCode,
          confidence: languages[0].confidence,
        }
      }

      return { language: 'unknown', confidence: 0 }
    } catch (error) {
      this.logger.error(`Google detect language error: ${error.message}`)
      throw error
    }
  }

  async getSupportedLanguages(): Promise<any> {
    if (!this.translateClient) {
      throw new Error('Google Translation não está configurado')
    }

    try {
      const parent = `projects/${this.projectId}/locations/${this.location}`

      const [response] = await this.translateClient.getSupportedLanguages({
        parent,
      })

      return response.languages || []
    } catch (error) {
      this.logger.error(`Google get languages error: ${error.message}`)
      throw error
    }
  }
}
