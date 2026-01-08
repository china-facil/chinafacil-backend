import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as compression from 'compression'
import helmet from 'helmet'
import * as Sentry from '@sentry/node'
import { httpIntegration } from '@sentry/node'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { ApmInterceptor } from './common/interceptors/apm.interceptor'
import { ResponseLoggerInterceptor } from './common/interceptors/response-logger.interceptor'
import { BullBoardService } from './modules/bull-board/bull-board.service'

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      httpIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Remove dados sensíveis se necessário
      if (event.request?.data) {
        // Remove senhas e dados sensíveis dos logs
        if (typeof event.request.data === 'object' && event.request.data !== null) {
          const data = { ...event.request.data } as any;
          if (data.password) delete data.password;
          if (data.confirmPassword) delete data.confirmPassword;
          event.request.data = data;
        }
      }
      return event;
    },
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    rawBody: true,
  })

  const configService = app.get(ConfigService)

  app.setGlobalPrefix('api')

  app.use(helmet())
  app.use(compression())

  app.enableCors({
    origin: configService.get('CORS_ORIGIN')?.split(',') || '*',
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  app.useGlobalFilters(new AllExceptionsFilter())

  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalInterceptors(new ApmInterceptor())
  app.useGlobalInterceptors(new ResponseLoggerInterceptor())

  const doc_config = new DocumentBuilder()
    .setTitle('ChinaFácil API')
    .setDescription('API do backend ChinaFácil')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação')
    .addTag('users', 'Usuários')
    .addTag('clients', 'Clientes')
    .addTag('solicitations', 'Solicitações')
    .addTag('products', 'Produtos')
    .addTag('cart', 'Carrinho')
    .addTag('plans', 'Planos e Assinaturas')
    .addTag('notifications', 'Notificações')
    .addTag('statistics', 'Estatísticas')
    .build()

  const swagger_document = SwaggerModule.createDocument(app, doc_config)

  SwaggerModule.setup('api/docs', app, swagger_document)

  try {
    const bullBoardService = app.get(BullBoardService)
    bullBoardService.setApp(app)
    bullBoardService.setupBullBoard()
  } catch (error) {
    console.warn('⚠️  Bull Board não pôde ser configurado:', error.message)
  }

  const port = configService.get('PORT') || 3000

  await app.listen(port)

  console.log(`🚀 Application is running on: http://localhost:${port}`)
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`)
  console.log(`📋 Logs viewer: http://localhost:${port}/api/logs`)
}

bootstrap()

