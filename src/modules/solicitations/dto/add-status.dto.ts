import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class AddStatusDto {
  @ApiProperty({
    example: 'step1:analyzing_costs_logistics',
    description: 'Status da solicitação no formato step:status',
  })
  @IsString()
  @IsNotEmpty()
  status: string

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Data limite para o status (opcional)',
  })
  @IsOptional()
  @IsString()
  time_date?: string
}









