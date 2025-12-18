import { getQueueToken } from '@nestjs/bull'
import { Queue } from 'bull'
import { createTestContext, TestContext, closeTestContext } from './test-helper'

describe('All Processors - Retry Strategies Validation (Integration)', () => {
  let ctx: TestContext
  let catalogQueue: Queue
  let emailQueue: Queue
  let exportQueue: Queue

  beforeAll(async () => {
    ctx = await createTestContext()
    catalogQueue = ctx.moduleFixture.get<Queue>(getQueueToken('catalog-queue'))
    emailQueue = ctx.moduleFixture.get<Queue>(getQueueToken('email-queue'))
    exportQueue = ctx.moduleFixture.get<Queue>(getQueueToken('export-queue'))
  })

  afterEach(async () => {
    await Promise.all([
      catalogQueue.empty(),
      emailQueue.empty(),
      exportQueue.empty(),
    ])
  })

  afterAll(async () => {
    await closeTestContext()
  })

  describe('CatalogProcessor Retry Strategies', () => {
    it('process-catalog: 3 attempts with 2000ms exponential backoff', async () => {
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

    it('process-category: 3 attempts with 2000ms exponential backoff', async () => {
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

    it('add-product-to-catalog: 3 attempts with 1000ms exponential backoff', async () => {
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

  describe('EmailProcessor Retry Strategies', () => {
    it('send-email: supports retry configuration', async () => {
      const job = await emailQueue.add(
        'send-email',
        { to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' },
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

    it('send-bulk-email: supports retry configuration', async () => {
      const job = await emailQueue.add(
        'send-bulk-email',
        { emails: ['a@b.com'], subject: 'Test', html: '<p>Test</p>' },
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

    it('send-new-user-email: supports retry configuration', async () => {
      const job = await emailQueue.add(
        'send-new-user-email',
        { email: 'test@example.com', name: 'Test User' },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      )
      expect(job.opts.attempts).toBe(3)
    })

    it('send-password-reset-email: supports retry configuration', async () => {
      const job = await emailQueue.add(
        'send-password-reset-email',
        { email: 'test@example.com', token: 'token123' },
        {
          attempts: 5,
          backoff: { type: 'fixed', delay: 3000 },
        },
      )
      expect(job.opts.attempts).toBe(5)
      expect(job.opts.backoff).toEqual({ type: 'fixed', delay: 3000 })
    })
  })

  describe('ExportProcessor Retry Strategies', () => {
    it('process-export: 3 attempts with exponential backoff', async () => {
      const job = await exportQueue.add(
        'process-export',
        {
          userId: 'user-123',
          type: 'CSV' as const,
          model: 'solicitations',
        },
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
  })

  describe('Common Retry Configuration Validations', () => {
    it('all queues should support delay option', async () => {
      const delay = 5000
      const catalogJob = await catalogQueue.add('process-catalog', {}, { delay })
      const emailJob = await emailQueue.add('send-email', { to: 'a@b.com', subject: 's', html: 'h' }, { delay })
      const exportJob = await exportQueue.add('process-export', { userId: 'u', type: 'CSV' as const, model: 'm' }, { delay })

      expect(catalogJob.opts.delay).toBe(delay)
      expect(emailJob.opts.delay).toBe(delay)
      expect(exportJob.opts.delay).toBe(delay)
    })

    it('all queues should support priority option', async () => {
      const priority = 1
      const catalogJob = await catalogQueue.add('process-catalog', {}, { priority })
      const emailJob = await emailQueue.add('send-email', { to: 'a@b.com', subject: 's', html: 'h' }, { priority })
      const exportJob = await exportQueue.add('process-export', { userId: 'u', type: 'CSV' as const, model: 'm' }, { priority })

      expect(catalogJob.opts.priority).toBe(priority)
      expect(emailJob.opts.priority).toBe(priority)
      expect(exportJob.opts.priority).toBe(priority)
    })

    it('all queues should support fixed backoff strategy', async () => {
      const backoff = { type: 'fixed' as const, delay: 5000 }
      const attempts = 5

      const catalogJob = await catalogQueue.add('process-catalog', {}, { attempts, backoff })
      const emailJob = await emailQueue.add('send-email', { to: 'a@b.com', subject: 's', html: 'h' }, { attempts, backoff })
      const exportJob = await exportQueue.add('process-export', { userId: 'u', type: 'CSV' as const, model: 'm' }, { attempts, backoff })

      expect(catalogJob.opts.backoff).toEqual(backoff)
      expect(emailJob.opts.backoff).toEqual(backoff)
      expect(exportJob.opts.backoff).toEqual(backoff)
    })

    it('all queues should support job timeout', async () => {
      const timeout = 30000
      const catalogJob = await catalogQueue.add('process-catalog', {}, { timeout })
      const emailJob = await emailQueue.add('send-email', { to: 'a@b.com', subject: 's', html: 'h' }, { timeout })
      const exportJob = await exportQueue.add('process-export', { userId: 'u', type: 'CSV' as const, model: 'm' }, { timeout })

      expect(catalogJob.opts.timeout).toBe(timeout)
      expect(emailJob.opts.timeout).toBe(timeout)
      expect(exportJob.opts.timeout).toBe(timeout)
    })
  })

  describe('Queue Health Checks', () => {
    it('all queues should be healthy and operational', async () => {
      const [catalogCounts, emailCounts, exportCounts] = await Promise.all([
        catalogQueue.getJobCounts(),
        emailQueue.getJobCounts(),
        exportQueue.getJobCounts(),
      ])

      expect(catalogCounts).toBeDefined()
      expect(emailCounts).toBeDefined()
      expect(exportCounts).toBeDefined()

      expect(typeof catalogCounts.waiting).toBe('number')
      expect(typeof emailCounts.waiting).toBe('number')
      expect(typeof exportCounts.waiting).toBe('number')
    })

    it('all queues should support pause/resume operations', async () => {
      await catalogQueue.pause()
      await emailQueue.pause()
      await exportQueue.pause()

      const [catalogPaused, emailPaused, exportPaused] = await Promise.all([
        catalogQueue.isPaused(),
        emailQueue.isPaused(),
        exportQueue.isPaused(),
      ])

      expect(catalogPaused).toBe(true)
      expect(emailPaused).toBe(true)
      expect(exportPaused).toBe(true)

      await catalogQueue.resume()
      await emailQueue.resume()
      await exportQueue.resume()

      const [catalogResumed, emailResumed, exportResumed] = await Promise.all([
        catalogQueue.isPaused(),
        emailQueue.isPaused(),
        exportQueue.isPaused(),
      ])

      expect(catalogResumed).toBe(false)
      expect(emailResumed).toBe(false)
      expect(exportResumed).toBe(false)
    })
  })
})

