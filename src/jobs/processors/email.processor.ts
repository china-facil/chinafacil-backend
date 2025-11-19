import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { MailService } from '../../modules/mail/mail.service'
import {
  SendBulkEmailJobDto,
  SendEmailJobDto,
  SendNewSolicitationEmailJobDto,
  SendNewUserEmailJobDto,
  SendPasswordResetEmailJobDto,
} from '../dto/email-job.dto'

@Processor('email-queue')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name)

  constructor(private readonly mailService: MailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<SendEmailJobDto>) {
    this.logger.log(`Processing send-email job ${job.id}`)

    try {
      const result = await this.mailService.sendEmail(job.data)
      this.logger.log(`Email sent successfully: ${job.id}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack)
      throw error
    }
  }

  @Process('send-new-user-email')
  async handleSendNewUserEmail(job: Job<SendNewUserEmailJobDto>) {
    this.logger.log(`Processing send-new-user-email job ${job.id}`)

    try {
      const result = await this.mailService.sendNewUserEmail(
        job.data.email,
        job.data.name,
      )
      this.logger.log(`New user email sent successfully: ${job.id}`)
      return result
    } catch (error) {
      this.logger.error(
        `Failed to send new user email: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Process('send-password-reset-email')
  async handleSendPasswordResetEmail(job: Job<SendPasswordResetEmailJobDto>) {
    this.logger.log(`Processing send-password-reset-email job ${job.id}`)

    try {
      const result = await this.mailService.sendPasswordResetEmail(
        job.data.email,
        job.data.token,
      )
      this.logger.log(`Password reset email sent successfully: ${job.id}`)
      return result
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Process('send-new-solicitation-email')
  async handleSendNewSolicitationEmail(
    job: Job<SendNewSolicitationEmailJobDto>,
  ) {
    this.logger.log(
      `Processing send-new-solicitation-email job ${job.id}`,
    )

    try {
      const result = await this.mailService.sendNewSolicitationEmail(
        job.data.email,
        job.data.solicitationCode,
      )
      this.logger.log(
        `New solicitation email sent successfully: ${job.id}`,
      )
      return result
    } catch (error) {
      this.logger.error(
        `Failed to send new solicitation email: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Process('send-bulk-email')
  async handleSendBulkEmail(job: Job<SendBulkEmailJobDto>) {
    this.logger.log(`Processing send-bulk-email job ${job.id}`)

    try {
      const result = await this.mailService.sendBulkEmail(
        job.data.emails,
        job.data.subject,
        job.data.html,
      )
      this.logger.log(`Bulk email sent successfully: ${job.id}`)
      return result
    } catch (error) {
      this.logger.error(
        `Failed to send bulk email: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }
}



