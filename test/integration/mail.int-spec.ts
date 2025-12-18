import { createTestContext, TestContext } from './test-helper'

describe('Mail API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/mail/send', () => {
    it('should send email successfully', async () => {
      const res = await ctx.authReq.post('/api/mail/send').send({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
      })
      expect(res.status).toBe(201)
      expect(res.body).toBeDefined()
    })

    it('should return 400 with invalid payload', async () => {
      await ctx.authReq.post('/api/mail/send').send({}).expect(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/mail/send').send({
        to: 'test@example.com',
        subject: 'Test',
      }).expect(401)
    })
  })
})

