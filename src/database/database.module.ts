import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { NcmDatabaseService } from './ncm-database.service';

@Global()
@Module({
  providers: [PrismaService, NcmDatabaseService],
  exports: [PrismaService, NcmDatabaseService],
})
export class DatabaseModule {}

