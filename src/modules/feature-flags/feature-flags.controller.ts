import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { FeatureFlagsService } from './feature-flags.service'
import { UpdateOtProductsFlagDto, UpdateHomepageCarouselFlagDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('feature-flags')
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get('ot-products')
  @ApiOperation({ summary: 'Obter flag de quantidade de produtos OT' })
  @ApiResponse({ status: 200, description: 'Flag encontrada' })
  async getOtProductsFlag() {
    return this.featureFlagsService.getOtProductsFlag()
  }

  @Put('ot-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar flag de quantidade de produtos OT' })
  @ApiResponse({ status: 200, description: 'Flag atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async updateOtProductsFlag(@Body() updateDto: UpdateOtProductsFlagDto) {
    return this.featureFlagsService.updateOtProductsFlag(updateDto)
  }

  @Get('homepage-carousel')
  @ApiOperation({ summary: 'Obter todas as flags de carrossel da homepage' })
  @ApiResponse({ status: 200, description: 'Flags encontradas' })
  async getAllHomepageCarouselFlags() {
    return this.featureFlagsService.getAllHomepageCarouselFlags()
  }

  @Get('homepage-carousel/active')
  @ApiOperation({ summary: 'Obter flag ativa de carrossel da homepage' })
  @ApiResponse({ status: 200, description: 'Flag encontrada' })
  async getHomepageCarouselFlag() {
    return this.featureFlagsService.getHomepageCarouselFlag()
  }

  @Post('homepage-carousel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova flag de carrossel da homepage' })
  @ApiResponse({ status: 201, description: 'Flag criada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async createHomepageCarouselFlag(@Body() createDto: UpdateHomepageCarouselFlagDto) {
    return this.featureFlagsService.createHomepageCarouselFlag(createDto)
  }

  @Put('homepage-carousel/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar flag de carrossel da homepage' })
  @ApiResponse({ status: 200, description: 'Flag atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Flag não encontrada' })
  async updateHomepageCarouselFlag(
    @Param('id') id: string,
    @Body() updateDto: UpdateHomepageCarouselFlagDto,
  ) {
    return this.featureFlagsService.updateHomepageCarouselFlag(id, updateDto)
  }

  @Delete('homepage-carousel/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover flag de carrossel da homepage' })
  @ApiResponse({ status: 200, description: 'Flag removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Flag não encontrada' })
  async deleteHomepageCarouselFlag(@Param('id') id: string) {
    return this.featureFlagsService.deleteHomepageCarouselFlag(id)
  }
}

