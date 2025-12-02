import { createTestContext, TestContext } from './test-helper'

describe('Webhooks API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/webhooks/typeform', () => {
    it('should return 401 without valid signature', async () => {
      const res = await ctx.req.post('/api/webhooks/typeform').send({ event_id: 'test', form_response: {} })
      expect(res.status).toBe(401)
    })

    it('should return 401 without payload', async () => {
      const res = await ctx.req.post('/api/webhooks/typeform').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/webhooks/generic', () => {
    it('should handle generic webhook successfully', async () => {
      const res = await ctx.req.post('/api/webhooks/generic').send({ payload: { test: true } })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/webhooks/generic').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/webhooks/logs', () => {
    it('should get webhook logs successfully', async () => {
      const res = await ctx.authReq.get('/api/webhooks/logs')
      expect(res.status).toBe(200)
    })

    it('should get webhook logs with limit successfully', async () => {
      const res = await ctx.authReq.get('/api/webhooks/logs?limit=10')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/webhooks/logs')
      expect(res.status).toBe(401)
    })
  })
})
