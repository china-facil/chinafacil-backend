import { Command, CommandRunner, Option } from 'nest-commander'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

interface ClearProductCacheOptions {
  pattern?: string
  all?: boolean
}

@Command({
  name: 'clear-product-cache',
  description: 'Limpa o cache Redis de produtos e traduções',
})
export class ClearProductCacheCommand extends CommandRunner {
  private readonly logger = new Logger(ClearProductCacheCommand.name)
  private redis: Redis

  constructor(private readonly configService: ConfigService) {
    super()
  }

  async run(passedParams: string[], options?: ClearProductCacheOptions): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost'
    const redisPort = parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10)
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD')

    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      retryStrategy: () => null,
    })

    try {
      await this.redis.ping()
      this.logger.log(`Conectado ao Redis em ${redisHost}:${redisPort}`)
    } catch (error: any) {
      this.logger.error(`Erro ao conectar ao Redis: ${error.message}`)
      await this.redis.quit()
      return
    }

    try {
      if (options?.all) {
        await this.clearAllCache()
      } else if (options?.pattern) {
        await this.clearByPattern(options.pattern)
      } else {
        await this.clearProductCache()
      }
    } finally {
      await this.redis.quit()
    }
  }

  private async clearAllCache(): Promise<void> {
    this.logger.log('Limpando todo o cache Redis...')
    
    try {
      await this.redis.flushdb()
      this.logger.log('✅ Todo o cache Redis foi limpo com sucesso!')
    } catch (error: any) {
      this.logger.error(`Erro ao limpar todo o cache: ${error.message}`)
      throw error
    }
  }

  private async clearByPattern(pattern: string): Promise<void> {
    this.logger.log(`Limpando cache com padrão: ${pattern}`)
    
    try {
      const keys = await this.redis.keys(pattern)
      
      if (keys.length === 0) {
        this.logger.log(`Nenhuma chave encontrada com o padrão: ${pattern}`)
        return
      }

      if (keys.length > 0) {
        await this.redis.del(...keys)
        this.logger.log(`✅ Removidas ${keys.length} chaves do padrão: ${pattern}`)
      }
    } catch (error: any) {
      this.logger.error(`Erro ao limpar cache por padrão: ${error.message}`)
      throw error
    }
  }

  private async clearProductCache(): Promise<void> {
    this.logger.log('Limpando cache de produtos...')

    const patterns = [
      'popular_products:*',
      'products_category:*',
      'product_options:*',
      'product_details:*',
      'product_details_skul:*',
      'categories',
      'translation:*',
    ]

    let totalDeleted = 0

    for (const pattern of patterns) {
      try {
        const keys = await this.redis.keys(pattern)
        
        if (keys.length > 0) {
          await this.redis.del(...keys)
          this.logger.log(`  ✓ Removidas ${keys.length} chaves do padrão: ${pattern}`)
          totalDeleted += keys.length
        } else {
          this.logger.debug(`  - Nenhuma chave encontrada para: ${pattern}`)
        }
      } catch (error: any) {
        this.logger.warn(`  ⚠ Erro ao processar padrão ${pattern}: ${error.message}`)
      }
    }

    if (totalDeleted > 0) {
      this.logger.log(`\n✅ Cache de produtos limpo com sucesso! Total: ${totalDeleted} chaves removidas`)
    } else {
      this.logger.log('\n✅ Nenhuma chave de cache de produtos encontrada')
    }
  }

  @Option({
    flags: '-p, --pattern <pattern>',
    description: 'Padrão de chaves a serem removidas (ex: "product:*")',
  })
  parsePattern(val: string): string {
    return val
  }

  @Option({
    flags: '-a, --all',
    description: 'Limpar todo o cache Redis',
  })
  parseAll(): boolean {
    return true
  }
}


