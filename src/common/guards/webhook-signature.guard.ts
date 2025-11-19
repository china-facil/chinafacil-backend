import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import * as crypto from 'crypto'

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSignatureGuard.name)

  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const signature = request.headers['typeform-signature'] as string

    const secret = this.configService.get<string>('TYPEFORM_WEBHOOK_SECRET')
    const skipValidation = this.configService.get<string>('NODE_ENV') === 'development' && !secret

    if (skipValidation) {
      this.logger.warn('Webhook signature validation skipped in development mode')
      return true
    }

    if (!signature) {
      throw new UnauthorizedException('Missing webhook signature')
    }

    if (!secret) {
      throw new UnauthorizedException('Webhook secret not configured')
    }

    const rawBody = Buffer.isBuffer((request as any).rawBody) 
      ? (request as any).rawBody.toString('utf8')
      : JSON.stringify(request.body)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    const providedSignature = signature.replace('sha256=', '')

    if (expectedSignature.length !== providedSignature.length) {
      throw new UnauthorizedException('Invalid webhook signature')
    }

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature))) {
      throw new UnauthorizedException('Invalid webhook signature')
    }

    return true
  }
}

