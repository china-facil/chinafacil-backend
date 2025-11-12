import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TwilioService } from '../../integrations/sms/twilio/twilio.service'
import { OTPController } from './otp.controller'

@Module({
  imports: [ConfigModule],
  controllers: [OTPController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class OTPModule {}

