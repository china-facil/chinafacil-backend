import { Command, CommandRunner, Option } from 'nest-commander'
import { Logger } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

interface PopulateCnpjDataOptions {
  delay?: number
}

@Command({
  name: 'populate-cnpj-data',
  description: 'Busca dados de CNPJ e atualiza informações de empresa dos usuários',
})
export class PopulateCnpjDataCommand extends CommandRunner {
  private readonly logger = new Logger(PopulateCnpjDataCommand.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super()
  }

  async run(passedParams: string[], options?: PopulateCnpjDataOptions): Promise<void> {
    const delay = options?.delay || 10000

    this.logger.log('Buscando usuários com CNPJ sem dados de empresa...')

    const users = await this.prisma.user.findMany({
      where: {
        cnpj: { not: null },
        companyData: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cnpj: true,
      },
    })

    if (users.length === 0) {
      this.logger.log('Nenhum usuário encontrado com CNPJ sem dados de empresa.')
      return
    }

    this.logger.log(`Encontrados ${users.length} usuários para processar`)

    let processedCount = 0
    let errorCount = 0

    for (const user of users) {
      if (!user.cnpj) {
        continue
      }

      try {
        this.logger.log(`Processando CNPJ: ${user.cnpj} (${user.name})`)

        const companyData = await this.buscarCnpj(user.cnpj)

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            companyData: companyData as any,
          },
        })

        this.logger.log(`  ✅ Dados atualizados para ${user.name}`)
        processedCount++

        if (delay > 0 && processedCount < users.length) {
          this.logger.debug(`  Aguardando ${delay / 1000}s antes do próximo...`)
          await this.sleep(delay)
        }
      } catch (error: any) {
        errorCount++
        this.logger.error(
          `  ❌ Erro ao buscar dados do CNPJ ${user.cnpj}: ${error.message}`,
        )
      }
    }

    this.logger.log(`\n✅ Processamento concluído!`)
    this.logger.log(`   - Processados com sucesso: ${processedCount}`)
    this.logger.log(`   - Erros: ${errorCount}`)
  }

  private async buscarCnpj(cnpj: string): Promise<any> {
    const cnpjLimpo = cnpj.replace(/\D/g, '')

    const apiUrl = this.configService.get<string>('CNPJ_API_URL')
    const apiKey = this.configService.get<string>('CNPJ_API_KEY')

    if (!apiUrl || !apiKey) {
      throw new Error('CNPJ_API_URL e CNPJ_API_KEY devem estar configuradas')
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/${cnpjLimpo}`, {
          headers: {
            Authorization: apiKey,
          },
        }),
      )

      if (response.status === 200 && response.data) {
        return response.data
      }

      throw new Error(`Erro ao consultar CNPJ: Status ${response.status}`)
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Erro ao consultar CNPJ: ${error.response.status} - ${error.response.statusText}`,
        )
      }
      throw new Error(`Erro ao consultar CNPJ: ${error.message}`)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  @Option({
    flags: '-d, --delay <delay>',
    description: 'Delay em milissegundos entre requisições (padrão: 10000)',
    defaultValue: 10000,
  })
  parseDelay(val: string): number {
    return parseInt(val, 10)
  }
}

