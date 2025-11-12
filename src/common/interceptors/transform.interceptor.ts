import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Se já é uma resposta formatada, retorna como está
        if (data && typeof data === 'object' && ('data' in data || 'meta' in data)) {
          return data;
        }
        // Senão, envelopa em { data }
        return { data };
      }),
    );
  }
}

