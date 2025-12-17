import { createTestContext, TestContext } from "./test-helper";

describe("Solicitations API (Integration)", () => {
  let ctx: TestContext;

  const createSolicitationPayload = (userId: string) => ({
    userId,
    type: "supplier_search",
    quantity: 10,
  });

  const createSolicitationItemPayload = () => ({
    actionOf: "chinafacil",
    clientActionRequired: false,
    message: "Item de teste para solicitação",
    status: "open",
  });

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  describe("POST /api/solicitations", () => {
    it("should create solicitation successfully", async () => {
      const res = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.authReq.post("/api/solicitations").send({});
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/solicitations").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/solicitations", () => {
    it("should list solicitations successfully", async () => {
      const res = await ctx.authReq.get("/api/solicitations");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/solicitations");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/solicitations/statistics", () => {
    it("should get statistics successfully", async () => {
      const res = await ctx.authReq.get("/api/solicitations/statistics");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/solicitations/statistics");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/solicitations/kanban", () => {
    it("should get kanban board successfully", async () => {
      const res = await ctx.authReq.get("/api/solicitations/kanban");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/solicitations/kanban");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/solicitations/:id", () => {
    it("should get solicitation details successfully", async () => {
      const createRes = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      const res = await ctx.authReq.get(`/api/solicitations/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent solicitation", async () => {
      const res = await ctx.authReq.get("/api/solicitations/00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/solicitations/some-id");
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/solicitations/:id", () => {
    it("should update solicitation successfully", async () => {
      const createRes = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      const res = await ctx.authReq.patch(`/api/solicitations/${createRes.body.id}`).send({ type: "viability_study" });
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent solicitation", async () => {
      const res = await ctx.authReq
        .patch("/api/solicitations/00000000-0000-0000-0000-000000000000")
        .send({ type: "test" });
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.patch("/api/solicitations/some-id").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/solicitations/:id", () => {
    it("should delete solicitation successfully", async () => {
      const createRes = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      const res = await ctx.authReq.delete(`/api/solicitations/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent solicitation", async () => {
      const res = await ctx.authReq.delete("/api/solicitations/00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.delete("/api/solicitations/some-id");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/solicitations/:id/assign/responsibility", () => {
    it("should assign responsibility successfully", async () => {
      const createRes = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      const res = await ctx.authReq
        .post(`/api/solicitations/${createRes.body.id}/assign/responsibility`)
        .send({ responsibleType: "User", responsibleId: ctx.adminUserId });
      expect(res.status).toBe(201);
    });

    it("should return 404 for non-existent solicitation", async () => {
      const res = await ctx.authReq
        .post("/api/solicitations/00000000-0000-0000-0000-000000000000/assign/responsibility")
        .send({ responsibleType: "User", responsibleId: ctx.adminUserId });
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/solicitations/some-id/assign/responsibility").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/solicitations/:solicitationId/items", () => {
    it("should add item to solicitation successfully", async () => {
      const createRes = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      const res = await ctx.authReq
        .post(`/api/solicitations/${createRes.body.id}/items`)
        .send(createSolicitationItemPayload());
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid payload", async () => {
      const createRes = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      const res = await ctx.authReq.post(`/api/solicitations/${createRes.body.id}/items`).send({});
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/solicitations/some-id/items").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/solicitations/:solicitationId/items/:itemId", () => {
    it("should remove item from solicitation successfully", async () => {
      const createRes = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      const itemRes = await ctx.authReq
        .post(`/api/solicitations/${createRes.body.id}/items`)
        .send(createSolicitationItemPayload());
      const res = await ctx.authReq.delete(`/api/solicitations/${createRes.body.id}/items/${itemRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent item", async () => {
      const createRes = await ctx.authReq.post("/api/solicitations").send(createSolicitationPayload(ctx.adminUserId));
      const res = await ctx.authReq.delete(
        `/api/solicitations/${createRes.body.id}/items/00000000-0000-0000-0000-000000000000`
      );
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.delete("/api/solicitations/some-id/items/some-item-id");
      expect(res.status).toBe(401);
    });
  });
});
