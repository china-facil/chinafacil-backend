import { getQueueToken } from '@nestjs/bull'
import { Queue } from 'bull'
import { createTestContext, TestContext } from './test-helper'
import { ExportProcessor } from '../../src/jobs/processors/export.processor'

describe('ExportProcessor (Integration)', () => {
  let ctx: TestContext
  let exportQueue: Queue
  let exportProcessor: ExportProcessor

  beforeAll(async () => {
    ctx = await createTestContext()
    exportQueue = ctx.moduleFixture.get<Queue>(getQueueToken('export-queue'))
    exportProcessor = ctx.moduleFixture.get<ExportProcessor>(ExportProcessor)
  })

  afterEach(async () => {
    await exportQueue.empty()
  })

  describe('process-export job (generate-export)', () => {
    const exportJobData = {
      userId: 'user-123',
      type: 'CSV' as const,
      model: 'solicitations',
      params: { status: 'approved' },
    }

    it('should add job to queue successfully', async () => {
      const job = await exportQueue.add('process-export', exportJobData)
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('process-export')
      expect(job.data).toEqual(exportJobData)
    })

    it('should support CSV export type', async () => {
      const csvExportData = { ...exportJobData, type: 'CSV' as const }
      const job = await exportQueue.add('process-export', csvExportData)
      expect(job.data.type).toBe('CSV')
    })

    it('should support XLSX export type', async () => {
      const xlsxExportData = { ...exportJobData, type: 'XLSX' as const }
      const job = await exportQueue.add('process-export', xlsxExportData)
      expect(job.data.type).toBe('XLSX')
    })

    it('should support PDF export type', async () => {
      const pdfExportData = { ...exportJobData, type: 'PDF' as const }
      const job = await exportQueue.add('process-export', pdfExportData)
      expect(job.data.type).toBe('PDF')
    })

    it('should support various models', async () => {
      const models = ['solicitations', 'users', 'clients', 'products', 'leads']
      for (const model of models) {
        const job = await exportQueue.add('process-export', { ...exportJobData, model })
        expect(job.data.model).toBe(model)
      }
    })

    it('should support optional params', async () => {
      const jobWithParams = await exportQueue.add('process-export', {
        ...exportJobData,
        params: {
          status: 'approved',
          dateStart: '2024-01-01',
          dateEnd: '2024-12-31',
        },
      })
      expect(jobWithParams.data.params).toBeDefined()
      expect(jobWithParams.data.params?.status).toBe('approved')
    })

    it('should have retry configuration', async () => {
      const job = await exportQueue.add('process-export', exportJobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      })
      expect(job.opts.attempts).toBe(3)
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 2000 })
    })
  })

  describe('Export Type Mapping', () => {
    it('should map CSV type correctly', () => {
      const processor = exportProcessor as any
      const mapped = processor.mapJobTypeToExportType('CSV')
      expect(mapped).toBe('csv')
    })

    it('should map XLSX type correctly', () => {
      const processor = exportProcessor as any
      const mapped = processor.mapJobTypeToExportType('XLSX')
      expect(mapped).toBe('xlsx')
    })

    it('should map PDF type correctly', () => {
      const processor = exportProcessor as any
      const mapped = processor.mapJobTypeToExportType('PDF')
      expect(mapped).toBe('pdf')
    })

    it('should fallback to csv for unknown types', () => {
      const processor = exportProcessor as any
      const mapped = processor.mapJobTypeToExportType('UNKNOWN')
      expect(mapped).toBe('csv')
    })
  })

  describe('Retry Strategies Validation', () => {
    it('process-export should support exponential backoff', async () => {
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

    it('should support delayed job start', async () => {
      const job = await exportQueue.add(
        'process-export',
        {
          userId: 'user-123',
          type: 'CSV' as const,
          model: 'solicitations',
        },
        { delay: 60000 },
      )
      expect(job.opts.delay).toBe(60000)
    })
  })

  describe('Queue Operations', () => {
    it('should be able to get job counts', async () => {
      await exportQueue.add('process-export', {
        userId: 'user-1',
        type: 'CSV' as const,
        model: 'users',
      })

      const counts = await exportQueue.getJobCounts()
      expect(counts).toBeDefined()
      expect(typeof counts.waiting).toBe('number')
    })

    it('should be able to pause and resume queue', async () => {
      await exportQueue.pause()
      const isPaused = await exportQueue.isPaused()
      expect(isPaused).toBe(true)

      await exportQueue.resume()
      const isResumed = await exportQueue.isPaused()
      expect(isResumed).toBe(false)
    })
  })
})
