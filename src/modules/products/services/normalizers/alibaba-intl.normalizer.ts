import { Injectable } from '@nestjs/common'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class AlibabaIntlNormalizer {
  normalizeSearchItem(item: any): NormalizedProduct {
    const priceData = this.extractPrice(item)
    const minOrder = this.extractMinimumOrder(item)
    const salesQuantity = this.extractSalesQuantity(item)
    const rating = this.extractRating(item)
    
    return {
      id: item.Id?.toString() || item.ProductId?.toString() || '',
      title: item.Title || item.OriginalTitle || item.Subject || item.ProductTitle || '',
      price: priceData.price,
      originalPrice: priceData.originalPrice,
      currency: this.extractCurrency(item),
      imageUrl: this.normalizeImageUrl(item.MainPictureUrl || this.extractFirstImageUrl(item.Pictures) || ''),
      images: this.normalizeImages(item.Pictures || item.ImageUrls || item.Images || []),
      supplier: {
        id: item.VendorId?.toString() || item.Vendor?.Id?.toString() || '',
        name: item.VendorName || item.VendorDisplayName || item.CompanyName || item.Vendor?.CompanyName || '',
        location: item.Location?.Country || item.VendorCountry || item.Vendor?.Country || '',
      },
      specifications: [],
      minimumOrder: minOrder,
      salesQuantity: salesQuantity,
      rating: rating,
      url: item.TaobaoItemUrl || item.ExternalItemUrl || item.ProductUrl || item.Url || item.ItemUrl || '',
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

  private extractPrice(item: any): { price: number; originalPrice?: number } {
    if (item.Price && typeof item.Price === 'object') {
      const priceObj = item.Price
      const originalPrice = priceObj.OriginalPrice || priceObj.PriceWithoutDelivery?.OriginalPrice || priceObj.OneItemPriceWithoutDelivery?.OriginalPrice
      const displayPrice = priceObj.ConvertedPriceList?.Internal?.Price || priceObj.ConvertedPriceList?.DisplayedMoneys?.[0]?.Price || originalPrice
      
      return {
        price: this.parsePrice(displayPrice || originalPrice || priceObj.MarginPrice || 0),
        originalPrice: originalPrice ? this.parsePrice(originalPrice) : undefined,
      }
    }
    
    if (item.QuantityRanges && Array.isArray(item.QuantityRanges) && item.QuantityRanges.length > 0) {
      const firstRange = item.QuantityRanges[0]
      if (firstRange && firstRange.Price && typeof firstRange.Price === 'object') {
        const priceObj = firstRange.Price
        const originalPrice = priceObj.OriginalPrice || priceObj.PriceWithoutDelivery?.OriginalPrice || priceObj.OneItemPriceWithoutDelivery?.OriginalPrice
        const displayPrice = priceObj.ConvertedPriceList?.Internal?.Price || priceObj.ConvertedPriceList?.DisplayedMoneys?.[0]?.Price || originalPrice
        
        return {
          price: this.parsePrice(displayPrice || originalPrice || priceObj.MarginPrice || 0),
          originalPrice: originalPrice ? this.parsePrice(originalPrice) : undefined,
        }
      }
    }
    
    if (item.MinPrice) {
      return {
        price: this.parsePrice(item.MinPrice),
        originalPrice: item.OriginalPrice ? this.parsePrice(item.OriginalPrice) : undefined,
      }
    }
    
    return { price: 0 }
  }

  private extractMinimumOrder(item: any): number {
    if (item.QuantityRanges && Array.isArray(item.QuantityRanges) && item.QuantityRanges.length > 0) {
      const firstRange = item.QuantityRanges[0]
      if (firstRange && firstRange.MinQuantity) {
        return parseInt(firstRange.MinQuantity.toString(), 10) || 1
      }
    }
    
    if (item.MinimumOrder) {
      return parseInt(item.MinimumOrder.toString(), 10) || 1
    }
    
    if (item.MOQ) {
      return parseInt(item.MOQ.toString(), 10) || 1
    }
    
    return 1
  }

  private extractCurrency(item: any): string {
    if (item.Price && typeof item.Price === 'object') {
      return item.Price.OriginalCurrencyCode || item.Price.CurrencyCode || item.Price.CurrencyName || 'USD'
    }
    
    if (item.QuantityRanges && Array.isArray(item.QuantityRanges) && item.QuantityRanges.length > 0) {
      const firstRange = item.QuantityRanges[0]
      if (firstRange?.Price && typeof firstRange.Price === 'object') {
        return firstRange.Price.OriginalCurrencyCode || firstRange.Price.CurrencyCode || firstRange.Price.CurrencyName || 'USD'
      }
    }
    
    return 'USD'
  }

  private extractSalesQuantity(item: any): number {
    if (item.FeaturedValues && Array.isArray(item.FeaturedValues)) {
      const totalSales = item.FeaturedValues.find((fv: any) => fv.Name === 'TotalSales' || fv.Name === 'totalSales')
      if (totalSales && totalSales.Value) {
        return parseInt(totalSales.Value.toString(), 10) || 0
      }
    }
    
    if (item.Volume) {
      return parseInt(item.Volume.toString(), 10) || 0
    }
    
    return 0
  }

  private extractRating(item: any): number {
    if (item.FeaturedValues && Array.isArray(item.FeaturedValues)) {
      const rating = item.FeaturedValues.find((fv: any) => fv.Name === 'Rating' || fv.Name === 'rating' || fv.Name === 'normalizedRating')
      if (rating && rating.Value) {
        const ratingValue = parseFloat(rating.Value.toString())
        return isNaN(ratingValue) ? 0 : ratingValue
      }
    }
    
    if (item.VendorScore) {
      return parseFloat(item.VendorScore.toString()) || 0
    }
    
    return 0
  }

  private extractFirstImageUrl(pictures: any): string {
    if (!pictures) return ''
    
    if (Array.isArray(pictures) && pictures.length > 0) {
      const firstPicture = pictures[0]
      if (typeof firstPicture === 'string') {
        return firstPicture
      }
      if (typeof firstPicture === 'object') {
        return firstPicture.Url || firstPicture.url || ''
      }
    }
    
    return ''
  }

  private parsePrice(price: any): number {
    if (!price) return 0
    
    if (typeof price === 'number') return price
    
    if (typeof price === 'object') {
      if (price.OriginalPrice) return this.parsePrice(price.OriginalPrice)
      if (price.ConvertedPrice) return this.parsePrice(price.ConvertedPrice)
      if (price.Price) return this.parsePrice(price.Price)
      return 0
    }
    
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
      return images
        .filter(img => img !== null && img !== undefined)
        .map(img => {
          if (typeof img === 'string') {
            return this.normalizeImageUrl(img)
          }
          if (typeof img === 'object') {
            return this.normalizeImageUrl(img.Url || img.url || img.ImageUrl || img.imageUrl || img.Large?.Url || img.Medium?.Url || img.Small?.Url || '')
          }
          return ''
        })
        .filter(url => url)
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


