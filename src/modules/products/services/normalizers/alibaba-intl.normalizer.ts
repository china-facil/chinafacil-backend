import { Injectable } from '@nestjs/common'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class AlibabaIntlNormalizer {
  normalizeSearchItem(item: any): NormalizedProduct {
    const imageUrl = this.normalizeImageUrl(
      item.MainPictureUrl || item.ImageUrl || item.Image,
    )
    const price = this.extractPrice(item)
    const minOrder = this.extractMinOrder(item)
    const images = this.normalizeImages(
      item.Pictures || item.ImageUrls || item.Images || [imageUrl],
    )

    return {
      id: item.Id?.toString() || item.ProductId?.toString() || '',
      item_id: item.Id?.toString() || item.ProductId?.toString() || '',
      title: item.Title || item.Subject || item.ProductTitle || item.OriginalTitle || '',
      price,
      float_price: price,
      originalPrice: undefined,
      currency: 'USD',
      imageUrl,
      img: imageUrl,
      pic_url: imageUrl,
      main_img: imageUrl,
      images,
      main_imgs: images,
      item_imgs: images,
      pictures: images,
      supplier: {
        id: item.VendorId?.toString() || '',
        name: item.VendorName || item.VendorDisplayName || item.CompanyName || '',
        location: item.Location || item.VendorCountry || '',
      },
      specifications: [],
      minimumOrder: minOrder,
      quantity_begin: minOrder,
      minimumOrderQuantity: minOrder,
      salesQuantity: item.Volume || 0,
      sold_quantity: item.Volume || 0,
      salesVolume: item.Volume || 0,
      sold_quantity_90days: null,
      item_repurchase_rate: null,
      repurchaseRate: null,
      rating: item.VendorScore || 0,
      goods_score: item.VendorScore || 0,
      url: item.ExternalItemUrl || item.TaobaoItemUrl || item.ProductUrl || item.Url || '',
      detail_url: item.ExternalItemUrl || item.TaobaoItemUrl || item.ProductUrl || '',
      product_url: item.ExternalItemUrl || item.TaobaoItemUrl || item.ProductUrl || '',
      provider: 'alibaba_intl',
      shop_info: {
        vendor_id: item.VendorId,
        vendor_name: item.VendorName || item.VendorDisplayName,
        vendor_score: item.VendorScore,
      },
      sale_info: null,
      quantity_prices: this.normalizeQuantityPrices(item),
      delivery_info: null,
      location: item.Location || null,
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
        price: String(this.extractPriceValue(range.Price) || 0),
        currency: 'USD',
        beginAmount: range.MinQuantity || 1,
      }))
    }
    return []
  }

  private extractMinOrder(item: any): number {
    if (item.QuantityRanges && Array.isArray(item.QuantityRanges) && item.QuantityRanges[0]) {
      return item.QuantityRanges[0].MinQuantity || 1
    }
    if (item.MasterQuantity) {
      return parseInt(item.MasterQuantity, 10) || 1
    }
    if (item.MinimumOrder || item.MOQ) {
      return parseInt(item.MinimumOrder || item.MOQ, 10) || 1
    }
    return 1
  }

  private extractPrice(item: any): number {
    if (item.Price) {
      return this.extractPriceValue(item.Price)
    }
    
    if (item.QuantityRanges && Array.isArray(item.QuantityRanges) && item.QuantityRanges[0]) {
      return this.extractPriceValue(item.QuantityRanges[0].Price)
    }
    
    if (item.MinPrice) {
      return this.extractPriceValue(item.MinPrice)
    }
    
    return 0
  }

  private extractPriceValue(price: any): number {
    if (!price) return 0
    if (typeof price === 'number') return price
    if (typeof price === 'string') {
      const cleanPrice = price.replace(/[^0-9.]/g, '')
      return parseFloat(cleanPrice) || 0
    }
    if (typeof price === 'object') {
      return price.OriginalPrice || price.MarginPrice || 0
    }
    return 0
  }

  private parsePrice(price: any): number {
    return this.extractPriceValue(price)
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


