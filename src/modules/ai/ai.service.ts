import { Injectable, Logger } from '@nestjs/common'
import { AnthropicService } from '../../integrations/ai-providers/anthropic/anthropic.service'
import { OpenAIService } from '../../integrations/ai-providers/openai/openai.service'
import {
  AskConciergeDto,
  ChatCompletionDto,
  ChatMessageDto,
  CompletionDto,
  DetectIntentDto,
  IntentType,
  ProductSimilarityDto,
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

  async detectIntent(dto: DetectIntentDto): Promise<{ intent: IntentType; message: string }> {
    const { message, conversation_history = [] } = dto

    this.logger.log(`🎯 Detect Intent - Histórico recebido: ${JSON.stringify({
      message,
      history_count: conversation_history.length,
    })}`)

    try {
      const intent = await this.detectUserIntent(message, conversation_history)

      return {
        intent,
        message,
      }
    } catch (error) {
      this.logger.error(`Erro na detecção de intenção: ${error.message}`)
      return {
        intent: 'product_search',
        message,
      }
    }
  }

  async askConcierge(dto: AskConciergeDto): Promise<{ response: string; question: string }> {
    const { question, conversation_history = [] } = dto

    this.logger.log(`🤖 Concierge Ask - Histórico recebido: ${JSON.stringify({
      question,
      history_count: conversation_history.length,
    })}`)

    try {
      const response = await this.generateAIResponse(question, conversation_history)

      return {
        response,
        question,
      }
    } catch (error) {
      this.logger.error(`Erro na IA do Concierge: ${error.message}`)
      return {
        response:
          'Desculpe, não consegui processar sua pergunta no momento. Tente novamente em alguns instantes.',
        question,
      }
    }
  }

  private async detectUserIntent(
    message: string,
    conversationHistory: ChatMessageDto[] = [],
  ): Promise<IntentType> {
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
- 'Me fale mais da china facil' = company_question
- 'Quero saber mais sobre a empresa' = company_question
- 'Quem é a China Fácil?' = company_question
- 'O que vocês fazem?' = company_question
- 'Ola' = company_question
- 'Oi' = company_question
- 'Bom dia' = company_question

EXEMPLOS PRODUCT_SEARCH:
- 'Me mostre fornecedores de eletrônicos' = product_search
- 'Quero ver uma lista de produtos de decoração' = product_search
- 'Procuro fornecedor de roupas infantis' = product_search
- 'Busco produtos de beleza para importar' = product_search

REGRA PRINCIPAL:
- Se for RECOMENDAÇÃO, TENDÊNCIA, CONSELHO sobre o que importar = company_question
- Se for dúvida sobre COMO importar, custos, processos = company_question
- Se for pergunta sobre a EMPRESA China Fácil = company_question
- Se for SAUDAÇÃO ou CUMPRIMENTO = company_question
- Se quiser VER/BUSCAR produtos/fornecedores já definidos específicos = product_search
- Use o histórico de conversas para entender melhor o contexto
- Na dúvida, sempre priorize company_question

Responda APENAS com: company_question OU product_search`

    const messages: ChatMessageDto[] = [
      { role: 'system', content: systemPrompt },
    ]

    if (conversationHistory.length > 0) {
      const filteredHistory = conversationHistory.filter(
        (msg) => !msg.content?.includes('Resultados para:'),
      )
      messages.push(...filteredHistory)
    }

    messages.push({ role: 'user', content: message })

    this.logger.log(`🎯 Detect Intent - Chamando OpenAI com mensagens: ${JSON.stringify(messages.map(m => ({ role: m.role, content: m.content?.substring(0, 100) })))}`)

    const response = await this.openaiService.chatCompletion({
      model: 'gpt-4',
      messages,
      temperature: 0.1,
      maxTokens: 20,
    })

    const intentText = ((response as any).message?.content || '').trim().toLowerCase()

    this.logger.log(`🎯 Detect Intent - Resposta da OpenAI: "${intentText}"`)

    if (intentText.includes('company_question')) {
      this.logger.log(`🎯 Detect Intent - Classificado como: company_question`)
      return 'company_question'
    } else if (intentText.includes('product_search')) {
      this.logger.log(`🎯 Detect Intent - Classificado como: product_search`)
      return 'product_search'
    }

    this.logger.log(`🎯 Detect Intent - Fallback para: company_question (resposta não reconhecida)`)
    return 'company_question'
  }

  private async generateAIResponse(
    question: string,
    conversationHistory: ChatMessageDto[] = [],
  ): Promise<string> {
    const triage = await this.performTriage(question, conversationHistory)

    if (!triage) {
      return 'Não consegui classificar sua pergunta. Pode reformular com mais detalhes sobre custos/prazos/fluxo de caixa?'
    }

    if (triage.final === true) {
      return this.compact(triage.answer || '')
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
    )
  }

  private async performTriage(
    question: string,
    conversationHistory: ChatMessageDto[] = [],
  ): Promise<{ final: boolean; answer?: string; context_ids?: string[]; reason?: string } | null> {
    const triageSystem = this.getTriageSystemPrompt()

    const messages: ChatMessageDto[] = [{ role: 'system', content: triageSystem }]

    if (conversationHistory.length > 0) {
      messages.push(...conversationHistory)
    }

    messages.push({ role: 'user', content: question })

    const response = await this.openaiService.chatCompletion({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.1,
      maxTokens: 150,
    })

    const triageText = ((response as any).message?.content || '').trim()
    return this.safeParseJSON(triageText)
  }

  private async generateFinalResponse(
    question: string,
    contextIds: string[],
    reason: string | null,
    conversationHistory: ChatMessageDto[] = [],
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

    const messages: ChatMessageDto[] = [
      { role: 'system', content: answerSystemBase },
      { role: 'system', content: `CONTEXTOS INTERNOS:\n${contextContent}` },
    ]

    if (conversationHistory.length > 0) {
      messages.push(...conversationHistory)
    }

    messages.push({ role: 'user', content: question })

    if (reason) {
      messages.push({ role: 'system', content: `Observação da triagem: ${reason}` })
    }

    const response = await this.openaiService.chatCompletion({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      maxTokens: 1000,
    })

    const finalText = ((response as any).message?.content || '').trim()
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

  private safeParseJSON(text: string): {
    final: boolean
    answer?: string
    context_ids?: string[]
    reason?: string
  } | null {
    try {
      const decoded = JSON.parse(text)
      return decoded
    } catch {
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


