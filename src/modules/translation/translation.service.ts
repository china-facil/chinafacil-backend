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
    const from = translateTextDto.from || 'zh-CN'
    const to = translateTextDto.to || 'pt'
    const cacheKey = `translation:${from}:${to}:${translateTextDto.text}`
    
    const cached = await this.cacheManager.get<any>(cacheKey)
    
    if (cached && cached.status === 'success' && cached.data?.translated_text) {
      this.logger.log(`Using cached translation for: ${translateTextDto.text.substring(0, 50)}...`)
      return cached
    }

    const translationResults = await this.googleTranslation.translate(
      translateTextDto.text,
      to,
      from,
    )

    const translatedText = Array.isArray(translationResults) 
      ? translationResults[0] 
      : translationResults

    const result = {
      status: 'success',
      data: {
        translated_text: translatedText,
        original_text: translateTextDto.text,
        from,
        to,
      },
    }

    await this.cacheManager.set(cacheKey, result, 86400000 * 7)

    return result
  }

  async translateTitles(titles: string[], from: string = 'zh-CN', to: string = 'pt') {
    if (!titles || titles.length === 0) {
      return {
        translated_titles: [],
        original_titles: [],
        from,
        to,
      }
    }

    const translatedTitles: string[] = []
    const originalTitles: string[] = []
    const toTranslate: string[] = []
    const indexMapping: Map<number, number> = new Map()

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i]
      originalTitles[i] = title || ''

      if (!title || title.trim() === '') {
        translatedTitles[i] = title || ''
        continue
      }

      const cacheKey = `translation:${from}:${to}:${title}`
      const cached = await this.cacheManager.get<any>(cacheKey)

      if (cached && cached.status === 'success' && cached.data?.translated_text) {
        translatedTitles[i] = cached.data.translated_text
      } else {
        indexMapping.set(toTranslate.length, i)
        toTranslate.push(title)
      }
    }

    if (toTranslate.length > 0) {
      try {
        const translations = await this.googleTranslation.translate(toTranslate, to, from)

        for (let i = 0; i < translations.length; i++) {
          const originalIndex = indexMapping.get(i)
          if (originalIndex !== undefined) {
            const translatedText = translations[i]
            translatedTitles[originalIndex] = translatedText
            
            const cacheKey = `translation:${from}:${to}:${toTranslate[i]}`
            const cacheValue = {
              status: 'success',
              data: {
                translated_text: translatedText,
                original_text: toTranslate[i],
                from,
                to,
              },
            }
            await this.cacheManager.set(cacheKey, cacheValue, 86400000 * 7)
          }
        }
      } catch (error) {
        this.logger.error(`Error translating titles: ${error.message}`)
        for (let i = 0; i < toTranslate.length; i++) {
          const originalIndex = indexMapping.get(i)
          if (originalIndex !== undefined) {
            translatedTitles[originalIndex] = toTranslate[i]
          }
        }
      }
    }

    return {
      translated_titles: translatedTitles,
      original_titles: originalTitles,
      from,
      to,
    }
  }

  async translateProduct(translateProductDto: TranslateProductDto) {
    const { product, from = 'zh-CN', to = 'pt' } = translateProductDto
    
    const titleTranslationResult = await this.translateText({
      text: product.title || '',
      from,
      to,
    })

    const descriptionTranslationResult = product.description
      ? await this.translateText({
          text: product.description,
          from,
          to,
        })
      : null

    return {
      ...product,
      titleTranslated: titleTranslationResult.data?.translated_text || null,
      descriptionTranslated: descriptionTranslationResult?.data?.translated_text || null,
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
