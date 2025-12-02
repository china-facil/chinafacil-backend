process.env.NODE_ENV = 'test'

import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import * as bcrypt from 'bcrypt'
import { UserRole, UserStatus } from '@prisma/client'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/database/prisma.service'

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete'

export interface TestContext {
  app: INestApplication
  prisma: PrismaService
  authToken: string
  adminUserId: string
  req: {
    get: (url: string) => request.Test
    post: (url: string) => request.Test
    patch: (url: string) => request.Test
    put: (url: string) => request.Test
    delete: (url: string) => request.Test
  }
  authReq: {
    get: (url: string) => request.Test
    post: (url: string) => request.Test
    patch: (url: string) => request.Test
    put: (url: string) => request.Test
    delete: (url: string) => request.Test
  }
}

let sharedApp: INestApplication | null = null
let sharedPrisma: PrismaService | null = null

async function getOrCreateApp(): Promise<{ app: INestApplication; prisma: PrismaService }> {
  if (sharedApp && sharedPrisma) {
    return { app: sharedApp, prisma: sharedPrisma }
  }

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  await app.init()

  sharedApp = app
  sharedPrisma = moduleFixture.get<PrismaService>(PrismaService)
  
  return { app: sharedApp, prisma: sharedPrisma }
}

function createRequestHelpers(app: INestApplication, authToken?: string) {
  const server = app.getHttpServer()
  
  const req = {
    get: (url: string) => request(server).get(url),
    post: (url: string) => request(server).post(url),
    patch: (url: string) => request(server).patch(url),
    put: (url: string) => request(server).put(url),
    delete: (url: string) => request(server).delete(url),
  }

  const authReq = {
    get: (url: string) => request(server).get(url).set('Authorization', `Bearer ${authToken}`),
    post: (url: string) => request(server).post(url).set('Authorization', `Bearer ${authToken}`),
    patch: (url: string) => request(server).patch(url).set('Authorization', `Bearer ${authToken}`),
    put: (url: string) => request(server).put(url).set('Authorization', `Bearer ${authToken}`),
    delete: (url: string) => request(server).delete(url).set('Authorization', `Bearer ${authToken}`),
  }

  return { req, authReq }
}

export async function createTestContext(options?: { withAuth?: boolean }): Promise<TestContext> {
  const { app, prisma } = await getOrCreateApp()
  
  let authToken = ''
  let adminUserId = ''

  if (options?.withAuth !== false) {
    const email = `test-admin-${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash('password123', 10)
    const user = await prisma.user.create({
      data: { name: 'Test Admin', email, password: hashedPassword, role: UserRole.admin, status: UserStatus.active }
    })
    adminUserId = user.id

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'password123' })
    authToken = loginRes.body.token
  }

  const { req, authReq } = createRequestHelpers(app, authToken)

  return { app, prisma, authToken, adminUserId, req, authReq }
}

export async function closeTestContext(): Promise<void> {
  if (sharedApp) {
    await sharedApp.close()
    sharedApp = null
    sharedPrisma = null
  }
}
