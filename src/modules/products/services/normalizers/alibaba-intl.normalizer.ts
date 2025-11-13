import { Injectable } from '@nestjs/common'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class AlibabaIntlNormalizer {
  normalizeSearchItem(item: any): NormalizedProduct {
    return {
      id: item.Id?.toString() || item.ProductId?.toString() || '',
      title: item.Subject || item.ProductTitle || '',
      price: this.extractPrice(item),
      originalPrice: undefined,
      currency: 'USD',
      imageUrl: this.normalizeImageUrl(item.ImageUrl || item.Image),
      images: this.normalizeImages(item.ImageUrls || item.Images || [item.ImageUrl]),
      supplier: {
        id: item.VendorId?.toString() || '',
        name: item.VendorName || item.CompanyName || '',
        location: item.VendorCountry || '',
      },
      specifications: [],
      minimumOrder: parseInt(item.MinimumOrder || item.MOQ || '1', 10),
      salesQuantity: 0,
      rating: 0,
      url: item.ProductUrl || item.Url || '',
      provider: 'alibaba_intl',
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


