import { Injectable, Logger } from '@nestjs/common'
import { AnthropicService } from '../../integrations/ai-providers/anthropic/anthropic.service'
import { OpenAIService } from '../../integrations/ai-providers/openai/openai.service'
import {
  ChatCompletionDto,
  CompletionDto,
  ProductSimilarityDto,
  DetectIntentDto,
  ConciergeAskDto,
} from './dto'
import { ConciergeContexts } from './data/concierge-contexts'

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name)

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly anthropicService: AnthropicService,
  ) {}

  async completion(completionDto: CompletionDto) {
    return this.openaiService.completion(completionDto)
  }

  async chatCompletion(
    chatCompletionDto: ChatCompletionDto,
    provider: 'openai' | 'anthropic' = 'openai',
  ) {
    if (provider === 'anthropic') {
      return this.anthropicService.chatCompletion(chatCompletionDto)
    }
    return this.openaiService.chatCompletion(chatCompletionDto)
  }

  async chatCompletionStream(chatCompletionDto: ChatCompletionDto) {
    return this.openaiService.chatCompletionStream(chatCompletionDto)
  }

  async generateEmbedding(text: string) {
    return this.openaiService.generateEmbedding(text)
  }

  async completionsImage(body: any) {
    return this.openaiService.completionsImage(body)
  }

  async analyzeProductSimilarity(
    productSimilarityDto: ProductSimilarityDto,
    provider: 'openai' | 'anthropic' = 'openai',
  ) {
    if (provider === 'anthropic') {
      return this.anthropicService.analyzeProductSimilarity(
        productSimilarityDto.mercadoLivreProduct,
        productSimilarityDto.chinaProduct,
      )
    }
    return this.openaiService.analyzeProductSimilarity(
      productSimilarityDto.mercadoLivreProduct,
      productSimilarityDto.chinaProduct,
    )
  }

  async detectIntent(
    detectIntentDto: DetectIntentDto,
    provider: 'openai' | 'anthropic' = 'openai',
  ) {
    const message = detectIntentDto.message.trim()
    const conversationHistory = detectIntentDto.conversation_history || []

    this.logger.log('Detect Intent - Histórico recebido:', {
      message,
      history_count: conversationHistory.length,
      history: conversationHistory,
    })

    try {
      const intent = await this.detectUserIntent(message, conversationHistory, provider)
      return {
        status: 'success',
        data: {
          intent,
          message: detectIntentDto.message,
        },
      }
    } catch (error) {
      this.logger.error(`Erro na detecção de intenção: ${error.message}`)
      return {
        status: 'success',
        data: {
          intent: 'product_search',
          message: detectIntentDto.message,
        },
      }
    }
  }

  private async detectUserIntent(
    message: string,
    conversationHistory: DetectIntentDto['conversation_history'] = [],
    provider: 'openai' | 'anthropic' = 'openai',
  ): Promise<string> {
    const systemPrompt = `Você é um classificador de intenções. Analise a mensagem do usuário e determine se ele quer:

1. 'company_question' - Perguntas sobre importação, processos, custos, impostos, prazos, serviços, informações da China Fácil, dúvidas sobre como importar, ou PEDIDOS DE RECOMENDAÇÕES/TENDÊNCIAS/CONSELHOS sobre produtos
2. 'product_search' - APENAS quando o usuário está explicitamente procurando uma LISTA ESPECÍFICA de produtos ou fornecedores já definidos para importar

EXEMPLOS COMPANY_QUESTION:
- 'Quanto custa de impostos importar uma torneira?' = company_question
- 'Como funciona o processo de importação?' = company_question  
- 'Quais são os prazos de importação?' = company_question
- 'Quais produtos estão em alta para eu importar?' = company_question
- 'Quais são os melhores produtos da China para eu importar?' = company_question
- 'Me indique produtos tendências para eu importar' = company_question
- 'O que é mais lucrativo importar da China?' = company_question
- 'Que tipo de produto dá mais lucro?' = company_question

EXEMPLOS PRODUCT_SEARCH:
- 'Me mostre fornecedores de eletrônicos' = product_search
- 'Quero ver uma lista de produtos de decoração' = product_search
- 'Procuro fornecedor de roupas infantis' = product_search
- 'Busco produtos de beleza para importar' = product_search

REGRA PRINCIPAL:
- Se for RECOMENDAÇÃO, TENDÊNCIA, CONSELHO sobre o que importar = company_question
- Se for dúvida sobre COMO importar, custos, processos = company_question
- Se quiser VER/BUSCAR produtos/fornecedores já definidos específicos = product_search
- Use o histórico de conversas para entender melhor o contexto
- Na dúvida, sempre priorize company_question

Responda APENAS com: company_question OU product_search`

    const messages: ChatCompletionDto['messages'] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory)
    }

    messages.push({
      role: 'user',
      content: message,
    })

    const response = await this.chatCompletion(
      {
        messages,
        temperature: 0.1,
        maxTokens: 20,
        model: 'gpt-4',
      },
      provider,
    )

    const content = response.message?.content || ''
    if (!content) {
      throw new Error('Resposta inválida da IA para detecção de intenção')
    }

    const intent = content.trim().toLowerCase()

    if (intent.includes('company_question')) {
      return 'company_question'
    } else if (intent.includes('product_search')) {
      return 'product_search'
    }

    return 'product_search'
  }

  async askConcierge(
    conciergeAskDto: ConciergeAskDto,
    provider: 'openai' | 'anthropic' = 'openai',
  ) {
    const question = conciergeAskDto.question.trim()
    const conversationHistory = conciergeAskDto.conversation_history || []

    this.logger.log('Concierge Ask - Histórico recebido:', {
      question,
      history_count: conversationHistory.length,
      history: conversationHistory,
    })

    try {
      const response = await this.generateAIResponse(question, conversationHistory, provider)
      return {
        status: 'success',
        data: {
          response,
          question: conciergeAskDto.question,
        },
      }
    } catch (error) {
      this.logger.error(`Erro na IA do Concierge: ${error.message}`)
      return {
        status: 'error',
        data: {
          response:
            'Desculpe, não consegui processar sua pergunta no momento. Tente novamente em alguns instantes.',
          question: conciergeAskDto.question,
        },
      }
    }
  }

  private async generateAIResponse(
    question: string,
    conversationHistory: ConciergeAskDto['conversation_history'] = [],
    provider: 'openai' | 'anthropic' = 'openai',
  ): Promise<string> {
    const triage = await this.performTriage(question, conversationHistory, provider)

    if (!triage) {
      return 'Não consegui classificar sua pergunta. Pode reformular com mais detalhes sobre custos/prazos/fluxo de caixa?'
    }

    if (triage.final === true && triage.answer) {
      return this.compact(triage.answer)
    }

    const contextIds = triage.context_ids || []

    if (!Array.isArray(contextIds) || contextIds.length === 0) {
      return 'A triagem solicitou contexto, mas não informou nenhum válido.'
    }

    return this.generateFinalResponse(
      question,
      contextIds,
      triage.reason || null,
      conversationHistory,
      provider,
    )
  }

  private async performTriage(
    question: string,
    conversationHistory: ConciergeAskDto['conversation_history'] = [],
    provider: 'openai' | 'anthropic' = 'openai',
  ): Promise<{ final: boolean; answer?: string; context_ids?: string[]; reason?: string } | null> {
    const triageSystem = this.getTriageSystemPrompt()

    const messages: ChatCompletionDto['messages'] = [
      {
        role: 'system',
        content: triageSystem,
      },
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory)
    }

    messages.push({
      role: 'user',
      content: question,
    })

    const response = await this.chatCompletion(
      {
        messages,
        temperature: 0.1,
        maxTokens: 150,
        model: 'gpt-4',
      },
      provider,
    )

    const triageText = response.message?.content?.trim() || ''
    if (!triageText) {
      return null
    }

    return this.safeParseJSON(triageText)
  }

  private async generateFinalResponse(
    question: string,
    contextIds: string[],
    reason: string | null,
    conversationHistory: ConciergeAskDto['conversation_history'] = [],
    provider: 'openai' | 'anthropic' = 'openai',
  ): Promise<string> {
    const contexts = ConciergeContexts.getContexts()
    const selectedContexts: string[] = []

    for (const id of contextIds.slice(0, 3)) {
      if (contexts[id]) {
        selectedContexts.push(`(${id}):\n${contexts[id].trim()}`)
      } else {
        selectedContexts.push(`(${id}):\n[CONTEXT NOT FOUND]`)
      }
    }

    const contextContent = selectedContexts.join('\n\n---\n\n')
    const answerSystemBase = this.getAnswerSystemPrompt()

    const messages: ChatCompletionDto['messages'] = [
      {
        role: 'system',
        content: answerSystemBase,
      },
      {
        role: 'system',
        content: `CONTEXTOS INTERNOS:\n${contextContent}`,
      },
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory)
    }

    messages.push({
      role: 'user',
      content: question,
    })

    if (reason) {
      messages.push({
        role: 'system',
        content: `Observação da triagem: ${reason}`,
      })
    }

    const response = await this.chatCompletion(
      {
        messages,
        temperature: 0.3,
        maxTokens: 1000,
        model: 'gpt-4',
      },
      provider,
    )

    const finalText = response.message?.content?.trim() || ''
    if (!finalText) {
      throw new Error('Resposta inválida da IA')
    }

    return this.compact(finalText)
  }

  private getTriageSystemPrompt(): string {
    const catalogSummary = ConciergeContexts.getCatalogSummaryFormatted()

    return `Você é um roteador de triagem da China Fácil.

DECISÃO: Responda direto OU busque contextos específicos?

JSON OBRIGATÓRIO:
- Resposta direta: {"final": true, "answer": "<resposta concisa>"}
- Precisa contexto: {"final": false, "context_ids": ["<id1>", "<id2>", "<id3>"], "reason": "<motivo>"}

CONTEXTOS DISPONÍVEIS:
${catalogSummary}

REGRAS IMPORTANTES:
- SOMENTE JSON na resposta
- Máximo 3 contextos por vez
- Para perguntas sobre a China Fácil (empresa, serviços, contatos, etc.) SEMPRE use o contexto 'Informacoes_China_Facil'
- Use 'final: true' apenas para perguntas muito simples como cumprimentos ou agradecimentos`
  }

  private getAnswerSystemPrompt(): string {
    return `Você é um assistente da China Fácil.

Responda de forma direta, prática e correta para empresas que importam da China para o Brasil.

FORMATAÇÃO OBRIGATÓRIA:
- Use parágrafos separados para diferentes tópicos
- Deixe uma linha em branco entre parágrafos
- Use **negrito** para destacar informações importantes
- Organize listas com marcadores quando relevante
- Mantenha um tom profissional mas acessível

CONTEÚDO:
- Se um dado não estiver no contexto, seja transparente e explique como estimar/obter
- Priorize clareza sobre custos, prazos e impacto no fluxo de caixa
- Sempre termine com uma orientação clara ou próximo passo`
  }

  private safeParseJSON(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return null
      }
      const decoded = JSON.parse(jsonMatch[0])
      return decoded
    } catch (error) {
      return null
    }
  }

  private compact(str: string): string {
    let result = str.trim()
    result = result.replace(/[ \t]+/g, ' ')
    result = result.replace(/\n{4,}/g, '\n\n\n')
    return result
  }
}


