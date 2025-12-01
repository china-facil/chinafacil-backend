import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as mysql from 'mysql2/promise'

export interface NcmRecord {
  codigo: string
  nome: string
  ii?: number
  ipi?: number
  pis?: number
  cofins?: number
}

@Injectable()
export class NcmDatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NcmDatabaseService.name)
  private connection: mysql.Connection | null = null

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const config = this.configService.get('ncmDatabase')
      const host = config?.host || process.env.DB_HOST_NCM_IMPOSTOS
      const database = config?.database || process.env.DB_DATABASE_NCM_IMPOSTOS
      const username = config?.username || process.env.DB_USERNAME_NCM_IMPOSTOS
      const password = config?.password || process.env.DB_PASSWORD_NCM_IMPOSTOS
      const port = config?.port || (process.env.DB_PORT_NCM_IMPOSTOS ? parseInt(process.env.DB_PORT_NCM_IMPOSTOS, 10) : 3306)
      
      this.logger.log(`[NcmDatabaseService] Config check - ConfigService: ${JSON.stringify(config)}, Env: host=${process.env.DB_HOST_NCM_IMPOSTOS}, db=${process.env.DB_DATABASE_NCM_IMPOSTOS}, user=${process.env.DB_USERNAME_NCM_IMPOSTOS}`)
      this.logger.log(`[NcmDatabaseService] Final values - host=${host}, database=${database}, username=${username}, port=${port}, hasPassword=${!!password}`)
      
      if (!host || !database || !username || (host === '127.0.0.1' && database === 'forge')) {
        this.logger.warn('⚠️  NCM database not configured. Set DB_HOST_NCM_IMPOSTOS, DB_DATABASE_NCM_IMPOSTOS, DB_USERNAME_NCM_IMPOSTOS, and DB_PASSWORD_NCM_IMPOSTOS environment variables.')
        return
      }
      
      const connectionConfig = {
        host,
        port,
        database,
        user: username,
        password: password || '',
        charset: 'utf8mb4',
        connectTimeout: 10000,
      }

      this.logger.log(`[NcmDatabaseService] Attempting to connect to NCM database at ${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`)
      
      this.connection = await mysql.createConnection(connectionConfig)
      this.logger.log('[NcmDatabaseService] ✅ NCM Database connected successfully')
    } catch (error: any) {
      const config = this.configService.get('ncmDatabase')
      const host = config?.host || process.env.DB_HOST_NCM_IMPOSTOS
      const database = config?.database || process.env.DB_DATABASE_NCM_IMPOSTOS
      this.logger.error(`[NcmDatabaseService] ❌ Failed to connect to NCM database: ${error.message}`)
      this.logger.error(`[NcmDatabaseService] Connection details: host=${host}, port=${config?.port || process.env.DB_PORT_NCM_IMPOSTOS || 3306}, database=${database}`)
      if (process.env.NODE_ENV === 'production') {
        throw error
      }
    }
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.end()
      this.logger.log('❌ NCM Database disconnected')
    }
  }

  async findByCode(codigo: string): Promise<NcmRecord | null> {
    if (!this.connection) {
      throw new Error('NCM database connection not available')
    }

    const cleanCode = codigo.replace(/[^0-9]/g, '')

    const [rows] = await this.connection.execute(
      'SELECT codigo, nome, ii, ipi, pis, cofins FROM ncm_impostos WHERE codigo = ? LIMIT 1',
      [cleanCode],
    )

    const results = rows as NcmRecord[]
    return results.length > 0 ? results[0] : null
  }

  async findByCodeLike(codigo: string): Promise<NcmRecord[]> {
    if (!this.connection) {
      throw new Error('NCM database connection not available')
    }

    const cleanCode = codigo.replace(/[^0-9]/g, '')
    const searchPattern = `${cleanCode}%`

    const [rows] = await this.connection.execute(
      'SELECT codigo, nome, ii, ipi, pis, cofins FROM ncm_impostos WHERE codigo LIKE ? LIMIT 10',
      [searchPattern],
    )

    return rows as NcmRecord[]
  }
}

