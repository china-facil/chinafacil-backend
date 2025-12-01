import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional } from 'class-validator'

export enum SyncType {
  initial = 'initial',
  update = 'update',
  delete = 'delete',
}

export class SyncCartDto {
  @ApiPropertyOptional({
    description: 'Carrinho local do frontend',
    example: [],
  })
  @IsOptional()
  @IsArray()
  local_cart?: any[]

  @ApiPropertyOptional({
    enum: SyncType,
    default: SyncType.update,
    description: 'Tipo de sincronização',
  })
  @IsOptional()
  @IsEnum(SyncType)
  sync_type?: SyncType
}







