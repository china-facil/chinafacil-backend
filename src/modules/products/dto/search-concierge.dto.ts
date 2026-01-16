import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class SearchConciergeDto {
  @ApiPropertyOptional({
    example: 'procure produtos de limpeza para mim',
    description: 'Palavra-chave para busca (obrigatório se image não for fornecido)',
  })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Imagem para busca (obrigatório se keyword não for fornecido)',
  })
  @IsOptional()
  image?: Express.Multer.File
}
