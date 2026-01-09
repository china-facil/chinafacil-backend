import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { existsSync, mkdirSync } from 'fs'
import { extname } from 'path'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { AddFavoriteDto, SearchByImageDto, SearchProductsDto, SearchBySellerDto, ShopInfoDto } from '../dto'
import { ProductsService } from '../services/products.service'

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get('search/1688')
  @ApiOperation({ summary: 'Buscar produtos no Alibaba 1688 por keyword' })
  @ApiResponse({
    status: 200,
    description: 'Resultados da busca',
    schema: {
      example: {
        products: [
          {
            id: 'item-123',
            title: 'Produto exemplo',
            price: 99.99,
            image: 'https://example.com/image.jpg',
          },
        ],
        total: 100,
        page: 1,
        pageSize: 20,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos (keyword obrigatório)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async search1688(@Query() searchDto: SearchProductsDto) {
    return this.productsService.search1688(searchDto)
  }

  @Get('search/alibaba')
  @ApiOperation({ summary: 'Buscar produtos no Alibaba Internacional por keyword' })
  @ApiResponse({ status: 200, description: 'Resultados da busca' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (keyword obrigatório)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async searchAlibaba(@Query() searchDto: SearchProductsDto) {
    return this.productsService.searchAlibabaIntl(searchDto)
  }

  @Get('search/mixed')
  @ApiOperation({ summary: 'Buscar produtos em ambas as plataformas (1688 + Alibaba)' })
  @ApiResponse({ status: 200, description: 'Resultados mesclados' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (keyword obrigatório)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async searchMixed(@Query() searchDto: SearchProductsDto) {
    return this.productsService.searchMixed(searchDto)
  }

  @Post('search/image/1688')
  @ApiOperation({ summary: 'Buscar produtos no Alibaba 1688 por imagem' })
  @ApiResponse({ status: 200, description: 'Resultados da busca' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (imgUrl obrigatório e deve ser URL válida)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async searchByImage1688(@Body() searchDto: SearchByImageDto) {
    return this.productsService.searchByImage1688(searchDto)
  }

  @Post('search/image/alibaba')
  @ApiOperation({ summary: 'Buscar produtos no Alibaba Internacional por imagem' })
  @ApiResponse({ status: 200, description: 'Resultados da busca' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (imgUrl obrigatório e deve ser URL válida)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async searchByImageAlibaba(@Body() searchDto: SearchByImageDto) {
    return this.productsService.searchByImageAlibabaIntl(searchDto)
  }

  @Post('search/image/upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de imagem para busca de produtos' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPG, JPEG, PNG, GIF ou WEBP)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagem enviada com sucesso',
    schema: {
      example: {
        imgUrl: 'http://localhost:3000/uploads/search-images/abc123def456.jpg',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Arquivo inválido, muito grande ou não fornecido' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './public/uploads/search-images'
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('')
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file) {
          return cb(new BadRequestException('Arquivo não fornecido'), false)
        }
        if (!file.originalname || !file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return cb(new BadRequestException('Apenas imagens são permitidas (JPG, JPEG, PNG, GIF ou WEBP)'), false)
        }
        cb(null, true)
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadSearchImage(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.uploadSearchImage(file)
  }

  @Get('details/1688/:itemId')
  @ApiOperation({ summary: 'Obter detalhes de produto do Alibaba 1688' })
  @ApiResponse({ status: 200, description: 'Detalhes do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getDetails1688(@Param('itemId') itemId: string) {
    return this.productsService.getDetails1688(itemId)
  }

  @Get('details/alibaba/:productId')
  @ApiOperation({ summary: 'Obter detalhes de produto do Alibaba Internacional' })
  @ApiResponse({ status: 200, description: 'Detalhes do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getDetailsAlibaba(@Param('productId') productId: string) {
    return this.productsService.getDetailsAlibabaIntl(productId)
  }

  @Get('sku/1688/:itemId')
  @ApiOperation({ summary: 'Obter SKUs/variações de produto do Alibaba 1688' })
  @ApiResponse({ status: 200, description: 'SKUs do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getSku1688(@Param('itemId') itemId: string) {
    return this.productsService.getSku1688(itemId)
  }

  @Get('shipping/1688/:itemId')
  @ApiOperation({ summary: 'Obter informações de frete do Alibaba 1688' })
  @ApiResponse({ status: 200, description: 'Informações de frete' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos (quantity deve ser número positivo)' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getShipping1688(
    @Param('itemId') itemId: string,
    @Query('quantity') quantity: string,
    @Query('province') province?: string,
    @Query('city') city?: string,
  ) {
    return this.productsService.getShipping1688({
      itemId,
      quantity: parseInt(quantity, 10) || 1,
      province,
      city,
    })
  }

  @Post('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar produto aos favoritos' })
  @ApiResponse({ status: 201, description: 'Produto adicionado aos favoritos' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (productId obrigatório)' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async addToFavorites(
    @CurrentUser() user: any,
    @Body() addFavoriteDto: AddFavoriteDto,
  ) {
    return this.productsService.addToFavorites(user.id, addFavoriteDto)
  }

  @Delete('favorites/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover produto dos favoritos' })
  @ApiResponse({ status: 200, description: 'Produto removido dos favoritos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async removeFromFavorites(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.productsService.removeFromFavorites(user.id, productId)
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar produtos favoritos do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getFavorites(@CurrentUser() user: any) {
    return this.productsService.getFavorites(user.id)
  }

  @Get('search/suggestions-cnae')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sugerir produtos baseado no CNAE do usuário' })
  @ApiResponse({ status: 200, description: 'Sugestões de produtos' })
  @ApiResponse({ status: 400, description: 'Dados da empresa não encontrados ou CNAE inválido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async suggestionsCnae(@CurrentUser() user: any) {
    return this.productsService.suggestionsCnae(user.id)
  }

  @Get('popular')
  @ApiOperation({ summary: 'Listar produtos populares' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'order_by', required: false, type: String })
  @ApiQuery({ name: 'price_min', required: false, type: Number })
  @ApiQuery({ name: 'price_max', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de produtos populares' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getPopularProducts(
    @Query('page') page?: number,
    @Query('order_by') orderBy?: string,
    @Query('price_min') priceMin?: number,
    @Query('price_max') priceMax?: number,
  ) {
    return this.productsService.getPopularProducts({
      page: page ? Number(page) : 1,
      orderBy,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    })
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias do Mercado Livre' })
  @ApiQuery({ name: 'parent_category_id', required: false, type: String })
  @ApiQuery({ name: 'refresh', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  @ApiResponse({ status: 400, description: 'Erro interno ao buscar categorias' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getCategories(
    @Query('parent_category_id') parentCategoryId?: string,
    @Query('refresh') refresh?: string,
  ) {
    return this.productsService.getCategories(
      parentCategoryId,
      refresh === 'true',
    )
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Listar produtos por categoria do Mercado Livre' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'order_by', required: false, type: String })
  @ApiQuery({ name: 'price_min', required: false, type: Number })
  @ApiQuery({ name: 'price_max', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de produtos da categoria' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: number,
    @Query('order_by') orderBy?: string,
    @Query('price_min') priceMin?: number,
    @Query('price_max') priceMax?: number,
  ) {
    return this.productsService.getProductsByCategory({
      categoryId,
      page: page ? Number(page) : 1,
      orderBy,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    })
  }

  @Get('category/info/:categoryId')
  @ApiOperation({ summary: 'Obter informações de uma categoria' })
  @ApiResponse({ status: 200, description: 'Informações da categoria' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getCategoryInfo(@Param('categoryId') categoryId: string) {
    return this.productsService.getCategoryInfo(categoryId)
  }

  @Get('details/:id')
  @ApiOperation({ summary: 'Obter propriedades detalhadas de um produto' })
  @ApiResponse({ status: 200, description: 'Propriedades do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getProductDetails(@Param('id') id: string) {
    return this.productsService.getProductDetails(id)
  }

  @Get('skus/:id')
  @ApiOperation({ summary: 'Obter SKUs/variações de um produto' })
  @ApiResponse({ status: 200, description: 'SKUs do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getProductSkuDetails(@Param('id') id: string) {
    return this.productsService.getProductSkuDetails(id)
  }

  @Get('shipping')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter informações de frete de um produto' })
  @ApiQuery({ name: 'item_id', required: true, type: String })
  @ApiQuery({ name: 'province', required: false, type: String })
  @ApiQuery({ name: 'total_weight', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Informações de frete' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos (item_id obrigatório)' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getProductShipping(
    @Query('item_id') itemId: string,
    @Query('province') province?: string,
    @Query('total_weight') totalWeight?: number,
  ) {
    return this.productsService.getShipping1688({
      itemId,
      quantity: 1,
      province: province || '浙江省',
      city: undefined,
    })
  }

  @Get('statistics/:itemId')
  @ApiOperation({ summary: 'Obter estatísticas de vendas de um produto' })
  @ApiResponse({ status: 200, description: 'Estatísticas do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getProductStatistics(@Param('itemId') itemId: string) {
    return this.productsService.getProductStatistics(itemId)
  }

  @Get('description/:itemId')
  @ApiOperation({ summary: 'Obter descrição detalhada de um produto' })
  @ApiResponse({ status: 200, description: 'Descrição do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getProductDescription(@Param('itemId') itemId: string) {
    return this.productsService.getProductDescription(itemId)
  }

  @Post('search/concierge')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Buscar produtos via concierge (keyword ou imagem)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Palavra-chave para busca (obrigatório se image não for fornecido)',
          example: 'procure produtos de limpeza para mim',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagem para busca (obrigatório se keyword não for fornecido)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Resultados da busca com descrições' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (keyword ou image obrigatório)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @UseInterceptors(FileInterceptor('image'))
  async searchConcierge(
    @Body('keyword') keyword?: string,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productsService.searchConcierge(keyword || undefined, image)
  }

  @Get('shop/info')
  @ApiOperation({ summary: 'Obter informações da loja' })
  @ApiQuery({ name: 'member_id', required: true, type: String, description: 'ID do vendedor' })
  @ApiResponse({ status: 200, description: 'Informações da loja' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (member_id obrigatório)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getShopInfo(@Query('member_id') memberId: string) {
    if (!memberId) {
      throw new BadRequestException('O campo member_id é obrigatório!')
    }
    return this.productsService.getShopInfo({ memberId })
  }

  @Get('shop/categories')
  @ApiOperation({ summary: 'Obter categorias da loja' })
  @ApiQuery({ name: 'member_id', required: true, type: String, description: 'ID do vendedor' })
  @ApiResponse({ status: 200, description: 'Categorias da loja' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (member_id obrigatório)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getShopCategories(@Query('member_id') memberId: string) {
    if (!memberId) {
      throw new BadRequestException('O campo member_id é obrigatório!')
    }
    return this.productsService.getShopCategories({ memberId })
  }

  @Get('seller')
  @ApiOperation({ summary: 'Buscar produtos por vendedor' })
  @ApiQuery({ name: 'member_id', required: true, type: String, description: 'ID do vendedor' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página', example: 1 })
  @ApiQuery({ name: 'page_size', required: false, type: Number, description: 'Itens por página', example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Ordenação (sales, price_up, price_down)', example: 'sales' })
  @ApiQuery({ name: 'price_start', required: false, type: Number, description: 'Preço mínimo' })
  @ApiQuery({ name: 'price_end', required: false, type: Number, description: 'Preço máximo' })
  @ApiResponse({ status: 200, description: 'Produtos do vendedor' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (member_id obrigatório)' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async searchProductsBySeller(
    @Query('member_id') memberId: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('price_start') priceStart?: number,
    @Query('price_end') priceEnd?: number,
  ) {
    if (!memberId) {
      throw new BadRequestException('O campo member_id é obrigatório!')
    }
    return this.productsService.searchProductsBySeller({
      memberId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sort: sort as any,
      priceStart: priceStart ? Number(priceStart) : undefined,
      priceEnd: priceEnd ? Number(priceEnd) : undefined,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes completos de um produto' })
  @ApiResponse({ status: 200, description: 'Detalhes do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async show(@Param('id') id: string) {
    return this.productsService.show(id)
  }
}


