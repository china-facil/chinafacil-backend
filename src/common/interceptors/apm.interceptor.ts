import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse();

    const user = request.user;

    if (typeof (global as any).newrelic !== 'undefined') {
      (global as any).newrelic.setTransactionName(`${request.method} ${request.route?.path || request.url}`);

      const customAttributes: Record<string, any> = {
        'request.method': request.method,
        'request.url': request.url,
        'response.statusCode': response.statusCode,
      };

      if (user) {
        customAttributes['user.id'] = user.id;
        customAttributes['user.name'] = user.name;
        customAttributes['user.email'] = user.email;
        if (user.role) {
          customAttributes['user.role'] = user.role;
        }
      }

      (global as any).newrelic.addCustomAttributes(customAttributes);
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        if (typeof (global as any).newrelic !== 'undefined') {
          (global as any).newrelic.recordMetric('Custom/RequestDuration', duration);
          (global as any).newrelic.recordMetric('Custom/RequestSuccess', 1);

          if (user?.role) {
            (global as any).newrelic.recordMetric(`Custom/User/${user.role}/RequestSuccess`, 1);
            (global as any).newrelic.recordMetric(`Custom/User/${user.role}/RequestDuration`, duration);
          }
        }
      })
    );
  }
}
