import { createTestContext, TestContext } from './test-helper'

describe('Health API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext({ withAuth: false })
  })

  describe('GET /api/health', () => {
    it("should return health status successfully", async () => {
      const res = await ctx.req.get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body).toHaveProperty("timestamp");
    });

    it('should return health status with required fields', async () => {
      const res = await ctx.req.get('/api/health')
      expect(res.body).toHaveProperty('status', 'success')
    })
  })
})
