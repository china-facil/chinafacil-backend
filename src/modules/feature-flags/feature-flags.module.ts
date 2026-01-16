import { Module } from '@nestjs/common'
import { FeatureFlagsService } from './feature-flags.service'
import { FeatureFlagsController } from './feature-flags.controller'
import { DatabaseModule } from '../../database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
