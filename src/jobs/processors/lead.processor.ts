import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { GoHighLevelService } from '../../integrations/crm/gohighlevel/gohighlevel.service'
import { ProcessSiteLeadJobDto } from '../dto/lead-job.dto'

@Processor('lead-queue')
export class LeadProcessor {
  private readonly logger = new Logger(LeadProcessor.name)

  constructor(private readonly goHighLevelService: GoHighLevelService) {}

  @Process('process-site-lead')
  async handleProcessSiteLead(job: Job<ProcessSiteLeadJobDto>) {
    this.logger.log(`🔍 Processing site lead job ${job.id}`)

    try {
      const leadData = {
        firstName: job.data.firstName,
        email: job.data.email,
        phone: job.data.phone,
        monthly_revenue: job.data.monthly_revenue,
      }

      const result = await this.goHighLevelService.processSiteLead(leadData)

      if (result.success) {
        this.logger.log(
          `✅ Site lead processed successfully: ${result.contact_id} (${result.action})`,
        )
      } else {
        this.logger.error(`❌ Failed to process site lead: ${result.error}`)
      }

      return result
    } catch (error: any) {
      this.logger.error(
        `❌ Failed to process site lead job: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }
}
