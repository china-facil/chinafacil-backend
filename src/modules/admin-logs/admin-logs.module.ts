import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { DatabaseModule } from '../../database/database.module'
import { AdminLogsController } from './admin-logs.controller'
import { AdminLogsService } from './admin-logs.service'
import { AdminActionLogInterceptor } from './interceptors/admin-action-log.interceptor'

@Module({
  imports: [DatabaseModule],
  controllers: [AdminLogsController],
  providers: [
    AdminLogsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminActionLogInterceptor,
    },
  ],
  exports: [AdminLogsService],
})
export class AdminLogsModule {}

