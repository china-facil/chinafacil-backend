import { Test, TestingModule } from '@nestjs/testing'
import { ProductNormalizerService } from './product-normalizer.service'
import { Alibaba1688Normalizer } from './alibaba-1688.normalizer'
import { AlibabaIntlNormalizer } from './alibaba-intl.normalizer'

describe('ProductNormalizerService', () => {
  let service: ProductNormalizerService
  let alibaba1688Normalizer: Alibaba1688Normalizer
  let alibabaIntlNormalizer: AlibabaIntlNormalizer

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductNormalizerService,
        {
          provide: Alibaba1688Normalizer,
          useValue: {
            normalizeSearchItem: jest.fn(),
            normalizeDetailedItem: jest.fn(),
          },
        },
        {
          provide: AlibabaIntlNormalizer,
          useValue: {
            normalizeSearchItem: jest.fn(),
            normalizeDetailedItem: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<ProductNormalizerService>(ProductNormalizerService)
    alibaba1688Normalizer = module.get<Alibaba1688Normalizer>(Alibaba1688Normalizer)
    alibabaIntlNormalizer = module.get<AlibabaIntlNormalizer>(AlibabaIntlNormalizer)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('normalize1688SearchResponse', () => {
    it('deve normalizar resposta de busca 1688 com sucesso', () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          items: [
            { item_id: '123', title: 'Product 1', price: 10.5 },
            { item_id: '456', title: 'Product 2', price: 20.0 },
          ],
        },
      }

      const normalizedItem1 = { id: '123', title: 'Product 1', price: 10.5 }
      const normalizedItem2 = { id: '456', title: 'Product 2', price: 20.0 }

      jest
        .spyOn(alibaba1688Normalizer, 'normalizeSearchItem')
        .mockReturnValueOnce(normalizedItem1 as any)
        .mockReturnValueOnce(normalizedItem2 as any)

      const result = service.normalize1688SearchResponse(mockResponse)

      expect(result.data.items).toHaveLength(2)
      expect(result.data.items[0]).toEqual(normalizedItem1)
      expect(result.data.items[1]).toEqual(normalizedItem2)
      expect(alibaba1688Normalizer.normalizeSearchItem).toHaveBeenCalledTimes(2)
    })

    it('deve retornar resposta original quando não há items', () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {},
      }

      const result = service.normalize1688SearchResponse(mockResponse)

      expect(result).toEqual(mockResponse)
      expect(alibaba1688Normalizer.normalizeSearchItem).not.toHaveBeenCalled()
    })

    it('deve retornar resposta original quando items não é array', () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          items: 'not-an-array',
        },
      }

      const result = service.normalize1688SearchResponse(mockResponse)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('normalize1688DetailResponse', () => {
    it('deve normalizar resposta de detalhe 1688 com sucesso', () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          item_id: '123',
          title: 'Product Detail',
          price: 15.5,
        },
      }

      const normalizedProduct = {
        id: '123',
        title: 'Product Detail',
        price: 15.5,
      }

      jest
        .spyOn(alibaba1688Normalizer, 'normalizeDetailedItem')
        .mockReturnValue(normalizedProduct as any)

      const result = service.normalize1688DetailResponse(mockResponse)

      expect(result.data).toEqual(normalizedProduct)
      expect(alibaba1688Normalizer.normalizeDetailedItem).toHaveBeenCalledWith(
        mockResponse.data,
      )
    })

    it('deve retornar resposta original quando não há data', () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
      }

      const result = service.normalize1688DetailResponse(mockResponse)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('normalizeAlibabaSearchResponse', () => {
    it('deve normalizar resposta de busca Alibaba com sucesso', () => {
      const mockResponse = {
        Code: 200,
        Message: 'Success',
        Result: {
          Items: [
            { Id: '789', Title: 'Alibaba Product 1', Price: 30.0 },
            { Id: '101', Title: 'Alibaba Product 2', Price: 40.0 },
          ],
          TotalCount: 2,
        },
      }

      const normalizedItem1 = { id: '789', title: 'Alibaba Product 1', price: 30.0 }
      const normalizedItem2 = { id: '101', title: 'Alibaba Product 2', price: 40.0 }

      jest
        .spyOn(alibabaIntlNormalizer, 'normalizeSearchItem')
        .mockReturnValueOnce(normalizedItem1 as any)
        .mockReturnValueOnce(normalizedItem2 as any)

      const result = service.normalizeAlibabaSearchResponse(mockResponse)

      expect(result.code).toBe(200)
      expect(result.msg).toBe('success')
      expect(result.data.items).toHaveLength(2)
      expect(result.data.total).toBe(2)
      expect(alibabaIntlNormalizer.normalizeSearchItem).toHaveBeenCalledTimes(2)
    })

    it('deve retornar resposta de erro quando não há Items', () => {
      const mockResponse = {
        Code: 500,
        Message: 'Error',
        Result: {},
      }

      const result = service.normalizeAlibabaSearchResponse(mockResponse)

      expect(result.code).toBe(500)
      expect(result.msg).toBe('Error')
      expect(result.data.items).toEqual([])
    })
  })

  describe('normalizeAlibabaDetailResponse', () => {
    it('deve normalizar resposta de detalhe Alibaba com sucesso', () => {
      const mockResponse = {
        Code: 200,
        Message: 'Success',
        Result: {
          Item: {
            Id: '789',
            Title: 'Alibaba Detail',
            Price: 35.0,
          },
          Vendor: {
            VendorId: 'vendor-123',
            VendorName: 'Test Vendor',
          },
        },
      }

      const normalizedProduct = {
        id: '789',
        title: 'Alibaba Detail',
        price: 35.0,
        vendorId: 'vendor-123',
        vendorName: 'Test Vendor',
      }

      jest
        .spyOn(alibabaIntlNormalizer, 'normalizeDetailedItem')
        .mockReturnValue(normalizedProduct as any)

      const result = service.normalizeAlibabaDetailResponse(mockResponse)

      expect(result.code).toBe(200)
      expect(result.msg).toBe('success')
      expect(result.data).toEqual(normalizedProduct)
      expect(alibabaIntlNormalizer.normalizeDetailedItem).toHaveBeenCalledWith(
        mockResponse.Result.Item,
        mockResponse.Result.Vendor,
      )
    })

    it('deve retornar resposta original quando não há Item', () => {
      const mockResponse = {
        Code: 200,
        Message: 'Success',
        Result: {},
      }

      const result = service.normalizeAlibabaDetailResponse(mockResponse)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('normalizeAuto', () => {
    it('deve retornar item quando já tem provider', () => {
      const item = {
        provider: 'custom',
        id: '123',
        title: 'Product',
      }

      const result = service.normalizeAuto(item)

      expect(result).toEqual(item)
    })

    it('deve usar AlibabaIntlNormalizer para items Alibaba', () => {
      const item = {
        Id: '789',
        QuantityRanges: [],
        Title: 'Alibaba Product',
      }

      const normalized = { id: '789', title: 'Alibaba Product' }
      jest.spyOn(alibabaIntlNormalizer, 'normalizeSearchItem').mockReturnValue(normalized as any)

      const result = service.normalizeAuto(item)

      expect(result).toEqual(normalized)
      expect(alibabaIntlNormalizer.normalizeSearchItem).toHaveBeenCalledWith(item)
    })

    it('deve usar Alibaba1688Normalizer para items 1688', () => {
      const item = {
        item_id: '123',
        title: '1688 Product',
        price: 10.0,
      }

      const normalized = { id: '123', title: '1688 Product', price: 10.0 }
      jest.spyOn(alibaba1688Normalizer, 'normalizeSearchItem').mockReturnValue(normalized as any)

      const result = service.normalizeAuto(item)

      expect(result).toEqual(normalized)
      expect(alibaba1688Normalizer.normalizeSearchItem).toHaveBeenCalledWith(item)
    })
  })

  describe('normalizeMixedItems', () => {
    it('deve normalizar múltiplos items mistos', () => {
      const items = [
        { provider: 'custom', id: '1' },
        { Id: '2', Title: 'Alibaba' },
        { item_id: '3', title: '1688' },
      ]

      jest.spyOn(service, 'normalizeAuto').mockImplementation((item) => item as any)

      const result = service.normalizeMixedItems(items)

      expect(result).toHaveLength(3)
      expect(service.normalizeAuto).toHaveBeenCalledTimes(3)
    })
  })
})

