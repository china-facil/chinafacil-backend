import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AnthropicService } from '../../integrations/ai-providers/anthropic/anthropic.service'
import { OpenAIService } from '../../integrations/ai-providers/openai/openai.service'
import { ProductsModule } from '../products/products.module'
import { AIController } from './ai.controller'
import { AIService } from './ai.service'

@Module({
  imports: [ConfigModule, forwardRef(() => ProductsModule)],
  controllers: [AIController],
  providers: [AIService, OpenAIService, AnthropicService],
  exports: [AIService],
})
export class AIModule {}


