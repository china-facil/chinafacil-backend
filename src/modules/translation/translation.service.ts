import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { GoogleTranslationService } from '../../integrations/translation/google/google-translation.service'
import { TranslateProductDto, TranslateTextDto } from './dto'

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name)

  constructor(
    private readonly googleTranslation: GoogleTranslationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async translateText(translateTextDto: TranslateTextDto) {
    const cacheKey = `translation:${translateTextDto.from || 'zh-CN'}:${translateTextDto.to}:${translateTextDto.text}`
    
    const cached = await this.cacheManager.get(cacheKey)
    if (cached) {
      this.logger.log(`Using cached translation for: ${translateTextDto.text.substring(0, 50)}...`)
      return cached
    }

    const result = await this.googleTranslation.translate(
      translateTextDto.text,
      translateTextDto.to,
      translateTextDto.from || 'zh-CN',
    )

    await this.cacheManager.set(cacheKey, result, 86400000 * 7)

    return result
  }

  async translateTitles(titles: string[], from: string = 'zh-CN', to: string = 'pt') {
    if (!titles || titles.length === 0) {
      return []
    }

    const results: string[] = []
    const toTranslate: string[] = []
    const indexMapping: Map<number, number> = new Map()

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i]
      if (!title || title.trim() === '') {
        results[i] = title
        continue
      }

      const cacheKey = `translation:${from}:${to}:${title}`
      const cached = await this.cacheManager.get<string>(cacheKey)

      if (cached) {
        results[i] = cached
      } else {
        indexMapping.set(toTranslate.length, i)
        toTranslate.push(title)
      }
    }

    if (toTranslate.length === 0) {
      return results
    }

    try {
      const translations = await this.googleTranslation.translate(toTranslate, to, from)

      for (let i = 0; i < translations.length; i++) {
        const originalIndex = indexMapping.get(i)
        if (originalIndex !== undefined) {
          results[originalIndex] = translations[i]
          
          const cacheKey = `translation:${from}:${to}:${toTranslate[i]}`
          await this.cacheManager.set(cacheKey, translations[i], 86400000 * 7)
        }
      }
    } catch (error) {
      this.logger.error(`Error translating titles: ${error.message}`)
      for (let i = 0; i < toTranslate.length; i++) {
        const originalIndex = indexMapping.get(i)
        if (originalIndex !== undefined) {
          results[originalIndex] = toTranslate[i]
        }
      }
    }

    return results
  }

  async translateProduct(translateProductDto: TranslateProductDto) {
    const { product, from = 'zh-CN', to = 'pt' } = translateProductDto
    
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

  async detectLanguage(text: string) {
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
