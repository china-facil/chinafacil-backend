import { createTestContext, TestContext } from "./test-helper";

describe("Clients API (Integration)", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  describe("POST /api/clients", () => {
    it("should create client successfully", async () => {
      const res = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.authReq.post("/api/clients").send({});
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/clients").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/clients", () => {
    it("should list clients successfully", async () => {
      const res = await ctx.authReq.get("/api/clients");
      expect(res.status).toBe(200);
    });

    it("should return 400 with invalid query params", async () => {
      const res = await ctx.authReq.get("/api/clients?page=-1");
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/clients");
      expect(res.status).toBe(401);
    });
  });

  const simpleGetEndpoints = [{ path: "/api/clients/active-plans", description: "list clients with active plans" }];

  simpleGetEndpoints.forEach(({ path, description }) => {
    describe(`GET ${path}`, () => {
      it(`should ${description} successfully`, async () => {
        const res = await ctx.authReq.get(path);
        expect(res.status).toBe(200);
      });

      it("should return 401 without auth", async () => {
        const res = await ctx.req.get(path);
        expect(res.status).toBe(401);
      });
    });
  });

  describe("GET /api/clients/:id", () => {
    it("should get client details successfully", async () => {
      const createRes = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      const res = await ctx.authReq.get(`/api/clients/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent client", async () => {
      const res = await ctx.authReq.get("/api/clients/non-existent-id");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/clients/some-id");
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/clients/:id", () => {
    it("should update client successfully", async () => {
      const createRes = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      const res = await ctx.authReq.patch(`/api/clients/${createRes.body.id}`).send({ name: "Updated Client" });
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent client", async () => {
      const res = await ctx.authReq.patch("/api/clients/non-existent-id").send({ name: "Updated" });
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.patch("/api/clients/some-id").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/clients/:clientId/users/:userId", () => {
    it("should attach user to client successfully", async () => {
      const createRes = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      const res = await ctx.authReq.post(`/api/clients/${createRes.body.id}/users/${ctx.adminUserId}`);
      expect(res.status).toBe(201);
    });

    it("should return 404 for non-existent client", async () => {
      const res = await ctx.authReq.post(`/api/clients/non-existent-id/users/${ctx.adminUserId}`);
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/clients/some-id/users/some-user");
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/clients/:id", () => {
    it("should delete client successfully", async () => {
      const createRes = await ctx.authReq.post("/api/clients").send({ name: "Test Client", price: 100 });
      const res = await ctx.authReq.delete(`/api/clients/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent client", async () => {
      const res = await ctx.authReq.delete("/api/clients/non-existent-id");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.delete("/api/clients/some-id");
      expect(res.status).toBe(401);
    });
  });
});
