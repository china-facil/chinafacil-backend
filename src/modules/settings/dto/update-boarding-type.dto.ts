import { PartialType } from '@nestjs/swagger'
import { CreateBoardingTypeDto } from './create-boarding-type.dto'

export class UpdateBoardingTypeDto extends PartialType(CreateBoardingTypeDto) {}


