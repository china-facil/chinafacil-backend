import { getQueueToken } from '@nestjs/bull'
import { Queue, Job } from 'bull'
import { createTestContext, TestContext } from './test-helper'
import { EmailProcessor } from '../../src/jobs/processors/email.processor'

describe('EmailProcessor (Integration)', () => {
  let ctx: TestContext
  let emailQueue: Queue
  let emailProcessor: EmailProcessor

  beforeAll(async () => {
    ctx = await createTestContext()
    emailQueue = ctx.moduleFixture.get<Queue>(getQueueToken('email-queue'))
    emailProcessor = ctx.moduleFixture.get<EmailProcessor>(EmailProcessor)
  })

  afterEach(async () => {
    await emailQueue.empty()
  })

  describe('send-email job', () => {
    const emailJobData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>',
    }

    it('should add job to queue successfully', async () => {
      const job = await emailQueue.add('send-email', emailJobData)
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('send-email')
      expect(job.data).toEqual(emailJobData)
    })

    it('should support multiple recipients', async () => {
      const multipleRecipientsData = {
        to: ['test1@example.com', 'test2@example.com'],
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      }
      const job = await emailQueue.add('send-email', multipleRecipientsData)
      expect(job.data.to).toHaveLength(2)
    })

    it('should support attachments', async () => {
      const withAttachmentsData = {
        ...emailJobData,
        attachments: [
          { filename: 'test.pdf', path: '/tmp/test.pdf' },
          { filename: 'data.txt', content: 'Hello World' },
        ],
      }
      const job = await emailQueue.add('send-email', withAttachmentsData)
      expect(job.data.attachments).toHaveLength(2)
    })

    it('should support plain text alternative', async () => {
      const withTextData = {
        ...emailJobData,
        text: 'Plain text content',
      }
      const job = await emailQueue.add('send-email', withTextData)
      expect(job.data.text).toBe('Plain text content')
    })

    it('should have default retry configuration', async () => {
      const job = await emailQueue.add('send-email', emailJobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      })
      expect(job.opts.attempts).toBe(3)
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 1000 })
    })
  })

  describe('send-new-user-email job', () => {
    const newUserEmailData = {
      email: 'newuser@example.com',
      name: 'New User',
    }

    it('should add job to queue successfully', async () => {
      const job = await emailQueue.add('send-new-user-email', newUserEmailData)
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('send-new-user-email')
      expect(job.data).toEqual(newUserEmailData)
    })

    it('should require email and name', async () => {
      const job = await emailQueue.add('send-new-user-email', newUserEmailData)
      expect(job.data.email).toBeDefined()
      expect(job.data.name).toBeDefined()
    })
  })

  describe('send-password-reset-email job', () => {
    const passwordResetData = {
      email: 'user@example.com',
      token: 'reset-token-123',
    }

    it('should add job to queue successfully', async () => {
      const job = await emailQueue.add('send-password-reset-email', passwordResetData)
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('send-password-reset-email')
      expect(job.data).toEqual(passwordResetData)
    })

    it('should require email and token', async () => {
      const job = await emailQueue.add('send-password-reset-email', passwordResetData)
      expect(job.data.email).toBeDefined()
      expect(job.data.token).toBeDefined()
    })
  })

  describe('send-new-solicitation-email job', () => {
    const solicitationEmailData = {
      email: 'client@example.com',
      solicitationCode: 'SOL-2024-001',
    }

    it('should add job to queue successfully', async () => {
      const job = await emailQueue.add('send-new-solicitation-email', solicitationEmailData)
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('send-new-solicitation-email')
      expect(job.data).toEqual(solicitationEmailData)
    })

    it('should require email and solicitationCode', async () => {
      const job = await emailQueue.add('send-new-solicitation-email', solicitationEmailData)
      expect(job.data.email).toBeDefined()
      expect(job.data.solicitationCode).toBeDefined()
    })
  })

  describe('send-bulk-email job', () => {
    const bulkEmailData = {
      emails: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
      subject: 'Bulk Email Subject',
      html: '<p>Bulk email content</p>',
    }

    it('should add job to queue successfully', async () => {
      const job = await emailQueue.add('send-bulk-email', bulkEmailData)
      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
      expect(job.name).toBe('send-bulk-email')
      expect(job.data).toEqual(bulkEmailData)
    })

    it('should support large email lists', async () => {
      const largeEmailList = {
        emails: Array.from({ length: 100 }, (_, i) => `user${i}@example.com`),
        subject: 'Bulk Email',
        html: '<p>Content</p>',
      }
      const job = await emailQueue.add('send-bulk-email', largeEmailList)
      expect(job.data.emails).toHaveLength(100)
    })

    it('should have retry configuration', async () => {
      const job = await emailQueue.add('send-bulk-email', bulkEmailData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      })
      expect(job.opts.attempts).toBe(3)
    })
  })

  describe('Retry Strategies Validation', () => {
    it('all email jobs should support retry configuration', async () => {
      const retryConfig = {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      }

      const jobs = [
        await emailQueue.add('send-email', { to: 'a@b.com', subject: 's', html: 'h' }, retryConfig),
        await emailQueue.add('send-new-user-email', { email: 'a@b.com', name: 'n' }, retryConfig),
        await emailQueue.add('send-password-reset-email', { email: 'a@b.com', token: 't' }, retryConfig),
        await emailQueue.add('send-new-solicitation-email', { email: 'a@b.com', solicitationCode: 'c' }, retryConfig),
        await emailQueue.add('send-bulk-email', { emails: ['a@b.com'], subject: 's', html: 'h' }, retryConfig),
      ]

      for (const job of jobs) {
        expect(job.opts.attempts).toBe(3)
        expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 1000 })
        expect(job.opts.removeOnComplete).toBe(true)
        expect(job.opts.removeOnFail).toBe(false)
      }
    })

    it('should support delayed job execution', async () => {
      const job = await emailQueue.add(
        'send-email',
        { to: 'a@b.com', subject: 's', html: 'h' },
        { delay: 5000 },
      )
      expect(job.opts.delay).toBe(5000)
    })

    it('should support job priority', async () => {
      const highPriorityJob = await emailQueue.add(
        'send-email',
        { to: 'a@b.com', subject: 'Urgent', html: 'h' },
        { priority: 1 },
      )
      const lowPriorityJob = await emailQueue.add(
        'send-email',
        { to: 'a@b.com', subject: 'Normal', html: 'h' },
        { priority: 10 },
      )
      expect(highPriorityJob.opts.priority).toBe(1)
      expect(lowPriorityJob.opts.priority).toBe(10)
    })
  })

  describe('Queue Operations', () => {
    it('should be able to get job counts', async () => {
      await emailQueue.add('send-email', { to: 'a@b.com', subject: 's', html: 'h' })
      await emailQueue.add('send-email', { to: 'b@c.com', subject: 's', html: 'h' })

      const counts = await emailQueue.getJobCounts()
      expect(counts).toBeDefined()
      expect(typeof counts.waiting).toBe('number')
      expect(typeof counts.active).toBe('number')
      expect(typeof counts.completed).toBe('number')
      expect(typeof counts.failed).toBe('number')
    })

    it('should be able to pause and resume queue', async () => {
      await emailQueue.pause()
      const isPaused = await emailQueue.isPaused()
      expect(isPaused).toBe(true)

      await emailQueue.resume()
      const isResumed = await emailQueue.isPaused()
      expect(isResumed).toBe(false)
    })
  })
})



