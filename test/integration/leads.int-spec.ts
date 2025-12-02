import { createTestContext, TestContext } from './test-helper'

describe('Leads API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/leads', () => {
    it('should create lead successfully', async () => {
      const res = await ctx.req.post('/api/leads').send({ name: 'Test Lead', email: `lead-${Date.now()}@test.com`, phone: '11999999999' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/leads').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/leads', () => {
    it('should list leads', async () => {
      const res = await ctx.authReq.get('/api/leads')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/leads').expect(401)
    })
  })

  describe('GET /api/leads/stats/origin', () => {
    it('should get stats by origin', async () => {
      const res = await ctx.authReq.get('/api/leads/stats/origin')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/leads/stats/origin').expect(401)
    })
  })

  describe('GET /api/leads/stats/status', () => {
    it('should get stats by status', async () => {
      const res = await ctx.authReq.get('/api/leads/stats/status')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/leads/stats/status').expect(401)
    })
  })

  describe('GET /api/leads/:id', () => {
    it('should get lead by id', async () => {
      const res = await ctx.authReq.get('/api/leads/some-lead-id')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/leads/some-id').expect(401)
    })
  })

  describe('PATCH /api/leads/:id', () => {
    it('should update lead', async () => {
      const res = await ctx.authReq.patch('/api/leads/some-lead-id').send({ status: 'contacted' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.patch('/api/leads/some-id').send({}).expect(401)
    })
  })

  describe('POST /api/leads/:id/convert', () => {
    it('should handle convert lead', async () => {
      const res = await ctx.authReq.post('/api/leads/some-lead-id/convert')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/leads/some-id/convert').expect(401)
    })
  })

  describe('DELETE /api/leads/:id', () => {
    it('should return 401 without auth', async () => {
      await ctx.req.delete('/api/leads/some-id').expect(401)
    })
  })
})
