import { createTestContext, TestContext } from './test-helper'

describe('Translation API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/translation/text', () => {
    it('should translate text', async () => {
      const res = await ctx.authReq.post('/api/translation/text').send({ text: 'Hello world', to: 'pt' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/translation/text').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/translation/text').send({}).expect(401)
    })
  })

  describe('POST /api/translation/titles', () => {
    it('should translate titles', async () => {
      const res = await ctx.authReq.post('/api/translation/titles').send({ titles: ['Hello', 'World'], from: 'en', to: 'pt' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/translation/titles').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/translation/titles').send({}).expect(401)
    })
  })

  describe('POST /api/translation/product', () => {
    it('should translate product', async () => {
      const res = await ctx.authReq.post('/api/translation/product').send({ product: { title: 'Test', description: 'Test' } })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/translation/product').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/translation/product').send({}).expect(401)
    })
  })

  describe('POST /api/translation/detect-chinese', () => {
    it('should detect chinese', async () => {
      const res = await ctx.authReq.post('/api/translation/detect-chinese').send({ text: '你好世界' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/translation/detect-chinese').send({})
      expect(res.status).toBe(400)
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
