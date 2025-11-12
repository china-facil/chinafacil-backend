import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsString } from 'class-validator'

export class CreateNotificationDto {
  @ApiProperty({
    example: 'user-uuid',
    description: 'ID do usuário',
  })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    example: 'new_message',
    description: 'Tipo da notificação',
  })
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiProperty({
    description: 'Dados da notificação (JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  data: any
}

