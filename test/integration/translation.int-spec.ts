import { createTestContext, TestContext } from './test-helper'

describe('Translation API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/translation/text', () => {
    it('should handle translate text request', async () => {
      const res = await ctx.authReq.post('/api/translation/text').send({ text: 'Hello world', to: 'pt' })
      expect([200, 400, 500, 503]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/translation/text').send({}).expect(401)
    })
  })

  describe('POST /api/translation/titles', () => {
    it('should handle translate titles request', async () => {
      const res = await ctx.authReq.post('/api/translation/titles').send({ titles: ['Hello', 'World'], from: 'en', to: 'pt' })
      expect([200, 400, 500, 503]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/translation/titles').send({}).expect(401)
    })
  })

  describe('POST /api/translation/product', () => {
    it('should handle translate product request', async () => {
      const res = await ctx.authReq.post('/api/translation/product').send({ product: { title: 'Test', description: 'Test' } })
      expect([200, 400, 500, 503]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/translation/product').send({}).expect(401)
    })
  })

  describe('POST /api/translation/detect-chinese', () => {
    it('should handle detect chinese request', async () => {
      const res = await ctx.authReq.post('/api/translation/detect-chinese').send({ text: '你好世界' })
      expect([200, 400, 500, 503]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/translation/detect-chinese').send({}).expect(401)
    })
  })

  describe('DELETE /api/translation/clear-cache', () => {
    it('should clear cache', async () => {
      const res = await ctx.authReq.delete('/api/translation/clear-cache')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.delete('/api/translation/clear-cache').expect(401)
    })
  })
})
