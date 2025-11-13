import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { AzureTranslatorService } from '../../integrations/translation/azure/azure-translator.service'
import { GoogleTranslationService } from '../../integrations/translation/google/google-translation.service'
import { TranslateProductDto, TranslateTextDto } from './dto'

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name)

  constructor(
    private readonly azureTranslator: AzureTranslatorService,
    private readonly googleTranslation: GoogleTranslationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async translateText(translateTextDto: TranslateTextDto) {
    const cacheKey = `translation:${translateTextDto.from || 'auto'}:${translateTextDto.to}:${translateTextDto.text}`
    
    const cached = await this.cacheManager.get(cacheKey)
    if (cached) {
      this.logger.log(`Using cached translation for: ${translateTextDto.text}`)
      return cached
    }

    let result

    if (translateTextDto.provider === 'azure') {
      result = await this.azureTranslator.translateText(
        translateTextDto.text,
        translateTextDto.from || 'auto',
        translateTextDto.to,
      )
    } else {
      result = await this.googleTranslation.translate(
        translateTextDto.text,
        translateTextDto.to,
        translateTextDto.from,
      )
    }

    await this.cacheManager.set(cacheKey, result, 86400000)

    return result
  }

  async translateTitles(titles: string[], from: string, to: string) {
    const promises = titles.map((title) =>
      this.translateText({ text: title, from, to }),
    )

    return Promise.all(promises)
  }

  async translateProduct(translateProductDto: TranslateProductDto) {
    const { product, from = 'zh', to = 'pt' } = translateProductDto
    
    const titleTranslation = await this.translateText({
      text: product.title || '',
      from,
      to,
    })

    const descriptionTranslation = product.description
      ? await this.translateText({
          text: product.description,
          from,
          to,
        })
      : null

    return {
      ...product,
      titleTranslated: Array.isArray(titleTranslation)
        ? titleTranslation[0]
        : titleTranslation,
      descriptionTranslated: descriptionTranslation
        ? Array.isArray(descriptionTranslation)
          ? descriptionTranslation[0]
          : descriptionTranslation
        : null,
    }
  }

  async detectLanguage(text: string, provider: 'azure' | 'google' = 'google') {
    if (provider === 'azure') {
      return this.azureTranslator.detectLanguage(text)
    }
    return this.googleTranslation.detectLanguage(text)
  }

  async detectChinese(text: string) {
    const detection = await this.detectLanguage(text)
    
    const chineseLanguages = ['zh', 'zh-CN', 'zh-TW', 'zh-Hans', 'zh-Hant']
    const detectedLanguage = detection.language || detection.languageCode
    
    return {
      isChinese: chineseLanguages.includes(detectedLanguage),
      detectedLanguage,
      confidence: detection.confidence || 1,
    }
  }

  async clearCache() {
    await this.cacheManager.reset()
    return { message: 'Cache de traduções limpo' }
  }
}


