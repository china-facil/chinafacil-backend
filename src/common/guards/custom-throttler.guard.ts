import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user
    if (user?.id) {
      return `user_${user.id}`
    }
    return req.ip || req.ips?.[0] || 'unknown'
  }
}
