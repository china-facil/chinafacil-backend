import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from "@nestjs/throttler";
import { join } from 'path';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
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
import { BullBoardModule } from './modules/bull-board/bull-board.module';
import { CliModule } from './cli/cli.module';
import { LogsModule } from './common/logs/logs.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      load: [() => {
        const config = {
          ncmDatabase: {
            host: process.env.DB_HOST_NCM_IMPOSTOS || undefined,
            port: process.env.DB_PORT_NCM_IMPOSTOS ? parseInt(process.env.DB_PORT_NCM_IMPOSTOS, 10) : undefined,
            database: process.env.DB_DATABASE_NCM_IMPOSTOS || undefined,
            username: process.env.DB_USERNAME_NCM_IMPOSTOS || undefined,
            password: process.env.DB_PASSWORD_NCM_IMPOSTOS || undefined,
          },
        };
        return config
      }],
    }),

    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 150,
      },
    ]),

    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 1000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
    }),
    DatabaseModule,
    HealthModule,
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
    JobsModule,
    MailModule,
    ProxyModule,
    BullBoardModule,
    CliModule,
    LogsModule,
    FeatureFlagsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}

