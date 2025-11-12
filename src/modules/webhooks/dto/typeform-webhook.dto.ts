import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsString } from 'class-validator'

export class TypeformWebhookDto {
  @ApiProperty({
    description: 'Event type',
  })
  @IsString()
  @IsNotEmpty()
  event_type: string

  @ApiProperty({
    description: 'Form response',
  })
  @IsObject()
  @IsNotEmpty()
  form_response: any
}

