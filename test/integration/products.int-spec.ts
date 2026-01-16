import { createTestContext, TestContext } from "./test-helper";
import { ProductsService } from "../../src/modules/products/services/products.service";
import { TmService } from "../../src/integrations/china-marketplace/services/tm.service";
import { OtService } from "../../src/integrations/china-marketplace/services/ot.service";

describe("Products API (Integration)", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();

    const productsService = ctx.moduleFixture.get(ProductsService);
    const tmService = ctx.moduleFixture.get(TmService);
    const otService = ctx.moduleFixture.get(OtService);

    const mockProductData = {
      code: 200,
      data: {
        itemId: "123456",
        title: "Test Product",
        price: 100,
        currency: "CNY",
        images: ["https://example.com/image.jpg"],
        skus: [],
        specifications: {},
      },
    };

    const mockSearchResponse = {
      code: 200,
      data: {
        items: [],
        total_count: 0,
      },
    };

    jest.spyOn(productsService, "translateKeywordToChinese" as any).mockResolvedValue("笔记本电脑");
    jest.spyOn(productsService, "translateKeywordToEnglish" as any).mockResolvedValue("laptop");
    jest.spyOn(tmService, "searchProductsByKeyword").mockResolvedValue(mockSearchResponse);
    jest.spyOn(otService, "searchProductsByKeywordAlibaba").mockResolvedValue(mockSearchResponse);
    jest.spyOn(tmService, "getProductDetails").mockResolvedValue(mockProductData);
    jest.spyOn(tmService, "getProductSkuDetails").mockResolvedValue(mockProductData);
    jest.spyOn(tmService, "getProductShipping").mockResolvedValue({
      code: 200,
      data: { shippingCost: 10 },
    });
    jest.spyOn(tmService, "getProductStatistics").mockResolvedValue({
      code: 200,
      data: { sales: 100 },
    });
    jest.spyOn(tmService, "getProductDescription").mockResolvedValue({
      code: 200,
      data: { description: "Test description" },
    });
    jest.spyOn(otService, "getProductDetailsAlibaba").mockResolvedValue(mockProductData);
    jest.spyOn(productsService, "getDetails1688").mockResolvedValue(mockProductData);
    jest.spyOn(productsService, "getDetailsAlibabaIntl").mockResolvedValue(mockProductData);
    jest.spyOn(productsService, "getSku1688").mockResolvedValue(mockProductData);
    jest.spyOn(productsService, "getShipping1688").mockResolvedValue({
      code: 200,
      data: { shippingCost: 10 },
    });
    jest.spyOn(productsService, "show").mockResolvedValue({
      status: "success",
      data: mockProductData.data,
    });
    jest.spyOn(productsService, "getProductDetails").mockResolvedValue({
      status: "success",
      data: mockProductData.data,
    });
    jest.spyOn(productsService, "getProductSkuDetails").mockResolvedValue({
      status: "success",
      data: mockProductData.data,
    });
    jest.spyOn(productsService, "getProductStatistics").mockResolvedValue({
      status: "success",
      data: { sales: 100 },
    });
    jest.spyOn(productsService, "getProductDescription").mockResolvedValue({
      status: "success",
      data: { description: "Test description" },
    });
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
        productId: `123456`,
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
      const productId = `123456`;
      await ctx.authReq.post("/api/products/favorites").send({
        productId,
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
