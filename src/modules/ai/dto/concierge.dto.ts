import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ChatMessageDto } from './chat-message.dto'

export class AskConciergeDto {
  @ApiProperty({
    example: 'Quanto custa importar uma torneira?',
    description: 'Pergunta do usuário',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question: string

  @ApiPropertyOptional({
    type: [ChatMessageDto],
    description: 'Histórico da conversa',
  })
  @IsOptional()
  @IsArray()
  conversation_history?: ChatMessageDto[]
}

export class DetectIntentDto {
  @ApiProperty({
    example: 'Quero ver fornecedores de eletrônicos',
    description: 'Mensagem do usuário para detectar intenção',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string

  @ApiPropertyOptional({
    type: [ChatMessageDto],
    description: 'Histórico da conversa',
  })
  @IsOptional()
  @IsArray()
  conversation_history?: ChatMessageDto[]
}

export type IntentType = 'company_question' | 'product_search'

export interface DetectIntentResponse {
  status: string
  data: {
    intent: IntentType
    message: string
  }
}

export interface AskConciergeResponse {
  status: string
  data: {
    response: string
    question: string
  }
}



