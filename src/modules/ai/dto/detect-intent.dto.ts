import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ConversationHistoryDto {
  @ApiProperty({
    example: 'user',
    description: 'Role da mensagem (user, assistant, system)',
  })
  @IsString()
  @IsNotEmpty()
  role: string

  @ApiProperty({
    example: 'o que a china facil faz?',
    description: 'Conteúdo da mensagem',
  })
  @IsString()
  @IsNotEmpty()
  content: string
}

export class DetectIntentDto {
  @ApiProperty({
    example: 'o que a china facil faz?',
    description: 'Mensagem do usuário para detectar intenção',
  })
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiPropertyOptional({
    type: [ConversationHistoryDto],
    description: 'Histórico da conversa',
    example: [
      {
        role: 'user',
        content: 'o que a china facil faz?',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationHistoryDto)
  conversation_history?: ConversationHistoryDto[]
}
