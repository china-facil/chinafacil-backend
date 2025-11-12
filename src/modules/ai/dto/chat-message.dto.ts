import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ChatMessageDto {
  @ApiProperty({
    example: 'user',
    description: 'Role (system, user, assistant)',
  })
  @IsString()
  @IsNotEmpty()
  role: string

  @ApiProperty({
    example: 'Olá, como você está?',
    description: 'Conteúdo da mensagem',
  })
  @IsString()
  @IsNotEmpty()
  content: string
}

export class ChatCompletionDto {
  @ApiProperty({
    type: [ChatMessageDto],
    description: 'Mensagens do chat',
  })
  @IsArray()
  @IsNotEmpty()
  messages: ChatMessageDto[]

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

