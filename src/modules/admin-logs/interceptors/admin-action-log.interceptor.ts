import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { AdminLogsService } from '../admin-logs.service'
import { AdminActionType } from '@prisma/client'
import { RequestWithUser } from '../../../common/interfaces/request-with-user.interface'

@Injectable()
export class AdminActionLogInterceptor implements NestInterceptor {
  constructor(private readonly adminLogsService: AdminLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const response = context.switchToHttp().getResponse()
    const user = request.user
    const method = request.method
    const url = request.url

    if (!user || user.role !== 'admin') {
      return next.handle()
    }

    if (url.includes('/admin-logs')) {
      return next.handle()
    }

    if (url.includes('/cart')) {
      return next.handle()
    }

    const actionType = this.getActionType(method)
    if (!actionType) {
      return next.handle()
    }

    const resource = this.extractResource(url)

    return next.handle().pipe(
      tap({
        next: async () => {
          const statusCode = response.statusCode
          if (statusCode >= 200 && statusCode < 300) {
            try {
              await this.adminLogsService.createLog(
                user.id as string,
                actionType,
                resource,
              )
            } catch (error) {
              console.error('Erro ao registrar log de ação admin:', error)
            }
          }
        },
      }),
    )
  }

  private getActionType(method: string): AdminActionType | null {
    switch (method.toUpperCase()) {
      case 'POST':
        return AdminActionType.CREATE
      case 'PATCH':
      case 'PUT':
        return AdminActionType.UPDATE
      case 'DELETE':
        return AdminActionType.DELETE
      default:
        return null
    }
  }

  private extractResource(url: string): string {
    const urlParts = url.split('/').filter((part) => part && part !== 'api')
    if (urlParts.length === 0) {
      return 'unknown'
    }

    const resource = urlParts[0]
    return resource.replace(/s$/, '')
  }
}

