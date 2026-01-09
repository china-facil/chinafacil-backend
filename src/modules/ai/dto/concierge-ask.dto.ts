import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ConversationHistoryItemDto {
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

export class ConciergeAskDto {
  @ApiProperty({
    example: 'o que a china facil faz?',
    description: 'Pergunta do usuário',
  })
  @IsString()
  @IsNotEmpty()
  question: string

  @ApiPropertyOptional({
    type: [ConversationHistoryItemDto],
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
  @Type(() => ConversationHistoryItemDto)
  conversation_history?: ConversationHistoryItemDto[]
}
