import { createTestContext, TestContext } from "./test-helper";

describe("User Addresses API (Integration)", () => {
  let ctx: TestContext;

  const createAddressPayload = () => ({
    street: "Rua Teste",
    number: "123",
    complement: "Apto 101",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    postalCode: "01000-000",
  });

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  describe("POST /api/user-addresses", () => {
    it("should create address successfully", async () => {
      const res = await ctx.authReq.post("/api/user-addresses").send(createAddressPayload());
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.authReq.post("/api/user-addresses").send({});
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/user-addresses").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/user-addresses", () => {
    it("should list user addresses successfully", async () => {
      const res = await ctx.authReq.get("/api/user-addresses");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/user-addresses");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/user-addresses/:id", () => {
    it("should get address details successfully", async () => {
      const createRes = await ctx.authReq.post("/api/user-addresses").send(createAddressPayload());
      const res = await ctx.authReq.get(`/api/user-addresses/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent address", async () => {
      const res = await ctx.authReq.get("/api/user-addresses/00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/user-addresses/some-id");
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/user-addresses/:id", () => {
    it("should update address successfully", async () => {
      const createRes = await ctx.authReq.post("/api/user-addresses").send(createAddressPayload());
      const res = await ctx.authReq
        .patch(`/api/user-addresses/${createRes.body.id}`)
        .send({ street: "Rua Atualizada" });
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent address", async () => {
      const res = await ctx.authReq
        .patch("/api/user-addresses/00000000-0000-0000-0000-000000000000")
        .send({ street: "Test" });
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.patch("/api/user-addresses/some-id").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/user-addresses/:id", () => {
    it("should delete address successfully", async () => {
      const createRes = await ctx.authReq.post("/api/user-addresses").send(createAddressPayload());
      const res = await ctx.authReq.delete(`/api/user-addresses/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent address", async () => {
      const res = await ctx.authReq.delete("/api/user-addresses/00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.delete("/api/user-addresses/some-id");
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/user-addresses/:id/default", () => {
    it("should set address as default successfully", async () => {
      const createRes = await ctx.authReq.post("/api/user-addresses").send(createAddressPayload());
      const res = await ctx.authReq.patch(`/api/user-addresses/${createRes.body.id}/default`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent address", async () => {
      const res = await ctx.authReq.patch("/api/user-addresses/00000000-0000-0000-0000-000000000000/default");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.patch("/api/user-addresses/some-id/default");
      expect(res.status).toBe(401);
    });
  });
});
