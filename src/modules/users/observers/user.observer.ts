import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { PrismaService } from '../../../database/prisma.service'
import { UserRole } from '@prisma/client'
import { ProcessSiteLeadJobDto } from '../../../jobs/dto/lead-job.dto'
import { SendNewUserEmailJobDto } from '../../../jobs/dto/email-job.dto'

@Injectable()
export class UserObserver implements OnModuleInit {
  private readonly logger = new Logger(UserObserver.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('lead-queue') private readonly leadQueue: Queue,
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
  ) {}

  onModuleInit() {
    this.setupHooks()
  }

  private setupHooks() {
    this.prisma.$use(async (params, next) => {
      if (params.model === 'User') {
        if (params.action === 'create') {
          const result = await next(params)
          await this.onUserCreated(result)
          return result
        }
      }

      return next(params)
    })
  }

  private async onUserCreated(user: any) {
    try {
      const rolesToProcess = [UserRole.user, UserRole.lead]

      if (!rolesToProcess.includes(user.role)) {
        return
      }

      const isProduction = this.configService.get('NODE_ENV') === 'production'

      if (!isProduction) {
        this.logger.log(`🔍 Skipping lead processing in non-production environment (NODE_ENV=${this.configService.get('NODE_ENV')})`)
        return
      }

      this.logger.log(`🔍 New site user created: ${user.email} (role: ${user.role})`)

      const leadJobData: ProcessSiteLeadJobDto = {
        firstName: user.name,
        email: user.email,
        phone: user.phone || undefined,
        monthly_revenue: user.monthlyBilling || undefined,
      }

      await this.leadQueue.add('process-site-lead', leadJobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      })

      this.logger.log(`✅ Lead processing job queued for: ${user.email}`)

     
      const emailJobData: SendNewUserEmailJobDto = {
        email: user.email,
        name: user.name,
      }

      await this.emailQueue.add('send-new-user-email', emailJobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      })

      this.logger.log(`✅ New user notification email job queued for: ${user.email}`)
    } catch (error: any) {
      this.logger.error(`❌ Error processing site user: ${error.message}`, error.stack)
    }
  }
}
