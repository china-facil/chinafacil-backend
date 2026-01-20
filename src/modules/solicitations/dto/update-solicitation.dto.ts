import { OmitType, PartialType } from '@nestjs/swagger'
import { CreateSolicitationDto } from './create-solicitation.dto'

export class UpdateSolicitationDto extends PartialType(
  OmitType(CreateSolicitationDto, ['userId', 'cart', 'pricing_data'] as const)
) {}


