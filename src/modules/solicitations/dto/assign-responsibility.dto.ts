import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsString } from 'class-validator'

export class AssignResponsibilityDto {
  @ApiProperty({
    example: 'User',
    description: 'Tipo do responsável (User ou Client)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['User', 'Client'])
  responsibleType: string

  @ApiProperty({
    example: 'user-uuid',
    description: 'ID do responsável',
  })
  @IsString()
  @IsNotEmpty()
  responsibleId: string
}

