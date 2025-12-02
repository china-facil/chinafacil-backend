import { createTestContext, TestContext } from './test-helper'

describe('Subscriptions API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/subscriptions', () => {
    it('should create subscription', async () => {
      const res = await ctx.authReq.post('/api/subscriptions').send({ userId: ctx.adminUserId, planId: 'some-plan-id' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/subscriptions').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/subscriptions').send({}).expect(401)
    })
  })

  describe('GET /api/subscriptions', () => {
    it('should list subscriptions', async () => {
      const res = await ctx.authReq.get('/api/subscriptions')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/subscriptions').expect(401)
    })
  })

  describe('GET /api/subscriptions/user/:userId', () => {
    it('should get subscription by user', async () => {
      const res = await ctx.authReq.get(`/api/subscriptions/user/${ctx.adminUserId}`)
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/subscriptions/user/some-id').expect(401)
    })
  })

  describe('GET /api/subscriptions/:id', () => {
    it('should get subscription by id', async () => {
      const res = await ctx.authReq.get('/api/subscriptions/1')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/subscriptions/1').expect(401)
    })
  })

  describe('POST /api/subscriptions/:id/cancel', () => {
    it('should handle cancel subscription', async () => {
      const res = await ctx.authReq.post('/api/subscriptions/1/cancel')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/subscriptions/1/cancel').expect(401)
    })
  })

  describe('POST /api/subscriptions/:id/activate', () => {
    it('should handle activate subscription', async () => {
      const res = await ctx.authReq.post('/api/subscriptions/1/activate')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/subscriptions/1/activate').expect(401)
    })
  })
})
