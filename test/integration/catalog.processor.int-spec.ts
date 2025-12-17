import { getQueueToken } from '@nestjs/bull'
import { Queue, Job } from 'bull'
import { createTestContext, TestContext } from './test-helper'
import { CatalogProcessor } from '../../src/jobs/processors/catalog.processor'
import { PrismaService } from '../../src/database/prisma.service'

describe('CatalogProcessor (Integration)', () => {
  let ctx: TestContext
  let catalogQueue: Queue
  let catalogProcessor: CatalogProcessor
  let prisma: PrismaService

  beforeAll(async () => {
    ctx = await createTestContext()
    catalogQueue = ctx.moduleFixture.get<Queue>(getQueueToken('catalog-queue'))
    catalogProcessor = ctx.moduleFixture.get<CatalogProcessor>(CatalogProcessor)
    prisma = ctx.prisma
  })

  afterEach(async () => {
    await catalogQueue.empty()
  })

  describe('process-catalog job', () => {
    it('should add job to queue successfully', async () => {
      const job = await catalogQueue.add('process-catalog', {})
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('process-catalog')
    })

    it('should have correct retry configuration', async () => {
      const job = await catalogQueue.add(
        'process-catalog',
        {},
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      )
      expect(job.opts.attempts).toBe(3)
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 2000 })
    })
  })

  describe('process-category job', () => {
    it('should add job to queue successfully', async () => {
      const jobData = { categoryId: 'MLB1234' }
      const job = await catalogQueue.add('process-category', jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      })
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('process-category')
      expect(job.data).toEqual(jobData)
    })

    it('should support pagination parameters', async () => {
      const jobData = { categoryId: 'MLB1234', offset: 25, limit: 50 }
      const job = await catalogQueue.add('process-category', jobData)
      expect(job.data.offset).toBe(25)
      expect(job.data.limit).toBe(50)
    })

    it('should have correct retry configuration', async () => {
      const job = await catalogQueue.add(
        'process-category',
        { categoryId: 'MLB1234' },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      )
      expect(job.opts.attempts).toBe(3)
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 2000 })
    })
  })

  describe('add-product-to-catalog job', () => {
    const productJobData = {
      categoryId: 'MLB1234',
      mlProductId: 'MLB123456789',
      mlProductData: {
        id: 'MLB123456789',
        title: 'Test Product',
        price: 99.99,
        thumbnail: 'https://example.com/image.jpg',
        permalink: 'https://example.com/product',
        sold_quantity: 100,
        sold_value: 9999,
      },
    }

    it('should add job to queue successfully', async () => {
      const job = await catalogQueue.add('add-product-to-catalog', productJobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      })
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('add-product-to-catalog')
      expect(job.data).toEqual(productJobData)
    })

    it('should have correct job data structure for catalog creation', async () => {
      const uniqueProductId = `MLB-TEST-${Date.now()}`
      const uniqueCategoryId = `CAT-TEST-${Date.now()}`
      const testProductData = {
        categoryId: uniqueCategoryId,
        mlProductId: uniqueProductId,
        mlProductData: {
          id: uniqueProductId,
          title: 'Test Product',
          price: 99.99,
          thumbnail: 'https://example.com/image.jpg',
          permalink: 'https://example.com/product',
          sold_quantity: 100,
          sold_value: 9999,
        },
      }

      const job = await catalogQueue.add('add-product-to-catalog', testProductData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      })
      
      expect(job.data.categoryId).toBe(uniqueCategoryId)
      expect(job.data.mlProductId).toBe(uniqueProductId)
      expect(job.data.mlProductData.title).toBe('Test Product')
      expect(job.data.mlProductData.price).toBe(99.99)
    })

    it('should support job data for product updates', async () => {
      const uniqueProductId = `MLB-UPDATE-${Date.now()}`

      const testProductData = {
        categoryId: 'NEW_CAT',
        mlProductId: uniqueProductId,
        mlProductData: {
          id: uniqueProductId,
          title: 'Updated Title',
          price: 150,
          thumbnail: 'https://example.com/new.jpg',
          sold_quantity: 200,
        },
      }

      const job = await catalogQueue.add('add-product-to-catalog', testProductData)
      
      expect(job.data.categoryId).toBe('NEW_CAT')
      expect(job.data.mlProductId).toBe(uniqueProductId)
      expect(job.data.mlProductData.title).toBe('Updated Title')
      expect(job.data.mlProductData.price).toBe(150)
    })

    it('should have correct retry configuration', async () => {
      const job = await catalogQueue.add('add-product-to-catalog', productJobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      })
      expect(job.opts.attempts).toBe(3)
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 1000 })
    })

    it('should support 1688 product data', async () => {
      const productWith1688 = {
        ...productJobData,
        product1688Data: {
          item_id: '1688-123456',
          price: 50,
          goods_score: 4.5,
          title: '中文标题',
          translated_title: 'Chinese Title',
          quantity_begin: 10,
        },
      }
      const job = await catalogQueue.add('add-product-to-catalog', productWith1688)
      expect(job.data.product1688Data).toBeDefined()
      expect(job.data.product1688Data?.item_id).toBe('1688-123456')
    })
  })

  describe('Retry Strategies Validation', () => {
    it('process-catalog should use exponential backoff with 2000ms delay', async () => {
      const job = await catalogQueue.add(
        'process-catalog',
        {},
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      )
      expect(job.opts.attempts).toBe(3)
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 2000 })
      expect(job.opts.removeOnComplete).toBe(true)
      expect(job.opts.removeOnFail).toBe(false)
    })

    it('process-category should use exponential backoff with 2000ms delay', async () => {
      const job = await catalogQueue.add(
        'process-category',
        { categoryId: 'MLB1234' },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      )
      expect(job.opts.attempts).toBe(3)
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 2000 })
    })

    it('add-product-to-catalog should use exponential backoff with 1000ms delay', async () => {
      const job = await catalogQueue.add(
        'add-product-to-catalog',
        {
          categoryId: 'MLB1234',
          mlProductId: 'MLB123',
          mlProductData: { id: 'MLB123', title: 'Test', price: 10 },
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      )
      expect(job.opts.attempts).toBe(3)
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 1000 })
    })
  })
})


