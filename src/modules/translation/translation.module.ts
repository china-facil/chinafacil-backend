import { HttpModule } from '@nestjs/axios'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GoogleTranslationService } from '../../integrations/translation/google/google-translation.service'
import { TranslationController } from './translation.controller'
import { TranslationService } from './translation.service'

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    CacheModule.register({
      ttl: 86400000 * 7,
    }),
  ],
  controllers: [TranslationController],
  providers: [
    TranslationService,
    GoogleTranslationService,
  ],
  exports: [TranslationService],
})
export class TranslationModule {}
