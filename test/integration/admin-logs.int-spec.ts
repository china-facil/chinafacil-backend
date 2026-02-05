import { createTestContext, TestContext } from './test-helper'
import { UserRole } from '@prisma/client'

describe('Admin Logs API (Integration)', () => {
  let ctx: TestContext
  let testUserId: string

  beforeAll(async () => {
    ctx = await createTestContext()

    const createUserRes = await ctx.authReq.post('/api/users').send({
      name: 'Test User for Logs',
      email: `test-user-${Date.now()}@example.com`,
      password: 'password123',
      role: 'user',
    })
    testUserId = createUserRes.body.id
  })

  describe('GET /api/admin-logs', () => {
    it('should list admin logs successfully', async () => {
      const res = await ctx.authReq.get('/api/admin-logs')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body).toHaveProperty('meta')
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('should return 400 with invalid date filter', async () => {
      const res = await ctx.authReq.get('/api/admin-logs').query({
        startDate: 'invalid-date',
      })
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/admin-logs')
      expect(res.status).toBe(401)
    })
  })

  describe('Admin action logging', () => {
    it('should create log when admin creates user', async () => {
      await ctx.authReq.post('/api/users').send({
        name: 'New Test User',
        email: `new-user-${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
      })

      const logsRes = await ctx.authReq.get('/api/admin-logs')
      expect(logsRes.status).toBe(200)
      const createLog = logsRes.body.data.find(
        (log: any) => log.action === 'CREATE' && log.resource === 'user',
      )
      expect(createLog).toBeDefined()
    })

    it('should create log when admin updates user', async () => {
      await ctx.authReq.patch(`/api/users/${testUserId}`).send({
        name: 'Updated Test User',
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      const logsRes = await ctx.authReq.get('/api/admin-logs')
      expect(logsRes.status).toBe(200)
      const updateLog = logsRes.body.data.find(
        (log: any) => log.action === 'UPDATE' && log.resource === 'user',
      )
      expect(updateLog).toBeDefined()
    })

    it('should create log when admin deletes user', async () => {
      const deleteUserRes = await ctx.authReq.post('/api/users').send({
        name: 'User to Delete',
        email: `delete-user-${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
      })
      const userIdToDelete = deleteUserRes.body.id

      await ctx.authReq.delete(`/api/users/${userIdToDelete}`)

      await new Promise(resolve => setTimeout(resolve, 500))

      const logsRes = await ctx.authReq.get('/api/admin-logs')
      expect(logsRes.status).toBe(200)
      const deleteLog = logsRes.body.data.find(
        (log: any) => log.action === 'DELETE' && log.resource === 'user',
      )
      expect(deleteLog).toBeDefined()
    })
  })

  describe('Filter admin logs', () => {
    it('should filter logs by action type', async () => {
      const res = await ctx.authReq.get('/api/admin-logs').query({
        action: 'CREATE',
      })
      expect(res.status).toBe(200)
      expect(res.body.data.every((log: any) => log.action === 'CREATE')).toBe(
        true,
      )
    })

    it('should filter logs by date range', async () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const res = await ctx.authReq.get('/api/admin-logs').query({
        startDate: yesterday.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      })
      expect(res.status).toBe(200)
    })

    it('should filter logs by search text', async () => {
      const res = await ctx.authReq.get('/api/admin-logs').query({
        search: 'user',
      })
      expect(res.status).toBe(200)
    })
  })
})

