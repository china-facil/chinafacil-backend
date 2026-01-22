import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { SendEmailDto } from './dto'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private transporter: nodemailer.Transporter

  constructor(private readonly configService: ConfigService) {
    const mailHost = this.configService.get("MAIL_HOST");
    const mailUser = this.configService.get("MAIL_USER");
    const mailPassword = this.configService.get("MAIL_PASSWORD");

    if (mailHost && mailUser && mailPassword) {
      this.transporter = nodemailer.createTransport({
        host: mailHost,
        port: this.configService.get("MAIL_PORT"),
        auth: {
          user: mailUser,
          pass: mailPassword,
        },
      });
    } else {
      this.logger.warn("Credenciais de email não configuradas. Usando transporte mock para testes.");
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    try {
      const mailOptions = {
        from: `${this.configService.get('MAIL_FROM_NAME')} <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
        to: sendEmailDto.to,
        cc: sendEmailDto.cc,
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
      this.logger.error(`Failed to send email: ${error.message}`, error.stack)
      throw error
    }
  }

  async sendNewUserEmail(email: string, name: string) {
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>China Fácil - Novo Lead</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #eceff1; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; }
          .header { text-align: center; padding: 48px; }
          .content { padding: 30px 48px; color: #626262; font-size: 14px; line-height: 24px; }
          .info { margin: 0 0 10px; font-size: 16px; }
          .divider { height: 1px; background-color: #eceff1; margin: 32px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://chinafacil.com/storage/Logo.png" width="220" alt="China Fácil" style="border: 0; max-width: 100%;">
          </div>
          <div class="content">
            <p style="font-weight: 600; font-size: 18px; margin-bottom: 20px;">
              ${name.split(' ')[0]} acabou de se cadastrar no site!
            </p>

            <p class="info"><b>Nome Completo</b>: ${name}</p>
            <p class="info"><b>Email</b>: ${email}</p>
            <p class="info"><b>Telefone</b>: Não informado</p>
            <p class="info"><b>Data de cadastro</b>: ${new Date().toLocaleString('pt-BR')}</p>

            <div class="divider"></div>
            <p style="margin: 0 0 16px;">Obrigado, <br><b>Equipe China Fácil</b></p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: ['cilmeia.nogueira@chinafacil.com'],
      cc: ['thiago.martins@chinafacil.com', 'pedro@chinafacil.com'],
      subject: 'Novo Lead',
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


