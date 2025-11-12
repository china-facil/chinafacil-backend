export interface NormalizedProduct {
  id: string
  title: string
  price: number
  originalPrice?: number
  currency: string
  imageUrl: string
  images: string[]
  supplier: {
    id: string
    name: string
    location?: string
  }
  specifications: Array<{ name: string; value: string }>
  minimumOrder?: number
  salesQuantity?: number
  rating?: number
  url: string
  provider: 'alibaba_1688' | 'alibaba_intl'
  descriptionHtml?: string
  descriptionImages?: string[]
  categoryPath?: string[]
  [key: string]: any
}

