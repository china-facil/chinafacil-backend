import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CompletionDto {
  @ApiProperty({
    example: 'Traduza este texto para português',
    description: 'Prompt',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string

  @ApiPropertyOptional({
    example: 0.7,
    description: 'Temperatura (0-1)',
  })
  @IsOptional()
  @IsNumber()
  temperature?: number

  @ApiPropertyOptional({
    example: 1000,
    description: 'Máximo de tokens',
  })
  @IsOptional()
  @IsNumber()
  maxTokens?: number

  @ApiPropertyOptional({
    example: 'gpt-4',
    description: 'Modelo a ser usado',
  })
  @IsOptional()
  @IsString()
  model?: string
}


