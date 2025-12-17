import { Injectable } from '@nestjs/common'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class AlibabaIntlNormalizer {
  normalizeSearchItem(item: any): NormalizedProduct {
    const imageUrl = this.normalizeImageUrl(item.ImageUrl || item.Image)
    const price = this.extractPrice(item)

    const minOrder = parseInt(item.MinimumOrder || item.MOQ || '1', 10)

    return {
      id: item.Id?.toString() || item.ProductId?.toString() || '',
      item_id: item.Id?.toString() || item.ProductId?.toString() || '',
      title: item.Subject || item.ProductTitle || '',
      price,
      float_price: price,
      originalPrice: undefined,
      currency: 'USD',
      imageUrl,
      img: imageUrl,
      pic_url: imageUrl,
      main_img: imageUrl,
      images: this.normalizeImages(item.ImageUrls || item.Images || [item.ImageUrl]),
      main_imgs: this.normalizeImages(item.ImageUrls || item.Images || [item.ImageUrl]),
      item_imgs: this.normalizeImages(item.ImageUrls || item.Images || [item.ImageUrl]),
      pictures: this.normalizeImages(item.ImageUrls || item.Images || [item.ImageUrl]),
      supplier: {
        id: item.VendorId?.toString() || '',
        name: item.VendorName || item.CompanyName || '',
        location: item.VendorCountry || '',
      },
      specifications: [],
      minimumOrder: minOrder,
      quantity_begin: minOrder,
      minimumOrderQuantity: minOrder,
      salesQuantity: 0,
      sold_quantity: 0,
      salesVolume: 0,
      sold_quantity_90days: null,
      item_repurchase_rate: null,
      repurchaseRate: null,
      rating: 0,
      goods_score: 0,
      url: item.ProductUrl || item.Url || '',
      detail_url: item.ProductUrl || item.Url || '',
      product_url: item.ProductUrl || item.Url || '',
      provider: 'alibaba_intl',
      shop_info: null,
      sale_info: null,
      quantity_prices: this.normalizeQuantityPrices(item),
      delivery_info: null,
      location: null,
    }
  }

  normalizeDetailedItem(item: any, vendorData?: any): NormalizedProduct {
    const basicProduct = this.normalizeSearchItem(item)

    if (vendorData) {
      basicProduct.supplier = {
        ...basicProduct.supplier,
        name: vendorData.CompanyName || basicProduct.supplier.name,
        location: vendorData.Country || basicProduct.supplier.location,
      }
    }

    return {
      ...basicProduct,
      descriptionHtml: item.Description || '',
      specifications: this.normalizeSpecifications(item.ProductAttributes || []),
    }
  }

  private normalizeQuantityPrices(item: any): any[] {
    if (item.QuantityRanges && Array.isArray(item.QuantityRanges)) {
      return item.QuantityRanges.map((range: any) => ({
        begin_num: String(range.MinQuantity || 1),
        quantity: range.MinQuantity || 1,
        price: String(this.parsePrice(range.Price) || 0),
        currency: 'USD',
        beginAmount: range.MinQuantity || 1,
      }))
    }
    return []
  }

  private extractPrice(item: any): number {
    if (item.MinPrice) {
      return this.parsePrice(item.MinPrice)
    }
    
    if (item.Price) {
      return this.parsePrice(item.Price)
    }
    
    if (item.QuantityRanges && Array.isArray(item.QuantityRanges)) {
      const firstRange = item.QuantityRanges[0]
      if (firstRange && firstRange.Price) {
        return this.parsePrice(firstRange.Price)
      }
    }
    
    return 0
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
        return this.normalizeImageUrl(img.Url || img.url || '')
      }).filter(url => url)
    }
    
    return []
  }

  private normalizeSpecifications(attributes: any[]): Array<{ name: string; value: string }> {
    if (!Array.isArray(attributes)) return []
    
    return attributes.map(attr => ({
      name: attr.Name || attr.name || '',
      value: attr.Value || attr.value || '',
    })).filter(spec => spec.name && spec.value)
  }
}


