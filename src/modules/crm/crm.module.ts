import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GoHighLevelService } from '../../integrations/crm/gohighlevel/gohighlevel.service'
import { N8NService } from '../../integrations/crm/n8n/n8n.service'

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [GoHighLevelService, N8NService],
  exports: [GoHighLevelService, N8NService],
})
export class CRMModule {}

