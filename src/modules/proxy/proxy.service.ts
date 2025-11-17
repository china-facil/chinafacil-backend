import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosRequestConfig } from 'axios'

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name)

  constructor(private readonly httpService: HttpService) {}

  async proxyImage(imageUrl: string): Promise<{ data: Buffer; contentType: string }> {
    if (!imageUrl) {
      throw new Error('URL da imagem é obrigatória')
    }

    if (!this.isValidUrl(imageUrl)) {
      throw new Error('URL da imagem inválida')
    }

    try {
      const config: AxiosRequestConfig = {
        headers: {
          Accept: 'image/*',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Referer: '',
          'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000,
        responseType: 'arraybuffer',
        maxRedirects: 5,
      }

      const response = await firstValueFrom(
        this.httpService.get(imageUrl, config),
      )

      const contentType =
        response.headers['content-type'] || 'image/jpeg'

      return {
        data: Buffer.from(response.data),
        contentType,
      }
    } catch (error: any) {
      this.logger.error('Erro ao fazer proxy de imagem', {
        url: imageUrl,
        error: error.message,
        status: error.response?.status,
      })
      throw new Error(
        `Erro ao carregar imagem: ${error.response?.status || error.message}`,
      )
    }
  }

  async proxyPaises(): Promise<any> {
    const url = 'https://api-paises.pages.dev/paises.json'

    try {
      const config: AxiosRequestConfig = {
        headers: {
          Accept: '*/*',
        },
        timeout: 10000,
      }

      const response = await firstValueFrom(
        this.httpService.get(url, config),
      )

      return response.data
    } catch (error: any) {
      this.logger.error('Erro ao obter lista de países', {
        error: error.message,
        status: error.response?.status,
      })
      throw new Error('Erro ao obter lista de países')
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }
}


