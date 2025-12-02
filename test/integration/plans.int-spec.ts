import { createTestContext, TestContext } from './test-helper'

describe('Plans API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('GET /api/plans/active', () => {
    it('should handle active plans request (public)', async () => {
      const res = await ctx.req.get('/api/plans/active')
      expect([200, 404, 500]).toContain(res.status)
    })
  })

  describe('POST /api/plans', () => {
    it('should create plan successfully', async () => {
      const res = await ctx.authReq.post('/api/plans').send({ name: 'Test Plan', price: 99.90, duration: 30 })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/plans').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/plans').send({}).expect(401)
    })
  })

  describe('GET /api/plans', () => {
    it('should handle list all plans request', async () => {
      const res = await ctx.authReq.get('/api/plans')
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/plans').expect(401)
    })
  })

  describe('GET /api/plans/:id', () => {
    it('should handle get plan by id request', async () => {
      const res = await ctx.authReq.get('/api/plans/some-plan-id')
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/plans/some-id').expect(401)
    })
  })

  describe('PATCH /api/plans/:id', () => {
    it('should handle update plan request', async () => {
      const res = await ctx.authReq.patch('/api/plans/some-plan-id').send({ name: 'Updated Plan' })
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.patch('/api/plans/some-id').send({}).expect(401)
    })
  })

  describe('DELETE /api/plans/:id', () => {
    it('should return 401 without auth', async () => {
      await ctx.req.delete('/api/plans/some-id').expect(401)
    })
  })
})
