import { createTestContext, TestContext } from './test-helper'

describe('Leads API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/leads', () => {
    it('should create lead successfully', async () => {
      const res = await ctx.req.post('/api/leads').send({
        name: 'New Lead',
        email: `lead-${Date.now()}@example.com`,
      })
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
    })

    it('should return 400 with invalid payload', async () => {
      await ctx.req.post('/api/leads').send({}).expect(400)
    })
  })

  describe('GET /api/leads', () => {
    it('should list leads successfully', async () => {
      const res = await ctx.authReq.get('/api/leads')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/leads').expect(401)
    })
  })

  describe('GET /api/leads/:id', () => {
    it('should return 404 for non-existent lead', async () => {
      await ctx.authReq.get('/api/leads/non-existent-id').expect(404)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/leads/some-id').expect(401)
    })
  })

  describe('PATCH /api/leads/:id', () => {
    it('should return 404 for non-existent lead', async () => {
      await ctx.authReq.patch('/api/leads/non-existent-id').send({ name: 'Updated' }).expect(404)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.patch('/api/leads/some-id').send({}).expect(401)
    })
  })

  describe('DELETE /api/leads/:id', () => {
    it('should return 404 for non-existent lead', async () => {
      await ctx.authReq.delete('/api/leads/non-existent-id').expect(404)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.delete('/api/leads/some-id').expect(401)
    })
  })

  describe('POST /api/leads/:id/convert', () => {
    it('should return 404 for non-existent lead', async () => {
      await ctx.authReq.post('/api/leads/non-existent-id/convert').expect(404)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/leads/some-id/convert').expect(401)
    })
  })

  describe('GET /api/leads/stats/origin', () => {
    it('should get leads stats by origin successfully', async () => {
      const res = await ctx.authReq.get('/api/leads/stats/origin')
      expect(res.status).toBe(200)
      expect(res.body).toBeDefined()
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/leads/stats/origin').expect(401)
    })
  })

  describe('GET /api/leads/stats/status', () => {
    it('should get leads stats by status successfully', async () => {
      const res = await ctx.authReq.get('/api/leads/stats/status')
      expect(res.status).toBe(200)
      expect(res.body).toBeDefined()
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/leads/stats/status').expect(401)
    })
  })
})





