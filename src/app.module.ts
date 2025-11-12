import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LogsModule } from './common/logs/logs.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuração
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Bull/Redis para filas
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
        },
      }),
    }),

    // Database (Prisma)
    DatabaseModule,

    // Sistema de Logs Centralizado
    LogsModule,

    // Health Check
    HealthModule,

    // Módulos de domínio
    AuthModule,
    UsersModule,

    // Adicionar outros módulos conforme for implementando:
    // ClientsModule,
    // SolicitationsModule,
    // ProductsModule,
    // CartModule,
    // PlansModule,
    // NotificationsModule,
    // StatisticsModule,
    // SettingsModule,
    // WebhooksModule,
    // LeadsModule,
    // AiModule,
    // ExportsModule,

    // Integrações
    // AlibabaModule,
    // TranslationModule,
    // AiProvidersModule,
    // CrmModule,
    // SmsModule,
    // MarketplaceModule,

    // Jobs
    // JobsModule,

    // Mail
    // MailModule,

    // CLI
    // CliModule,
  ],
})
export class AppModule {}

