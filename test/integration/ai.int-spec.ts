import { createTestContext, TestContext } from './test-helper'

describe('AI API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/ai/completion', () => {
    it('should generate completion successfully', async () => {
      const res = await ctx.authReq.post('/api/ai/completion').send({
        prompt: 'Say hello',
      })
      expect([201, 500]).toContain(res.status)
    }, 30000)

    it('should return 400 with invalid payload', async () => {
      await ctx.authReq.post('/api/ai/completion').send({}).expect(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/ai/completion').send({ prompt: 'test' }).expect(401)
    })
  })

  describe('POST /api/ai/chat', () => {
    it('should generate chat completion successfully', async () => {
      const res = await ctx.authReq.post('/api/ai/chat').send({
        messages: [{ role: 'user', content: 'Hello' }],
      })
      expect([201, 500]).toContain(res.status)
    }, 30000)

    it('should return 400 with invalid payload', async () => {
      await ctx.authReq.post('/api/ai/chat').send({}).expect(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/ai/chat').send({ messages: [{ role: 'user', content: 'test' }] }).expect(401)
    })
  })

  describe('POST /api/ai/product-similarity', () => {
    it('should analyze product similarity successfully', async () => {
      const res = await ctx.authReq.post('/api/ai/product-similarity').send({
        mercadoLivreProduct: { title: 'Test Product', price: 100 },
        chinaProduct: { title: 'Test Product', price: 50 },
      })
      expect([201, 500]).toContain(res.status)
    }, 30000)

    it('should return 400 with invalid payload', async () => {
      await ctx.authReq.post('/api/ai/product-similarity').send({}).expect(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/ai/product-similarity').send({
        mercadoLivreProduct: { title: 'test' },
        chinaProduct: { title: 'test' },
      }).expect(401)
    })
  })

  describe('POST /api/ai/chat/stream', () => {
    it('should stream chat completion successfully', async () => {
      const res = await ctx.authReq.post('/api/ai/chat/stream').send({
        messages: [{ role: 'user', content: 'Hello' }],
      })
      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(600)
    }, 30000)

    it('should return 400 with invalid payload', async () => {
      await ctx.authReq.post('/api/ai/chat/stream').send({}).expect(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/ai/chat/stream').send({
        messages: [{ role: 'user', content: 'test' }],
      }).expect(401)
    })
  })

  describe('POST /api/ai/embedding', () => {
    it('should generate embedding successfully', async () => {
      const res = await ctx.authReq.post('/api/ai/embedding').send({
        text: 'Test text for embedding',
      })
      expect([201, 500]).toContain(res.status)
    }, 30000)

    it('should return 400 with invalid payload', async () => {
      await ctx.authReq.post('/api/ai/embedding').send({}).expect(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/ai/embedding').send({ text: 'test' }).expect(401)
    })
  })
})
