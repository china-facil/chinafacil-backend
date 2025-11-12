import { Injectable } from '@nestjs/common'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class Alibaba1688Normalizer {
  normalizeSearchItem(item: any): NormalizedProduct {
    return {
      id: item.item_id?.toString() || item.id?.toString() || '',
      title: item.title || item.item_title || '',
      price: this.parsePrice(item.price || item.sale_price),
      originalPrice: this.parsePrice(item.original_price),
      currency: 'CNY',
      imageUrl: this.normalizeImageUrl(item.pic_url || item.image_url || item.pic),
      images: this.normalizeImages(item.images || item.pic_url || []),
      supplier: {
        id: item.seller_id?.toString() || '',
        name: item.shop_name || item.seller_name || '',
        location: item.location || '',
      },
      specifications: [],
      minimumOrder: item.moq || item.minimum_order || 1,
      salesQuantity: parseInt(item.sales_quantity || item.sales || '0', 10),
      rating: item.rate_percentage || 0,
      url: item.detail_url || item.url || '',
      provider: 'alibaba_1688',
    }
  }

  normalizeDetailedItem(item: any): NormalizedProduct {
    const basicProduct = this.normalizeSearchItem(item)

    return {
      ...basicProduct,
      descriptionHtml: item.detail_html || item.description || '',
      descriptionImages: item.detail_imgs || [],
      specifications: this.normalizeSpecifications(item.product_props || item.specifications || []),
      categoryPath: item.category_path || [],
    }
  }

  private parsePrice(price: any): number {
    if (!price) return 0
    if (typeof price === 'number') return price
    if (typeof price === 'string') {
      const cleanPrice = price.replace(/[^0-9.]/g, '')
      return parseFloat(cleanPrice) || 0
    }
    return 0
  }

  private normalizeImageUrl(url: string | any): string {
    if (!url) return ''
    if (typeof url !== 'string') return ''
    
    if (!url.startsWith('http')) {
      return `https:${url}`
    }
    return url
  }

  private normalizeImages(images: any): string[] {
    if (!images) return []
    
    if (typeof images === 'string') {
      return [this.normalizeImageUrl(images)]
    }
    
    if (Array.isArray(images)) {
      return images.map(img => {
        if (typeof img === 'string') {
          return this.normalizeImageUrl(img)
        }
        return this.normalizeImageUrl(img.url || img.pic_url || '')
      }).filter(url => url)
    }
    
    return []
  }

  private normalizeSpecifications(specs: any[]): Array<{ name: string; value: string }> {
    if (!Array.isArray(specs)) return []
    
    return specs.map(spec => ({
      name: spec.name || spec.prop_name || '',
      value: spec.value || spec.prop_value || '',
    })).filter(spec => spec.name && spec.value)
  }
}

