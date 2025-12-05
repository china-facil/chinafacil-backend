process.env.NODE_ENV = "test";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bull";
import { Queue } from "bull";
import * as request from "supertest";
import * as bcrypt from "bcrypt";
import { UserRole, UserStatus } from "@prisma/client";
import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/database/prisma.service";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

type HttpMethod = "get" | "post" | "patch" | "put" | "delete";

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  authToken: string;
  adminUserId: string;
  req: {
    get: (url: string) => request.Test;
    post: (url: string) => request.Test;
    patch: (url: string) => request.Test;
    put: (url: string) => request.Test;
    delete: (url: string) => request.Test;
  };
  authReq: {
    get: (url: string) => request.Test;
    post: (url: string) => request.Test;
    patch: (url: string) => request.Test;
    put: (url: string) => request.Test;
    delete: (url: string) => request.Test;
  };
}

let sharedApp: INestApplication | null = null;
let sharedPrisma: PrismaService | null = null;
let sharedModuleFixture: TestingModule | null = null;

async function getOrCreateApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
  moduleFixture: TestingModule;
}> {
  if (sharedApp && sharedPrisma && sharedModuleFixture) {
    return { app: sharedApp, prisma: sharedPrisma, moduleFixture: sharedModuleFixture };
  }

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  await app.init();

  sharedApp = app;
  sharedPrisma = moduleFixture.get<PrismaService>(PrismaService);
  sharedModuleFixture = moduleFixture;

  return { app: sharedApp, prisma: sharedPrisma, moduleFixture: sharedModuleFixture };
}

function createRequestHelpers(app: INestApplication, authToken?: string) {
  const server = app.getHttpServer();

  const req = {
    get: (url: string) => request(server).get(url),
    post: (url: string) => request(server).post(url),
    patch: (url: string) => request(server).patch(url),
    put: (url: string) => request(server).put(url),
    delete: (url: string) => request(server).delete(url),
  };

  const authReq = {
    get: (url: string) => request(server).get(url).set("Authorization", `Bearer ${authToken}`),
    post: (url: string) => request(server).post(url).set("Authorization", `Bearer ${authToken}`),
    patch: (url: string) => request(server).patch(url).set("Authorization", `Bearer ${authToken}`),
    put: (url: string) => request(server).put(url).set("Authorization", `Bearer ${authToken}`),
    delete: (url: string) => request(server).delete(url).set("Authorization", `Bearer ${authToken}`),
  };

  return { req, authReq };
}

export async function createTestContext(options?: { withAuth?: boolean }): Promise<TestContext> {
  const { app, prisma } = await getOrCreateApp();

  let authToken = "";
  let adminUserId = "";

  if (options?.withAuth !== false) {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${process.pid}`;
    const email = `test-admin-${uniqueId}@example.com`;
    const hashedPassword = await bcrypt.hash("password123", 10);

    let user;
    try {
      user = await prisma.user.create({
        data: { name: "Test Admin", email, password: hashedPassword, role: UserRole.admin, status: UserStatus.active },
      });
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
        if (existingUser) {
          user = existingUser;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    adminUserId = user.id;

    const loginRes = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email, password: "password123" });
    authToken = loginRes.body.token;
  }

  const { req, authReq } = createRequestHelpers(app, authToken);

  return { app, prisma, authToken, adminUserId, req, authReq };
}

export async function closeTestContext(): Promise<void> {
  if (sharedApp && sharedModuleFixture) {
    const queueNames = ["email-queue", "export-queue", "catalog-queue", "lead-queue", "product-similarity-queue"];

    for (const queueName of queueNames) {
      try {
        const queue = sharedModuleFixture.get<Queue>(getQueueToken(queueName), { strict: false });
        if (queue) {
          await queue.close();
        }
      } catch (error) {
        // Ignora erros se a fila não existir ou já estiver fechada
      }
    }

    await sharedApp.close();
    sharedApp = null;
    sharedPrisma = null;
    sharedModuleFixture = null;
  }
}
