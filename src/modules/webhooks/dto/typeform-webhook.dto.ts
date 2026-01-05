import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsString } from 'class-validator'

export class TypeformWebhookDto {
  @ApiProperty({
    example: 'form_response',
    description: 'Tipo do evento (form_response, etc)',
  })
  @IsString()
  @IsNotEmpty()
  event_type: string

  @ApiProperty({
    example: {
      form_id: 'abc123',
      token: 'def456',
      answers: [],
    },
    description: 'Resposta do formulário Typeform (objeto JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  form_response: any
}


