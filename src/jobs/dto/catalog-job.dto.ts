export interface ProcessCatalogJobDto {
  categoryId?: string
}

export interface ProcessCategoryJobDto {
  categoryId: string
  offset?: number
  limit?: number
}

export interface AddProductToCatalogJobDto {
  categoryId: string
  mlProductId: string
  mlProductData: {
    id: string
    title: string
    price: number
    thumbnail?: string
    permalink?: string
    sold_quantity?: number
    sold_value?: number
  }
  product1688Data?: {
    item_id: string
    price?: number
    goods_score?: number
    title?: string
    translated_title?: string
    quantity_begin?: number
  }
}




