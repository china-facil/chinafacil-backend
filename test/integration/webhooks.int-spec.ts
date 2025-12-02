import { createTestContext, TestContext } from './test-helper'

describe('Webhooks API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/webhooks/typeform', () => {
    it('should handle typeform webhook', async () => {
      const res = await ctx.req.post('/api/webhooks/typeform').send({ event_id: 'test-event-id', event_type: 'form_response', form_response: {} })
      expect(res.status).toBeLessThan(500)
    })

    it('should handle invalid payload', async () => {
      const res = await ctx.req.post('/api/webhooks/typeform').send({})
      expect(res.status).toBeLessThan(500)
    })
  })

  describe('POST /api/webhooks/generic', () => {
    it('should handle generic webhook', async () => {
      const res = await ctx.req.post('/api/webhooks/generic').send({ event: 'test-event', data: {} })
      expect(res.status).toBeLessThan(500)
    })

    it('should handle invalid payload', async () => {
      const res = await ctx.req.post('/api/webhooks/generic').send({})
      expect(res.status).toBeLessThan(500)
    })
  })

  describe('GET /api/webhooks/logs', () => {
    it('should get webhook logs', async () => {
      const res = await ctx.authReq.get('/api/webhooks/logs')
      expect(res.status).toBeLessThan(500)
    })

    it('should get webhook logs with limit', async () => {
      const res = await ctx.authReq.get('/api/webhooks/logs?limit=10')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/webhooks/logs').expect(401)
    })
  })
})
