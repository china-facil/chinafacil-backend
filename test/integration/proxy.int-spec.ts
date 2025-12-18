import { createTestContext, TestContext } from './test-helper'

describe('Proxy API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('GET /api/image', () => {
    it('should proxy image successfully', async () => {
      const imageUrl = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
      const res = await ctx.req.get(`/api/image?url=${encodeURIComponent(imageUrl)}`)
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/image\//)
    }, 60000)

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
      expect(res.status).toBe(200)
      expect(res.body).toBeDefined()
    })
  })
})

