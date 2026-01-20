import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateCartDto, SyncCartDto, UpdateCartDto } from './dto'
import { CartPdfService } from './services/cart-pdf.service'

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartPdfService: CartPdfService,
  ) {}

  async create(userId: string, createCartDto: CreateCartDto) {
    const existingCart = await this.prisma.cart.findFirst({
      where: { userId },
    })

    if (existingCart) {
      return this.update(existingCart.id, createCartDto)
    }

    const cart = await this.prisma.cart.create({
      data: {
        userId,
        ...createCartDto,
      },
    })

    return cart
  }

  async findByUser(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return cart
  }

  async findAll() {
    const isTest = process.env.NODE_ENV === 'test'
    
    const carts = await this.prisma.cart.findMany({
      ...(isTest && { take: 100 }),
      ...(!isTest && { orderBy: { createdAt: 'desc' } }),
      include: {
        solicitation: {
          select: {
            id: true,
            code: true,
            status: true,
          },
        },
      },
    })

    return carts
  }

  async adminList(params: {
    itemsPerPage?: number
    page?: number
    search?: string
    dateStart?: string
    dateEnd?: string
    order?: 'asc' | 'desc'
    orderKey?: string
  }) {
    const {
      itemsPerPage = 25,
      page = 1,
      search,
      dateStart,
      dateEnd,
      order = 'desc',
      orderKey = 'updatedAt',
    } = params

    const skip = (page - 1) * itemsPerPage
    const take = itemsPerPage

    let userIds: string[] | undefined

    if (search) {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        },
        select: { id: true },
      })
      userIds = users.map(u => u.id)
    }

    const where: any = {
      solicitationId: null,
    }

    if (userIds !== undefined) {
      where.userId = { in: userIds }
    }

    if (dateStart && dateEnd) {
      where.updatedAt = {
        gte: new Date(`${dateStart} 00:00:00`),
        lte: new Date(`${dateEnd} 23:59:59`),
      }
    }

    const [carts, total] = await Promise.all([
      this.prisma.cart.findMany({
        where,
        skip,
        take,
        orderBy: {
          [orderKey]: order,
        },
      }),
      this.prisma.cart.count({ where }),
    ])

    const userIdsFromCarts = [...new Set(carts.map(c => c.userId))]
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIdsFromCarts } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })
    const usersMap = new Map(users.map(u => [u.id, u]))

    const cartsWithCalculations = carts.map(cart => {
      let items: any = cart.items
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items)
        } catch {
          items = []
        }
      }

      let itemsCount = 0
      let totalValue = 0

      if (Array.isArray(items)) {
        for (const item of items) {
          if (item?.variations && Array.isArray(item.variations)) {
            itemsCount += item.variations.length
            for (const variation of item.variations) {
              const price = parseFloat(variation.price || 0)
              const quantity = parseFloat(variation.quantity || 0)
              totalValue += price * quantity
            }
          }
        }
      }

      return {
        ...cart,
        user: usersMap.get(cart.userId) || null,
        items_count: itemsCount,
        total_value: totalValue,
        created_at: cart.createdAt,
        updated_at: cart.updatedAt,
        user_id: cart.userId,
      }
    })

    return {
      data: cartsWithCalculations,
      current_page: page,
      last_page: Math.ceil(total / itemsPerPage),
      per_page: itemsPerPage,
      total,
    }
  }

  async update(id: string, updateCartDto: UpdateCartDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
    })

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado')
    }

    const updatedCart = await this.prisma.cart.update({
      where: { id },
      data: updateCartDto,
    })

    return updatedCart
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    })

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado')
    }

    await this.prisma.cart.delete({
      where: { id: cart.id },
    })

    return {
      message: 'Carrinho limpo com sucesso',
    }
  }

  private mergeCartItems(
    localItems: any[],
    backendItems: any[],
    syncType: string = 'update',
  ): any[] {
    const merged: any[] = []
    const backendMap = new Map<string, any>()

    // Cria mapa dos itens do backend
    for (const item of backendItems) {
      backendMap.set(item.id, item)
    }

    // Processa itens locais
    for (const localItem of localItems) {
      const productId = localItem.id

      if (backendMap.has(productId)) {
        // Item existe no backend - estratégia depende do tipo de sync
        const backendItem = backendMap.get(productId)

        if (syncType === 'update') {
          // Para update: Prioridade TOTAL ao local (mantém quantidades alteradas)
          merged.push(localItem)
        } else if (syncType === 'initial') {
          // Para initial: Prioridade ao LOCAL nas quantidades, mas mescla variações
          const mergedVariations = this.mergeVariations(
            backendItem.variations || [],
            localItem.variations || [],
            'local',
          )
          merged.push({
            ...localItem,
            variations: mergedVariations,
          })
        }
        // Para delete: não adiciona (será removido)

        backendMap.delete(productId)
      } else {
        // Item só existe localmente
        if (syncType !== 'delete') {
          merged.push(localItem)
        }
      }
    }

    // Estratégia baseada no tipo de sincronização:
    if (syncType === 'initial' || syncType === 'update') {
      // Adiciona itens que só existem no backend (de outros navegadores)
      for (const item of backendMap.values()) {
        merged.push(item)
      }
    }
    // Para delete: NÃO adiciona itens que só existem no backend (foram excluídos)

    return merged
  }

  private mergeVariations(
    backendVariations: any[],
    localVariations: any[],
    priority: string = 'backend',
  ): any[] {
    const merged: any[] = []
    const localMap = new Map<string, any>()

    // Função auxiliar para criar chave consistente
    const variationKey = (variation: any): string => {
      const colorVid = variation?.color?.vid ? String(variation.color.vid) : ''
      const specVid =
        variation?.specification?.vid !== null &&
        variation?.specification?.vid !== undefined
          ? String(variation.specification.vid)
          : ''
      return `${colorVid}_${specVid}`
    }

    // Cria mapa das variações locais
    for (const variation of localVariations) {
      const key = variationKey(variation)
      localMap.set(key, variation)
    }

    if (priority === 'local') {
      // Prioridade ao LOCAL (localStorage)
      const processedKeys = new Set<string>()

      for (const localVariation of localVariations) {
        const key = variationKey(localVariation)
        merged.push(localVariation) // Usa dados locais
        processedKeys.add(key)
      }

      // Adiciona variações que só existem no backend
      for (const backendVariation of backendVariations) {
        const key = variationKey(backendVariation)
        if (!processedKeys.has(key)) {
          merged.push(backendVariation)
        }
      }
    } else {
      // Prioridade ao BACKEND
      for (const backendVariation of backendVariations) {
        const key = variationKey(backendVariation)
        if (localMap.has(key)) {
          // Variação existe localmente - usa dados do BACKEND
          merged.push(backendVariation)
          localMap.delete(key)
        } else {
          // Variação só existe no backend
          merged.push(backendVariation)
        }
      }

      // Adiciona variações que só existem localmente (novos itens)
      for (const variation of localMap.values()) {
        merged.push(variation)
      }
    }

    return merged
  }

  async sync(userId: string, syncCartDto: SyncCartDto) {
    const localCart = syncCartDto.local_cart || []
    const syncType = syncCartDto.sync_type || 'update'

    this.logger.debug(`Sincronizando carrinho para usuário ${userId}`, {
      localCartCount: localCart.length,
      syncType,
    })

    // Buscar carrinho no backend (sem solicitation_id)
    const backendCart = await this.prisma.cart.findFirst({
      where: {
        userId,
        solicitationId: null,
      },
    })

    // Se não há carrinho no backend
    if (!backendCart) {
      if (localCart.length > 0) {
        // Criar novo carrinho com itens locais
        this.logger.debug('Criando novo carrinho no backend')
        const newCart = await this.prisma.cart.create({
          data: {
            userId,
            items: localCart,
          },
        })

        return {
          status: 'success',
          data: {
            id: newCart.id,
            user_id: newCart.userId,
            items: newCart.items,
          },
          message: 'Carrinho sincronizado com sucesso',
        }
      } else {
        // Carrinho vazio - não criar
        this.logger.debug('Carrinho local vazio - não criando carrinho no backend')
        return {
          status: 'success',
          data: {
            items: [],
            id: null,
            user_id: userId,
          },
          message: 'Carrinho vazio sincronizado',
        }
      }
    }

    // Há carrinho no backend
    const backendItems = Array.isArray(backendCart.items)
      ? backendCart.items
      : []

    this.logger.debug('Mesclando carrinho existente', {
      backendItemsCount: backendItems.length,
      localCartCount: localCart.length,
      syncType,
    })

    if (localCart.length === 0) {
      // Carrinho local vazio
      if (syncType === 'delete') {
        // Limpar carrinho no backend
        this.logger.debug('Limpando carrinho no backend (delete)')
        const updatedCart = await this.prisma.cart.update({
          where: { id: backendCart.id },
          data: {
            items: [],
          },
        })

        return {
          status: 'success',
          data: {
            id: updatedCart.id,
            user_id: updatedCart.userId,
            items: [],
          },
          message: 'Carrinho sincronizado com sucesso',
        }
      } else {
        // Mantém carrinho do backend
        this.logger.debug('Mantendo carrinho do backend (initial/update)')
        return {
          status: 'success',
          data: {
            id: backendCart.id,
            user_id: backendCart.userId,
            items: backendItems,
          },
          message: 'Carrinho sincronizado com sucesso',
        }
      }
    }

    // Mesclar itens
    const mergedItems = this.mergeCartItems(localCart, backendItems, syncType)

    this.logger.debug('Itens mesclados', {
      mergedItemsCount: mergedItems.length,
    })

    const updatedCart = await this.prisma.cart.update({
      where: { id: backendCart.id },
      data: {
        items: mergedItems,
      },
    })

    return {
      status: 'success',
      data: {
        id: updatedCart.id,
        user_id: updatedCart.userId,
        items: Array.isArray(updatedCart.items) ? updatedCart.items : [],
      },
      message: 'Carrinho sincronizado com sucesso',
    }
  }

  async generateReport(data: any, detailed: boolean = false): Promise<Buffer> {
    this.logger.log('Gerando relatório PDF', {
      hasData: !!data,
      detailed,
      produtosCount: data?.produtos?.length || 0,
    })

    if (!data || !data.produtos || !Array.isArray(data.produtos) || data.produtos.length === 0) {
      throw new NotFoundException('Dados inválidos: produtos não encontrados')
    }

    return this.cartPdfService.generatePDF(data, detailed)
  }
}


