import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsString } from 'class-validator'

export class GenericWebhookDto {
  @ApiProperty({
    description: 'Source da webhook',
  })
  @IsString()
  @IsNotEmpty()
  source: string

  @ApiProperty({
    description: 'Payload da webhook',
  })
  @IsObject()
  @IsNotEmpty()
  payload: any
}


