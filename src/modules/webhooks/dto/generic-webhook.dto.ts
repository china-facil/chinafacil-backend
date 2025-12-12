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
    example: {
      event: 'user.created',
      data: {
        userId: 'user-123',
        email: 'user@example.com',
      },
    },
    description: 'Payload da webhook (objeto JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  payload: any
}


