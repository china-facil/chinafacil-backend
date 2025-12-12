import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateSolicitationItemDto {
  @ApiProperty({
    example: 'client',
    description: 'Quem deve tomar a ação (client ou chinafacil)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['client', 'chinafacil'])
  actionOf: string

  @ApiPropertyOptional({
    example: false,
    description: 'Se a ação do cliente é necessária',
  })
  @IsOptional()
  @IsBoolean()
  clientActionRequired?: boolean

  @ApiProperty({
    example: 'Mensagem do item',
    description: 'Mensagem/descrição do item',
  })
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiPropertyOptional({
    example: 'open',
    description: 'Status do item (open, pending, in_progress, finished)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['open', 'pending', 'in_progress', 'finished'])
  status?: string
}
