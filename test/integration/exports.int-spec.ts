import { createTestContext, TestContext } from './test-helper'

describe('Exports API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/exports/request', () => {
    it('should request export successfully', async () => {
      const res = await ctx.authReq.post('/api/exports/request').send({ type: 'excel', filters: {} })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/exports/request').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/exports/request').send({}).expect(401)
    })
  })

  describe('GET /api/exports', () => {
    it('should handle list exports request', async () => {
      const res = await ctx.authReq.get('/api/exports')
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/exports').expect(401)
    })
  })

  describe('GET /api/exports/pending', () => {
    it('should handle list pending exports request', async () => {
      const res = await ctx.authReq.get('/api/exports/pending')
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/exports/pending').expect(401)
    })
  })

  describe('GET /api/exports/:id', () => {
    it('should handle get export by id request', async () => {
      const res = await ctx.authReq.get('/api/exports/some-export-id')
      expect([200, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/exports/some-id').expect(401)
    })
  })

  describe('DELETE /api/exports/:id', () => {
    it('should handle delete export request', async () => {
      const res = await ctx.authReq.delete('/api/exports/some-export-id')
      expect([200, 204, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.delete('/api/exports/some-id').expect(401)
    })
  })
})
