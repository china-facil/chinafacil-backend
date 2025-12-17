import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindNcmByDescriptionDto } from "../dto";
import { NcmService } from "../services/ncm.service";

@ApiTags("ncm")
@Controller("ncm")
export class NcmController {
  constructor(private readonly ncmService: NcmService) {}

  @Get("by-code")
  @ApiOperation({ summary: "Buscar NCM por código" })
  @ApiQuery({
    name: "ncm_code",
    required: true,
    description: "Código NCM (8 dígitos)",
    type: String,
  })
  @ApiResponse({ status: 200, description: "NCM encontrado" })
  @ApiResponse({ status: 400, description: "Código NCM inválido" })
  @ApiResponse({ status: 404, description: "NCM não encontrado" })
  async findByCode(@Query("ncm_code") ncmCode: string) {
    return this.ncmService.findByCode(ncmCode);
  }

  @Post("item")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Buscar NCM por descrição do produto (usando AI)" })
  @ApiResponse({ status: 200, description: "NCM identificado" })
  @ApiResponse({ status: 400, description: "Dados inválidos" })
  @ApiResponse({ status: 404, description: "NCM não encontrado" })
  @ApiResponse({ status: 500, description: "Erro ao processar" })
  async findByDescription(@Body() findNcmDto: FindNcmByDescriptionDto) {
    return this.ncmService.findByDescription(findNcmDto.product);
  }
}
