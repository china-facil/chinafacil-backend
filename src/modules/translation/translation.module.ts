import { HttpModule } from '@nestjs/axios'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AzureTranslatorService } from '../../integrations/translation/azure/azure-translator.service'
import { GoogleTranslationService } from '../../integrations/translation/google/google-translation.service'
import { TranslationController } from './translation.controller'
import { TranslationService } from './translation.service'

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    CacheModule.register({
      ttl: 86400000,
    }),
  ],
  controllers: [TranslationController],
  providers: [
    TranslationService,
    AzureTranslatorService,
    GoogleTranslationService,
  ],
  exports: [TranslationService],
})
export class TranslationModule {}


