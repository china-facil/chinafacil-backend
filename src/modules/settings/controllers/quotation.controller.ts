import { Controller, Get } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { QuotationService } from '../services/quotation.service'

@ApiTags('settings')
@Controller('settings')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get('quotation')
  @ApiOperation({ summary: 'Obter cotação de moedas' })
  @ApiResponse({ status: 200, description: 'Cotação obtida' })
  @ApiResponse({ status: 500, description: 'Erro ao obter cotação' })
  async getQuotation() {
    return this.quotationService.getQuotation()
  }
}
