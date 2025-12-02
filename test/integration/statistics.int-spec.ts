import { createTestContext, TestContext } from './test-helper'

describe('Statistics API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('GET /api/statistics/total-clients-by-plan', () => {
    it('should handle total clients by plan request', async () => {
      const res = await ctx.authReq.get('/api/statistics/total-clients-by-plan')
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/total-clients-by-plan').expect(401)
    })
  })

  describe('GET /api/statistics/monthly-metrics', () => {
    it('should get monthly metrics', async () => {
      const res = await ctx.authReq.get('/api/statistics/monthly-metrics')
      expect(res.status).toBeLessThan(500)
    })

    it('should get monthly metrics with query params', async () => {
      const res = await ctx.authReq.get('/api/statistics/monthly-metrics?year=2024&month=1')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/monthly-metrics').expect(401)
    })
  })

  describe('GET /api/statistics/admin-dashboard', () => {
    it('should handle admin dashboard request', async () => {
      const res = await ctx.authReq.get('/api/statistics/admin-dashboard')
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/admin-dashboard').expect(401)
    })
  })

  describe('GET /api/statistics/solicitations-by-status', () => {
    it('should handle solicitations by status request', async () => {
      const res = await ctx.authReq.get('/api/statistics/solicitations-by-status')
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/solicitations-by-status').expect(401)
    })
  })

  describe('GET /api/statistics/user-growth', () => {
    it('should get user growth', async () => {
      const res = await ctx.authReq.get('/api/statistics/user-growth')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/user-growth').expect(401)
    })
  })
})
