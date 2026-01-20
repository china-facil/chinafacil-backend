import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { CRMModule } from "../crm/crm.module";
import { LeadsController } from './leads.controller'
import { LeadsService } from './leads.service'

@Module({
  imports: [DatabaseModule, CRMModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}


