import { createTestContext, TestContext } from './test-helper'

describe('Exports API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/exports/request', () => {
    it('should request export successfully', async () => {
      const res = await ctx.authReq.post('/api/exports/request').send({
        type: 'csv',
        model: 'User',
      })
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('status', 'success')
      expect(res.body).toHaveProperty('jobId')
    })

    it('should return 400 with invalid payload', async () => {
      await ctx.authReq.post('/api/exports/request').send({}).expect(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/exports/request').send({ type: 'csv', model: 'User' }).expect(401)
    })
  })

  describe('POST /api/exports/download-direct', () => {
    it('should generate and download export successfully', async () => {
      const res = await ctx.authReq.post('/api/exports/download-direct').send({
        type: 'csv',
        model: 'User',
      })
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/csv')
      expect(res.headers['content-disposition']).toContain('attachment')
    })

    it('should return 400 with invalid payload', async () => {
      await ctx.authReq.post('/api/exports/download-direct').send({}).expect(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/exports/download-direct').send({ type: 'csv', model: 'User' }).expect(401)
    })
  })
})
