import { Injectable } from '@nestjs/common'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class Alibaba1688Normalizer {
  normalizeSearchItem(item: any): NormalizedProduct {
    return {
      id: item.item_id?.toString() || item.id?.toString() || '',
      title: item.title || '',
      price: this.parsePrice(item.price || item.price_info?.sale_price),
      originalPrice: this.parsePrice(item.price_info?.origin_price),
      currency: 'CNY',
      imageUrl: this.normalizeImageUrl(item.img),
      images: this.normalizeImages(item.img ? [item.img] : []),
      supplier: {
        id: item.shop_info?.member_id?.toString() || '',
        name: item.shop_info?.company_name || item.shop_info?.login_id || '',
        location: this.formatLocation(item.delivery_info?.area_from),
      },
      specifications: [],
      minimumOrder: 1,
      salesQuantity: item.sale_info?.sale_quantity_int || 0,
      rating: this.parseRating(item.goods_score),
      url: item.product_url || '',
      categoryPath: item.category_path || [],
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

  private formatLocation(areaFrom: any): string {
    if (!areaFrom) return ''
    if (typeof areaFrom === 'string') return areaFrom
    if (Array.isArray(areaFrom)) {
      return areaFrom.filter(Boolean).join(', ')
    }
    return ''
  }

  private parseRating(rating: any): number {
    if (!rating) return 0
    if (typeof rating === 'number') return rating
    if (typeof rating === 'string') {
      const parsed = parseFloat(rating)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }
}


