import { createTestContext, TestContext } from "./test-helper";

describe("Products API (Integration)", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  describe("GET /api/products/search/1688", () => {
    it("should search products successfully", async () => {
      const res = await ctx.req.get("/api/products/search/1688?keyword=laptop");
      expect(res.status).toBe(200);
    });

    it("should return 400 without keyword", async () => {
      const res = await ctx.req.get("/api/products/search/1688");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/products/search/alibaba", () => {
    it("should search products successfully", async () => {
      const res = await ctx.req.get("/api/products/search/alibaba?keyword=laptop");
      expect(res.status).toBe(200);
    });

    it("should return 400 without keyword", async () => {
      const res = await ctx.req.get("/api/products/search/alibaba");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/products/search/mixed", () => {
    it("should search products on both platforms", async () => {
      const res = await ctx.req.get("/api/products/search/mixed?keyword=laptop");
      expect(res.status).toBe(200);
    });

    it("should return 400 without keyword", async () => {
      const res = await ctx.req.get("/api/products/search/mixed");
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/products/search/image/1688", () => {
    it("should search by image successfully", async () => {
      const res = await ctx.req.post("/api/products/search/image/1688").send({
        imgUrl: "https://example.com/image.jpg",
      });
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.req.post("/api/products/search/image/1688").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/products/search/image/alibaba", () => {
    it("should search by image successfully", async () => {
      const res = await ctx.req.post("/api/products/search/image/alibaba").send({
        imgUrl: "https://example.com/image.jpg",
      });
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.req.post("/api/products/search/image/alibaba").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/products/details/1688/:itemId", () => {
    it("should get product details", async () => {
      const res = await ctx.req.get("/api/products/details/1688/123456");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/details/alibaba/:productId", () => {
    it("should get product details", async () => {
      const res = await ctx.req.get("/api/products/details/alibaba/123456");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/sku/1688/:itemId", () => {
    it("should get product SKUs", async () => {
      const res = await ctx.req.get("/api/products/sku/1688/123456");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/shipping/1688/:itemId", () => {
    it("should get shipping info", async () => {
      const res = await ctx.req.get("/api/products/shipping/1688/123456?quantity=1");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/details/:id", () => {
    it("should get product properties", async () => {
      const res = await ctx.req.get("/api/products/details/123456");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/skus/:id", () => {
    it("should get product SKUs", async () => {
      const res = await ctx.req.get("/api/products/skus/123456");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/shipping", () => {
    it("should get shipping info with auth", async () => {
      const res = await ctx.authReq.get("/api/products/shipping?item_id=123456");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/products/shipping?item_id=123456");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/products/popular", () => {
    it("should get popular products", async () => {
      const res = await ctx.req.get("/api/products/popular");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/categories", () => {
    it("should get categories", async () => {
      const res = await ctx.req.get("/api/products/categories");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/category/:categoryId", () => {
    it("should get products by category", async () => {
      const res = await ctx.req.get("/api/products/category/MLB1234");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/category/info/:categoryId", () => {
    it("should get category info", async () => {
      const res = await ctx.req.get("/api/products/category/info/MLB1234");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/statistics/:itemId", () => {
    it("should get product statistics", async () => {
      const res = await ctx.req.get("/api/products/statistics/123456");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/description/:itemId", () => {
    it("should get product description", async () => {
      const res = await ctx.req.get("/api/products/description/123456");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should get product complete details", async () => {
      const res = await ctx.req.get("/api/products/123456");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/products/favorites", () => {
    it("should add product to favorites", async () => {
      const res = await ctx.authReq.post("/api/products/favorites").send({
        productId: `test-product-${Date.now()}`,
        productData: { name: "Test Product", price: 100 },
      });
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.authReq.post("/api/products/favorites").send({});
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/products/favorites").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/products/favorites", () => {
    it("should get user favorites", async () => {
      const res = await ctx.authReq.get("/api/products/favorites");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/products/favorites");
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/products/favorites/:productId", () => {
    it("should remove product from favorites", async () => {
      const productId = `test-product-delete-${Date.now()}`;
      await ctx.authReq.post("/api/products/favorites").send({
        productId,
        productData: { name: "Test Product", price: 100 },
      });
      const res = await ctx.authReq.delete(`/api/products/favorites/${productId}`);
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.delete("/api/products/favorites/test-product");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/products/search/suggestions-cnae", () => {
    it("should return 400 when user has no company data", async () => {
      const res = await ctx.authReq.get("/api/products/search/suggestions-cnae");
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/products/search/suggestions-cnae");
      expect(res.status).toBe(401);
    });
  });
});
