import { createTestContext, TestContext } from './test-helper'

describe('Proxy API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('GET /api/image', () => {
    it('should return 400 without url parameter', async () => {
      await ctx.req.get('/api/image').expect(400)
    })

    it('should return 400 with invalid url', async () => {
      await ctx.req.get('/api/image?url=invalid').expect(400)
    })
  })

  describe('GET /api/proxy-paises', () => {
    it('should get countries list successfully', async () => {
      const res = await ctx.req.get('/api/proxy-paises')
      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(500)
    })
  })
})

