import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { SendEmailDto } from './dto'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private transporter: nodemailer.Transporter

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    })
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    try {
      const mailOptions = {
        from: `${this.configService.get('MAIL_FROM_NAME')} <${this.configService.get('MAIL_FROM')}>`,
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        text: sendEmailDto.text,
        html: sendEmailDto.html,
        attachments: sendEmailDto.attachments,
      }

      const info = await this.transporter.sendMail(mailOptions)

      this.logger.log(`Email sent: ${info.messageId}`)

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`)
      throw error
    }
  }

  async sendNewUserEmail(email: string, name: string) {
    const html = `
      <h1>Bem-vindo ao ChinaFácil, ${name}!</h1>
      <p>Sua conta foi criada com sucesso.</p>
      <p>Agora você pode fazer login e começar a usar nossos serviços.</p>
    `

    return this.sendEmail({
      to: email,
      subject: 'Bem-vindo ao ChinaFácil',
      html,
    })
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${token}`
    
    const html = `
      <h1>Recuperação de Senha</h1>
      <p>Você solicitou a recuperação de senha.</p>
      <p>Clique no link abaixo para resetar sua senha:</p>
      <a href="${resetUrl}">Resetar Senha</a>
      <p>Este link expira em 1 hora.</p>
    `

    return this.sendEmail({
      to: email,
      subject: 'Recuperação de Senha - ChinaFácil',
      html,
    })
  }

  async sendNewSolicitationEmail(email: string, solicitationCode: string) {
    const html = `
      <h1>Nova Solicitação Criada</h1>
      <p>Sua solicitação <strong>${solicitationCode}</strong> foi criada com sucesso.</p>
      <p>Acompanhe o status pelo dashboard.</p>
    `

    return this.sendEmail({
      to: email,
      subject: `Solicitação ${solicitationCode} - ChinaFácil`,
      html,
    })
  }

  async sendBulkEmail(emails: string[], subject: string, html: string) {
    const promises = emails.map((email) =>
      this.sendEmail({ to: email, subject, html }),
    )

    return Promise.allSettled(promises)
  }
}


