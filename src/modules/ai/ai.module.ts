import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AnthropicService } from '../../integrations/ai-providers/anthropic/anthropic.service'
import { OpenAIService } from '../../integrations/ai-providers/openai/openai.service'
import { AIController } from './ai.controller'
import { AIService } from './ai.service'

@Module({
  imports: [ConfigModule],
  controllers: [AIController],
  providers: [AIService, OpenAIService, AnthropicService],
  exports: [AIService],
})
export class AIModule {}

