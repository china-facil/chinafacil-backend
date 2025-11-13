import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Translate } from '@google-cloud/translate/build/src/v2'

@Injectable()
export class GoogleTranslationService {
  private readonly logger = new Logger(GoogleTranslationService.name)
  private translateClient: Translate

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('GOOGLE_TRANSLATE_API_KEY')
    
    if (apiKey) {
      this.translateClient = new Translate({
        key: apiKey,
      })
    }
  }

  async translate(
    text: string | string[],
    targetLanguage: string,
    sourceLanguage?: string,
  ): Promise<any> {
    try {
      const options: any = { to: targetLanguage }
      if (sourceLanguage) {
        options.from = sourceLanguage
      }

      const textArray = Array.isArray(text) ? text : [text]
      const [translations] = await this.translateClient.translate(textArray, options)
      
      return Array.isArray(translations) ? translations : [translations]
    } catch (error) {
      this.logger.error(`Google translation error: ${error.message}`)
      throw error
    }
  }

  async detectLanguage(text: string): Promise<any> {
    try {
      const [detection] = await this.translateClient.detect(text)
      return detection
    } catch (error) {
      this.logger.error(`Google detect language error: ${error.message}`)
      throw error
    }
  }

  async getSupportedLanguages(): Promise<any> {
    try {
      const [languages] = await this.translateClient.getLanguages()
      return languages
    } catch (error) {
      this.logger.error(`Google get languages error: ${error.message}`)
      throw error
    }
  }
}


