import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class SearchConciergeDto {
  @ApiPropertyOptional({
    example: 'fone de ouvido bluetooth',
    description: 'Palavra-chave para busca de produtos',
  })
  @IsOptional()
  @IsString()
  keyword?: string
}

export interface SearchConciergeResponse {
  status: string
  data: {
    messageUser: boolean
    items: any[]
    description: {
      contexto: string
      descricao: string
      conclusao: string
    } | null
  }
}



