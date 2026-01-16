import { Injectable } from '@nestjs/common'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class Alibaba1688Normalizer {

  normalizeSearchItem(item: any): NormalizedProduct {
    const mainImgs = item.main_imgs || []
    const imageUrl = this.normalizeImageUrl(
      mainImgs[0] || item.img || item.pic_url || item.image_url || item.pic,
    )
    const images = this.normalizeImages(mainImgs.length > 0 ? mainImgs : (item.item_imgs || item.images || item.pic_url || []))
    
    const saleInfo = item.sale_info || {}
    const saleQuantityInt = saleInfo.sale_quantity_int ?? item.sale_quantity_int ?? null
    const ordersCount = saleInfo.orders_count ?? item.orders_count ?? null
    const saleQuantity90Days = saleInfo.sale_quantity_90days ?? null
    const itemRepurchaseRate = item.item_repurchase_rate ?? null
    
    const preservedSaleInfo = item.sale_info 
      ? {
          ...item.sale_info,
          sale_quantity_int: saleInfo.sale_quantity_int ?? item.sale_info.sale_quantity_int,
          orders_count: saleInfo.orders_count ?? item.sale_info.orders_count,
          sale_quantity_90days: saleInfo.sale_quantity_90days ?? item.sale_info.sale_quantity_90days,
        }
      : null

    const normalizedProduct = {
      id: item.item_id?.toString() || item.id?.toString() || '',
      item_id: item.item_id?.toString() || item.id?.toString() || '',
      title: item.title || item.item_title || '',
      price: this.parsePrice(item.price || item.sale_price || this.extractPriceFromTiered(item)),
      float_price: this.parsePrice(item.price || item.sale_price || this.extractPriceFromTiered(item)),
      originalPrice: this.parsePrice(item.original_price),
      currency: 'CNY',
      imageUrl,
      img: imageUrl,
      pic_url: imageUrl,
      main_img: imageUrl,
      images,
      main_imgs: images,
      item_imgs: images,
      pictures: images,
      supplier: {
        id: item.seller_id?.toString() || item.shop_info?.seller_member_id?.toString() || '',
        name: item.shop_name || item.seller_name || item.shop_info?.shop_name || item.shop_info?.company_name || '',
        location: item.location || '',
      },
      specifications: [],
      minimumOrder: item.moq || item.minimum_order || item.tiered_price_info?.begin_num || 1,
      quantity_begin: item.moq || item.minimum_order || item.tiered_price_info?.begin_num || 1,
      salesQuantity: parseInt(item.sales_quantity || item.sales || saleQuantityInt?.toString() || '0', 10),
      sold_quantity: parseInt(item.sales_quantity || item.sales || saleQuantityInt?.toString() || '0', 10),
      rating: item.rate_percentage || item.goods_score || 0,
      goods_score: item.rate_percentage || item.goods_score || 0,
      url: item.detail_url || item.url || item.product_url || '',
      provider: 'alibaba_1688' as const,
      skus: item.skus || [],
      sku_props: item.sku_props || [],
      shop_info: item.shop_info || null,
      sale_info: preservedSaleInfo,
      sale_quantity_int: saleQuantityInt,
      orders_count: ordersCount,
      sale_quantity_90days: saleQuantity90Days,
      item_repurchase_rate: itemRepurchaseRate,
    }

    return normalizedProduct
  }

  private extractPriceFromTiered(item: any): number {
    if (item.tiered_price_info?.prices && Array.isArray(item.tiered_price_info.prices)) {
      const prices = item.tiered_price_info.prices.map((p: any) => parseFloat(p.price) || 0)
      if (prices.length > 0) {
        return Math.min(...prices)
      }
    }
    if (item.price_info?.price_min) {
      return parseFloat(item.price_info.price_min)
    }
    if (item.price_info?.price) {
      return parseFloat(item.price_info.price)
    }
    return 0
  }

  normalizeDetailedItem(item: any): NormalizedProduct {
    const basicProduct = this.normalizeSearchItem(item)

    return {
      ...basicProduct,
      descriptionHtml: item.detail_html || item.description || '',
      description_html: item.detail_html || item.description || '',
      detail_html: item.detail_html || item.description || '',
      descriptionImages: item.detail_imgs || [],
      detail_imgs: item.detail_imgs || [],
      specifications: this.normalizeSpecifications(item.product_props || item.specifications || []),
      product_props: item.product_props || [],
      categoryPath: item.category_path || [],
      category_path: item.category_path || [],
      category_id: item.category_id || '',
      video_url: item.video_url || null,
      delivery_info: item.delivery_info || null,
      promotions: item.promotions || null,
      stock: item.stock || null,
      is_sold_out: item.is_sold_out || false,
      tiered_price_info: item.tiered_price_info || null,
      quantity_prices: this.normalizeQuantityPrices(item),
    }
  }

  private normalizeQuantityPrices(item: any): any[] {
    if (item.tiered_price_info?.prices && Array.isArray(item.tiered_price_info.prices)) {
      return item.tiered_price_info.prices.map((tier: any) => ({
        begin_num: String(tier.beginAmount || 1),
        quantity: tier.beginAmount || 1,
        price: String(tier.price || 0),
        currency: 'CNY',
        beginAmount: tier.beginAmount || 1,
      }))
    }
    return []
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


