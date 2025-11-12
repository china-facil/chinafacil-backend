import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { TwilioService } from '../../integrations/sms/twilio/twilio.service'
import { SendOTPDto, ValidateOTPDto } from './dto'

@ApiTags('otp')
@Controller('otp')
export class OTPController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  @ApiOperation({ summary: 'Enviar código OTP' })
  @ApiResponse({ status: 201, description: 'OTP enviado' })
  async sendOTP(@Body() sendOTPDto: SendOTPDto) {
    return this.twilioService.sendOTP(sendOTPDto.phone)
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validar código OTP' })
  @ApiResponse({ status: 200, description: 'OTP validado' })
  async validateOTP(@Body() validateOTPDto: ValidateOTPDto) {
    return this.twilioService.validateOTP(
      validateOTPDto.phone,
      validateOTPDto.code,
    )
  }

  @Post('resend')
  @ApiOperation({ summary: 'Reenviar código OTP' })
  @ApiResponse({ status: 201, description: 'OTP reenviado' })
  async resendOTP(@Body() sendOTPDto: SendOTPDto) {
    return this.twilioService.resendOTP(sendOTPDto.phone)
  }
}

