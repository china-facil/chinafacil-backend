import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler'
import { Reflector } from '@nestjs/core'

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user
    if (user?.id) {
      return `user_${user.id}`
    }
    return req.ip || req.ips?.[0] || 'unknown'
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    const adjustedLimit = user?.id ? 150 : 60

    return super.handleRequest(context, adjustedLimit, ttl)
  }
}

