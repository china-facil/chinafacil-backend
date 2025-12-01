import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class GenericWebhookDto {
  @ApiPropertyOptional({
    description: 'Source da webhook',
    default: 'generic',
  })
  @IsOptional()
  @IsString()
  source?: string

  @ApiProperty({
    description: 'Payload da webhook',
  })
  @IsObject()
  @IsNotEmpty()
  payload: any
}


