import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ProxyService } from './proxy.service'

@ApiTags('proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('image')
  @ApiOperation({ summary: 'Proxy para imagens externas' })
  @ApiQuery({
    name: 'url',
    required: true,
    description: 'URL da imagem a ser proxyada',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Imagem retornada com sucesso',
    content: {
      'image/*': {},
    },
  })
  @ApiResponse({ status: 400, description: 'URL inválida ou não fornecida' })
  @ApiResponse({ status: 500, description: 'Erro ao carregar imagem' })
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    try {
      const { data, contentType } = await this.proxyService.proxyImage(url)

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      })

      res.send(data)
    } catch (error: any) {
      if (error.message.includes('obrigatória') || error.message.includes('inválida')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
      }
      throw new HttpException(
        error.message || 'Erro ao carregar imagem',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('paises')
  @ApiOperation({ summary: 'Obter lista de países via proxy' })
  @ApiResponse({
    status: 200,
    description: 'Lista de países retornada com sucesso',
  })
  @ApiResponse({ status: 500, description: 'Erro ao obter lista de países' })
  async proxyPaises() {
    try {
      const paises = await this.proxyService.proxyPaises()
      return paises
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erro ao obter lista de países',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}



