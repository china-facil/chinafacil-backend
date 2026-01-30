import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class SearchConciergeDto {
  @ApiPropertyOptional({
    example: 'procure produtos de limpeza para mim',
    description: 'Palavra-chave para busca (obrigatório se imgUrl não for fornecido)',
  })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/search-images/abc123def456.jpg',
    description: 'URL da imagem já enviada (obrigatório se keyword não for fornecido)',
  })
  @IsOptional()
  @IsString()
  imgUrl?: string
}
