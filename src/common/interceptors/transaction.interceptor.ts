import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransactionInterceptor.name)

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const method = request.method

    const methodsWithTransaction = ['POST', 'PATCH', 'PUT', 'DELETE']

    if (!methodsWithTransaction.includes(method)) {
      return next.handle()
    }

    return new Observable((subscriber) => {
      this.prisma
        .$transaction(async (tx) => {
          request['prismaTransaction'] = tx

          return new Promise((resolve, reject) => {
            const subscription = next.handle().subscribe({
              next: (value) => {
                resolve(value)
                subscriber.next(value)
                subscriber.complete()
              },
              error: (error) => {
                reject(error)
                subscriber.error(error)
              },
            })

            return () => subscription.unsubscribe()
          })
        })
        .catch((error) => {
          this.logger.error(`Transaction rolled back: ${error.message}`)
          subscriber.error(error)
        })
    })
  }
}

