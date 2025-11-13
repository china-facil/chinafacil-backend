import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import * as twilio from 'twilio'

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name)
  private twilioClient: twilio.Twilio
  private readonly accountSid: string
  private readonly authToken: string
  private readonly phoneNumber: string
  private otpStore: Map<string, { code: string; expiresAt: Date }>

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get('TWILIO_ACCOUNT_SID') || ''
    this.authToken = this.configService.get('TWILIO_AUTH_TOKEN') || ''
    this.phoneNumber = this.configService.get('TWILIO_PHONE_NUMBER') || ''
    
    if (this.accountSid && this.authToken) {
      this.twilioClient = twilio(this.accountSid, this.authToken)
    }

    this.otpStore = new Map()
  }

  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString()
  }

  async sendOTP(phone: string) {
    try {
      const otp = this.generateOTP()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

      this.otpStore.set(phone, { code: otp, expiresAt })

      const message = await this.twilioClient.messages.create({
        body: `Seu código de verificação é: ${otp}. Válido por 5 minutos.`,
        from: this.phoneNumber,
        to: phone,
      })

      this.logger.log(`OTP sent to ${phone}: ${message.sid}`)

      return {
        success: true,
        messageSid: message.sid,
        expiresAt,
      }
    } catch (error) {
      this.logger.error(`Twilio send OTP error: ${error.message}`)
      throw error
    }
  }

  async validateOTP(phone: string, code: string) {
    const stored = this.otpStore.get(phone)

    if (!stored) {
      throw new UnauthorizedException('Código não encontrado ou expirado')
    }

    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(phone)
      throw new UnauthorizedException('Código expirado')
    }

    if (stored.code !== code) {
      throw new UnauthorizedException('Código inválido')
    }

    this.otpStore.delete(phone)

    return {
      success: true,
      message: 'Código validado com sucesso',
    }
  }

  async resendOTP(phone: string) {
    this.otpStore.delete(phone)
    return this.sendOTP(phone)
  }

  async sendSMS(phone: string, message: string) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.phoneNumber,
        to: phone,
      })

      this.logger.log(`SMS sent to ${phone}: ${result.sid}`)

      return {
        success: true,
        messageSid: result.sid,
      }
    } catch (error) {
      this.logger.error(`Twilio send SMS error: ${error.message}`)
      throw error
    }
  }
}


