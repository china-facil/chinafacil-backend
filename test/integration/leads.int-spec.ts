import { createTestContext, TestContext } from './test-helper'

describe('Leads API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/leads', () => {
    it('should create lead successfully', async () => {
      const email = `lead-${Date.now()}@example.com`
      const res = await ctx.req.post('/api/leads').send({ name: 'New Lead', email })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/leads').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/leads', () => {
    it('should list leads successfully', async () => {
      const res = await ctx.authReq.get('/api/leads')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/leads')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/leads/:id', () => {
    it('should return 404 for non-existent lead', async () => {
      const res = await ctx.authReq.get('/api/leads/non-existent-id')
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/leads/some-id')
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/leads/:id', () => {
    it('should return 404 for non-existent lead', async () => {
      const res = await ctx.authReq.patch('/api/leads/non-existent-id').send({ name: 'Updated Lead' })
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.patch('/api/leads/some-id').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/leads/:id', () => {
    it('should return 404 for non-existent lead', async () => {
      const res = await ctx.authReq.delete('/api/leads/non-existent-id')
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.delete('/api/leads/some-id')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/leads/:id/convert', () => {
    it('should return 404 for non-existent lead', async () => {
      const res = await ctx.authReq.post('/api/leads/non-existent-id/convert')
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/leads/some-id/convert')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/leads/stats/origin', () => {
    it('should get leads stats by origin successfully', async () => {
      const res = await ctx.authReq.get('/api/leads/stats/origin')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/leads/stats/origin')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/leads/stats/status', () => {
    it('should get leads stats by status successfully', async () => {
      const res = await ctx.authReq.get('/api/leads/stats/status')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/leads/stats/status')
      expect(res.status).toBe(401)
    })
  })
})





