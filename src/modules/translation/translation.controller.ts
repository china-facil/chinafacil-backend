import { Body, Controller, Delete, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { TranslateProductDto, TranslateTextDto } from "./dto";
import { TranslationService } from "./translation.service";

@ApiTags("translation")
@Controller("translation")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post("text")
  @ApiOperation({ summary: "Traduzir texto" })
  @ApiResponse({ status: 201, description: "Texto traduzido" })
  @ApiResponse({ status: 400, description: "Dados inválidos" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  async translateText(@Body() translateTextDto: TranslateTextDto) {
    return this.translationService.translateText(translateTextDto);
  }

  @Post("titles")
  @ApiOperation({ summary: "Traduzir múltiplos títulos" })
  @ApiResponse({ status: 201, description: "Títulos traduzidos" })
  @ApiResponse({ status: 400, description: "Dados inválidos" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  async translateTitles(@Body("titles") titles: string[], @Body("from") from: string, @Body("to") to: string) {
    return this.translationService.translateTitles(titles, from, to);
  }

  @Post("product")
  @ApiOperation({ summary: "Traduzir produto" })
  @ApiResponse({ status: 201, description: "Produto traduzido" })
  @ApiResponse({ status: 400, description: "Dados inválidos" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  async translateProduct(@Body() translateProductDto: TranslateProductDto) {
    return this.translationService.translateProduct(translateProductDto);
  }

  @Post("detect-chinese")
  @ApiOperation({ summary: "Detectar se o texto é chinês" })
  @ApiResponse({ status: 201, description: "Detecção concluída" })
  @ApiResponse({ status: 400, description: "Dados inválidos" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  async detectChinese(@Body("text") text: string) {
    return this.translationService.detectChinese(text);
  }

  @Delete("clear-cache")
  @Roles("admin")
  @ApiOperation({ summary: "Limpar cache de traduções" })
  @ApiResponse({ status: 200, description: "Cache limpo" })
  @ApiResponse({ status: 401, description: "Não autenticado" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  async clearCache() {
    return this.translationService.clearCache();
  }
}
