import { Command, CommandRunner, Option } from 'nest-commander'
import { Logger } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

interface CleanupTempImagesOptions {
  hours?: number
  directory?: string
}

@Command({
  name: 'cleanup-temp-images',
  description: 'Remove imagens temporárias antigas do diretório de storage',
})
export class CleanupTempImagesCommand extends CommandRunner {
  private readonly logger = new Logger(CleanupTempImagesCommand.name)

  async run(passedParams: string[], options?: CleanupTempImagesOptions): Promise<void> {
    const hours = options?.hours || 24
    const directory = options?.directory || path.join(process.cwd(), 'public', 'tmapi-images')

    this.logger.log(`Iniciando limpeza de imagens temporárias...`)
    this.logger.log(`Diretório: ${directory}`)
    this.logger.log(`Critério: Imagens com mais de ${hours} horas`)

    if (!fs.existsSync(directory)) {
      this.logger.warn(`Diretório ${directory} não existe ainda.`)
      return
    }

    if (!fs.statSync(directory).isDirectory()) {
      this.logger.error(`${directory} não é um diretório.`)
      return
    }

    const cutoffTime = Date.now() - hours * 60 * 60 * 1000
    let deletedCount = 0
    let totalSize = 0
    let errorCount = 0

    try {
      const files = fs.readdirSync(directory)

      for (const file of files) {
        const filePath = path.join(directory, file)
        const stats = fs.statSync(filePath)

        if (!stats.isFile()) {
          continue
        }

        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        if (!isImage) {
          continue
        }

        const fileModifiedTime = stats.mtimeMs

        if (fileModifiedTime < cutoffTime) {
          try {
            const fileSize = stats.size
            fs.unlinkSync(filePath)
            deletedCount++
            totalSize += fileSize
            this.logger.debug(`Removido: ${file}`)
          } catch (error: any) {
            errorCount++
            this.logger.error(`Erro ao remover ${file}: ${error.message}`)
          }
        }
      }

      const totalSizeMB = Math.round((totalSize / 1024 / 1024) * 100) / 100

      this.logger.log(`\n✅ Limpeza concluída!`)
      this.logger.log(`📊 Estatísticas:`)
      this.logger.log(`   - Arquivos removidos: ${deletedCount}`)
      this.logger.log(`   - Espaço liberado: ${totalSizeMB} MB`)
      this.logger.log(`   - Erros: ${errorCount}`)
      this.logger.log(`   - Critério: Imagens com mais de ${hours} horas`)
    } catch (error: any) {
      this.logger.error(`Erro ao processar diretório: ${error.message}`, error.stack)
    }
  }

  @Option({
    flags: '-h, --hours <hours>',
    description: 'Remover imagens mais antigas que X horas (padrão: 24)',
    defaultValue: 24,
  })
  parseHours(val: string): number {
    return parseInt(val, 10)
  }

  @Option({
    flags: '-d, --directory <directory>',
    description: 'Diretório a ser limpo (padrão: public/tmapi-images)',
  })
  parseDirectory(val: string): string {
    return val
  }
}

