import { createTestContext, TestContext } from './test-helper'

describe('Statistics API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('GET /api/statistics/total-clients-by-plan', () => {
    it('should return statistics successfully', async () => {
      const res = await ctx.authReq.get('/api/statistics/total-clients-by-plan')
      expect(res.status).toBe(200)
      expect(res.body).toBeDefined()
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/total-clients-by-plan').expect(401)
    })
  })

  describe('GET /api/statistics/monthly-metrics', () => {
    it('should return monthly metrics successfully', async () => {
      const res = await ctx.authReq.get('/api/statistics/monthly-metrics')
      expect(res.status).toBe(200)
      expect(res.body).toBeDefined()
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/monthly-metrics').expect(401)
    })
  })

  describe('GET /api/statistics/admin-dashboard', () => {
    it('should return admin dashboard statistics successfully', async () => {
      const res = await ctx.authReq.get('/api/statistics/admin-dashboard')
      expect(res.status).toBe(200)
      expect(res.body).toBeDefined()
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/admin-dashboard').expect(401)
    })
  })

  describe('GET /api/statistics/solicitations-by-status', () => {
    it('should return solicitations by status successfully', async () => {
      const res = await ctx.authReq.get('/api/statistics/solicitations-by-status')
      expect(res.status).toBe(200)
      expect(res.body).toBeDefined()
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/solicitations-by-status').expect(401)
    })
  })

  describe('GET /api/statistics/user-growth', () => {
    it('should return user growth successfully', async () => {
      const res = await ctx.authReq.get('/api/statistics/user-growth')
      expect(res.status).toBe(200)
      expect(res.body).toBeDefined()
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/statistics/user-growth').expect(401)
    })
  })
})
