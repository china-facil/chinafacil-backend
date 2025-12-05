import { createTestContext, TestContext } from './test-helper'

describe('Subscriptions API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe("POST /api/subscriptions", () => {
    it("should create subscription successfully", async () => {
      const email = `testuser-${Date.now()}@example.com`;
      const userRes = await ctx.authReq.post("/api/users").send({ name: "Test User", email, password: "password123" });
      const clientRes = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      const res = await ctx.authReq
        .post("/api/subscriptions")
        .send({ userId: userRes.body.id, planId: clientRes.body.id });
      expect(res.status).toBe(201);
    });

    it("should return 404 for non-existent plan", async () => {
      const email = `testuser-${Date.now()}@example.com`;
      const userRes = await ctx.authReq.post("/api/users").send({ name: "Test User", email, password: "password123" });
      const res = await ctx.authReq
        .post("/api/subscriptions")
        .send({ userId: userRes.body.id, planId: "00000000-0000-0000-0000-000000000000" });
      expect(res.status).toBe(404);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.authReq.post("/api/subscriptions").send({});
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/subscriptions").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/subscriptions", () => {
    it("should list subscriptions successfully", async () => {
      const res = await ctx.authReq.get("/api/subscriptions");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/subscriptions");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/subscriptions/user/:userId", () => {
    it("should return 200 for user (empty list if none)", async () => {
      const res = await ctx.authReq.get(`/api/subscriptions/user/${ctx.adminUserId}`);
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/subscriptions/user/some-id");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/subscriptions/:id", () => {
    it("should get subscription details successfully", async () => {
      const email = `testuser-${Date.now()}@example.com`;
      const userRes = await ctx.authReq.post("/api/users").send({ name: "Test User", email, password: "password123" });
      const clientRes = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      const createRes = await ctx.authReq
        .post("/api/subscriptions")
        .send({ userId: userRes.body.id, planId: clientRes.body.id });
      const res = await ctx.authReq.get(`/api/subscriptions/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent subscription", async () => {
      const res = await ctx.authReq.get("/api/subscriptions/99999");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/subscriptions/1");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/subscriptions/:id/cancel", () => {
    it("should cancel subscription successfully", async () => {
      const email = `testuser-${Date.now()}@example.com`;
      const userRes = await ctx.authReq.post("/api/users").send({ name: "Test User", email, password: "password123" });
      const clientRes = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      const createRes = await ctx.authReq
        .post("/api/subscriptions")
        .send({ userId: userRes.body.id, planId: clientRes.body.id });
      const res = await ctx.authReq.post(`/api/subscriptions/${createRes.body.id}/cancel`);
      expect(res.status).toBe(201);
    });

    it("should return 404 for non-existent subscription", async () => {
      const res = await ctx.authReq.post("/api/subscriptions/99999/cancel");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/subscriptions/1/cancel");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/subscriptions/:id/activate", () => {
    it("should activate subscription successfully", async () => {
      const email = `testuser-${Date.now()}@example.com`;
      const userRes = await ctx.authReq.post("/api/users").send({ name: "Test User", email, password: "password123" });
      const clientRes = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      const createRes = await ctx.authReq
        .post("/api/subscriptions")
        .send({ userId: userRes.body.id, planId: clientRes.body.id });
      await ctx.authReq.post(`/api/subscriptions/${createRes.body.id}/cancel`);
      const res = await ctx.authReq.post(`/api/subscriptions/${createRes.body.id}/activate`);
      expect(res.status).toBe(201);
    });

    it("should return 404 for non-existent subscription", async () => {
      const res = await ctx.authReq.post("/api/subscriptions/99999/activate");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/subscriptions/1/activate");
      expect(res.status).toBe(401);
    });
  });
})
