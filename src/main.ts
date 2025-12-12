import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as compression from 'compression'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { BullBoardService } from './modules/bull-board/bull-board.service'

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    rawBody: true,
  })

  const configService = app.get(ConfigService)

  // Global prefix
  app.setGlobalPrefix('api')

  // Security
  app.use(helmet())
  app.use(compression())

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN')?.split(',') || '*',
    credentials: true,
  })

  // Global pipes
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

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter())

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalInterceptors(new TransformInterceptor())

  // Swagger
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api/docs', app, document)

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

