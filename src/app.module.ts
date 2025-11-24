import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LogsModule } from './common/logs/logs.module';
import { DatabaseModule } from './database/database.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MailModule } from './modules/mail/mail.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { SolicitationsModule } from './modules/solicitations/solicitations.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { PlansModule } from './modules/plans/plans.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { LeadsModule } from './modules/leads/leads.module';
import { AIModule } from './modules/ai/ai.module';
import { ExportsModule } from './modules/exports/exports.module';
import { TranslationModule } from './modules/translation/translation.module';
import { OTPModule } from './modules/otp/otp.module';
import { TaxCalculatorModule } from './modules/tax-calculator/tax-calculator.module';
import { BullBoardModuleConfig } from './modules/bull-board/bull-board.module';
import { CliModule } from './cli/cli.module';

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
    ClientsModule,
    PlansModule,
    SettingsModule,
    SolicitationsModule,
    ProductsModule,
    CartModule,
    NotificationsModule,
    StatisticsModule,
    WebhooksModule,
    LeadsModule,
     AIModule,
     ExportsModule,
     TranslationModule,
     OTPModule,
     TaxCalculatorModule,

    // Jobs
    JobsModule,

    // Mail
    MailModule,

    // Proxy
    ProxyModule,

    // Bull Board Dashboard
    BullBoardModuleConfig,

    // CLI
    CliModule,
  ],
})
export class AppModule {}

