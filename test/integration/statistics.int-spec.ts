import { createTestContext, TestContext } from './test-helper'

describe('Statistics API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('GET /api/statistics/total-clients-by-plan', () => {
    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/statistics/total-clients-by-plan')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/statistics/monthly-metrics', () => {
    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/statistics/monthly-metrics')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/statistics/admin-dashboard', () => {
    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/statistics/admin-dashboard')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/statistics/solicitations-by-status', () => {
    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/statistics/solicitations-by-status')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/statistics/user-growth', () => {
    it('should get user growth successfully', async () => {
      const res = await ctx.authReq.get('/api/statistics/user-growth')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/statistics/user-growth')
      expect(res.status).toBe(401)
    })
  })
})
