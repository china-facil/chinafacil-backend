import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class ResponseLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Response');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        if (statusCode < 200 || statusCode >= 300) {
          const user = request.user;
          const userInfo = user ? `[User: ${user.id} - ${user.name}]` : '[Anonymous]';

          this.logger.warn(
            `${request.method} ${request.url} - ${statusCode} - ${duration}ms - ${userInfo}`,
            {
              method: request.method,
              url: request.url,
              statusCode,
              duration,
              userId: user?.id,
              userRole: user?.role,
              query: request.query,
              body: request.body,
              response: data,
            }
          );
        }
      })
    );
  }
}










