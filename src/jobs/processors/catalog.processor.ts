import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { PrismaService } from '../../database/prisma.service'
import { MercadoLivreService } from '../../integrations/marketplace/mercado-livre.service'
import {
  ProcessCatalogJobDto,
  ProcessCategoryJobDto,
  AddProductToCatalogJobDto,
} from '../dto/catalog-job.dto'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

@Processor('catalog-queue')
export class CatalogProcessor {
  private readonly logger = new Logger(CatalogProcessor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoLivreService: MercadoLivreService,
    @InjectQueue('catalog-queue') private readonly catalogQueue: Queue,
  ) {}

  @Process('process-catalog')
  async handleProcessCatalog(job: Job<ProcessCatalogJobDto>) {
    this.logger.log(`Processing catalog job ${job.id}`)

    try {
      const categories = await this.mercadoLivreService.categoriesList()

      if (!categories || !Array.isArray(categories)) {
        throw new Error('Categorias não retornadas corretamente')
      }

      for (const category of categories) {
        await this.catalogQueue.add('process-category', {
          categoryId: category.id,
        } as ProcessCategoryJobDto)
      }

      this.logger.log(`Dispatched ${categories.length} category jobs`)
      return { processed: categories.length }
    } catch (error: any) {
      this.logger.error(
        `Failed to process catalog: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Process('process-category')
  async handleProcessCategory(job: Job<ProcessCategoryJobDto>) {
    this.logger.log(
      `Processing category ${job.data.categoryId} job ${job.id}`,
    )

    try {
      const { categoryId, offset = 0, limit = 25 } = job.data

      const products = await this.mercadoLivreService.getProductsByCategory(
        categoryId,
        { offset, limit },
      )

      if (!products?.results || !Array.isArray(products.results)) {
        this.logger.warn(`Nenhum produto encontrado para categoria ${categoryId}`)
        return { processed: 0 }
      }

      for (const mlProduct of products.results) {
        await this.catalogQueue.add('add-product-to-catalog', {
          categoryId,
          mlProductId: mlProduct.id,
          mlProductData: {
            id: mlProduct.id,
            title: mlProduct.title,
            price: mlProduct.price,
            thumbnail: mlProduct.thumbnail,
            permalink: mlProduct.permalink,
            sold_quantity: mlProduct.sold_quantity,
            sold_value: mlProduct.sold_value,
          },
        } as AddProductToCatalogJobDto)
      }

      this.logger.log(
        `Dispatched ${products.results.length} product jobs for category ${categoryId}`,
      )

      if (products.paging?.total > offset + limit) {
        await this.catalogQueue.add(
          'process-category',
          {
            categoryId,
            offset: offset + limit,
            limit,
          } as ProcessCategoryJobDto,
          { delay: 1000 },
        )
      }

      return { processed: products.results.length }
    } catch (error: any) {
      this.logger.error(
        `Failed to process category: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Process('add-product-to-catalog')
  async handleAddProductToCatalog(job: Job<AddProductToCatalogJobDto>) {
    this.logger.log(`Adding product ${job.data.mlProductId} to catalog`)

    try {
      const { categoryId, mlProductData, product1688Data } = job.data

      const existingProduct = await this.prisma.productCatalog.findFirst({
        where: { itemId: mlProductData.id },
      })

      const productData = {
        itemId: mlProductData.id,
        title: mlProductData.title,
        price: mlProductData.price,
        imageUrl: mlProductData.thumbnail || '',
        categoryIds: [categoryId],
        salesQuantity: mlProductData.sold_quantity || 0,
        metadata: {
          mlb: {
            permalink: mlProductData.permalink,
            sold_value: mlProductData.sold_value,
          },
          product1688: product1688Data || null,
        },
      }

      if (existingProduct) {
        const existingCategories =
          (existingProduct.categoryIds as string[]) || []
        const updatedCategories = existingCategories.includes(categoryId)
          ? existingCategories
          : [...existingCategories, categoryId]

        await this.prisma.productCatalog.update({
          where: { id: existingProduct.id },
          data: {
            ...productData,
            categoryIds: updatedCategories,
          },
        })
        this.logger.debug(`Product ${mlProductData.id} updated`)
      } else {
        await this.prisma.productCatalog.create({
          data: productData,
        })
        this.logger.debug(`Product ${mlProductData.id} added`)
      }

      return { success: true, productId: mlProductData.id }
    } catch (error: any) {
      this.logger.error(
        `Failed to add product to catalog: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }
}

