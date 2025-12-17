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

    const salesQty = parseInt(item.sales_quantity || item.sales || item.sale_info?.sale_quantity_int || '0', 10)

    return {
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
      minimumOrderQuantity: item.moq || item.minimum_order || item.tiered_price_info?.begin_num || 1,
      salesQuantity: salesQty,
      sold_quantity: salesQty,
      salesVolume: salesQty,
      sold_quantity_90days: item.sale_info?.sale_quantity_90days || null,
      item_repurchase_rate: item.item_repurchase_rate || null,
      repurchaseRate: item.item_repurchase_rate || null,
      rating: item.rate_percentage || item.goods_score || 0,
      goods_score: item.rate_percentage || item.goods_score || 0,
      url: item.detail_url || item.url || item.product_url || '',
      detail_url: item.detail_url || item.url || item.product_url || '',
      product_url: item.detail_url || item.url || item.product_url || '',
      provider: 'alibaba_1688',
      skus: item.skus || [],
      sku_props: item.sku_props || [],
      shop_info: item.shop_info || null,
      sale_info: item.sale_info || null,
      quantity_prices: this.normalizeQuantityPricesFromSearch(item),
      delivery_info: item.delivery_info || null,
      location: this.extractLocation(item),
    }
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

  private normalizeQuantityPricesFromSearch(item: any): any[] {
    if (item.quantity_prices && Array.isArray(item.quantity_prices)) {
      return item.quantity_prices.map((tier: any) => {
        const quantity = parseInt(
          String(tier.begin_num || tier.quantity || '1').replace(/[^0-9]/g, ''),
          10,
        )

        return {
          begin_num: String(quantity),
          quantity: quantity,
          price: String(tier.price || 0),
          currency: 'CNY',
          beginAmount: quantity,
        }
      })
    }
    return this.normalizeQuantityPrices(item)
  }

  private extractLocation(item: any): any {
    if (item.delivery_info?.area_from && Array.isArray(item.delivery_info.area_from)) {
      return {
        province: item.delivery_info.area_from[0] || '',
        city: item.delivery_info.area_from[1] || '',
      }
    }
    if (item.delivery_info?.location) {
      const locationParts = item.delivery_info.location.split('省')

      return {
        province: locationParts[0] ? locationParts[0] + '省' : '',
        city: locationParts[1] || '',
      }
    }
    return null
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


