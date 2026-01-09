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
      const vendorLocation = vendorData.Location
      const locationParts = []
      if (vendorLocation?.State) locationParts.push(vendorLocation.State)
      if (vendorLocation?.Country) locationParts.push(vendorLocation.Country)
      const locationString = locationParts.length > 0 ? locationParts.join(', ') : (vendorData.Country || basicProduct.supplier.location || '')

      basicProduct.supplier = {
        ...basicProduct.supplier,
        id: vendorData.Id?.toString() || basicProduct.supplier.id,
        name: vendorData.Name || vendorData.DisplayName || vendorData.ShopName || vendorData.CompanyName || basicProduct.supplier.name,
        location: locationString,
      }
    }

    const minimumOrder = item.FirstLotQuantity || this.extractMinimumOrder(item)
    const salesQuantity = this.extractSalesQuantityFromDetailed(item)
    const rating = this.extractRatingFromDetailed(item)
    const variations = this.normalizeVariations(item.Attributes || [])
    const quantityPrices = this.normalizeQuantityPrices(item.QuantityRanges || [])
    const descriptionHtml = item.Description || ''
    const specifications = this.normalizeSpecifications(item.Attributes || item.ProductAttributes || [])
    const productProps = this.normalizeProductProps(specifications)
    const detailImgs = this.extractImagesFromDescription(descriptionHtml)

    return {
      ...basicProduct,
      provider: 'alibaba',
      item_id: basicProduct.id,
      descriptionHtml,
      description_html: descriptionHtml,
      detail_html: descriptionHtml,
      descriptionImages: detailImgs,
      detail_imgs: detailImgs,
      specifications,
      product_props: productProps,
      minimumOrder,
      salesQuantity,
      rating,
      variations,
      quantity_prices: quantityPrices,
      quantityPrices,
      vendor_id: basicProduct.supplier.id,
      vendor_name: basicProduct.supplier.name,
      vendorId: basicProduct.supplier.id,
      vendorName: basicProduct.supplier.name,
      quantity_begin: minimumOrder,
      minimumOrderQuantity: minimumOrder,
      minimum_order_quantity: minimumOrder,
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
    if (item.FirstLotQuantity) {
      return parseInt(item.FirstLotQuantity.toString(), 10) || 1
    }
    
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

  private extractRatingFromDetailed(item: any): number {
    if (item.FeaturedValues && Array.isArray(item.FeaturedValues)) {
      const ratingObj = item.FeaturedValues.find((fv: any) => fv.Name === 'Rating')
      if (ratingObj && ratingObj.Value) {
        const ratingValue = parseFloat(ratingObj.Value.toString())
        if (!isNaN(ratingValue) && ratingValue > 0) {
          return ratingValue
        }
      }
      
      const normalizedRating = item.FeaturedValues.find((fv: any) => fv.Name === 'normalizedRating')
      if (normalizedRating && normalizedRating.Value) {
        const ratingValue = parseFloat(normalizedRating.Value.toString())
        if (!isNaN(ratingValue) && ratingValue > 0) {
          return ratingValue
        }
      }
    }
    
    if (item.VendorScore) {
      return parseFloat(item.VendorScore.toString()) || 0
    }
    
    return 0
  }

  private extractSalesQuantityFromDetailed(item: any): number {
    if (item.ConfiguredItems && Array.isArray(item.ConfiguredItems) && item.ConfiguredItems.length > 0) {
      const totalSales = item.ConfiguredItems.reduce((sum: number, configuredItem: any) => {
        return sum + (parseInt(configuredItem.SalesCount?.toString() || '0', 10) || 0)
      }, 0)
      if (totalSales > 0) {
        return totalSales
      }
    }
    
    if (item.Volume) {
      return parseInt(item.Volume.toString(), 10) || 0
    }
    
    if (item.FeaturedValues && Array.isArray(item.FeaturedValues)) {
      const totalSales = item.FeaturedValues.find((fv: any) => fv.Name === 'TotalSales' || fv.Name === 'totalSales')
      if (totalSales && totalSales.Value) {
        return parseInt(totalSales.Value.toString(), 10) || 0
      }
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
    
    return attributes
      .filter(attr => {
        const isConfigurator = attr.IsConfigurator === false || attr.IsConfigurator === undefined
        return isConfigurator
      })
      .map(attr => ({
        name: attr.PropertyName || attr.OriginalPropertyName || attr.Name || attr.name || '',
        value: attr.Value || attr.OriginalValue || attr.value || '',
      }))
      .filter(spec => spec.name && spec.value)
  }

  private normalizeVariations(attributes: any[]): Array<{ name: string; values: Array<{ id: string; name: string; image_url?: string }> }> {
    if (!Array.isArray(attributes)) return []
    
    const configuratorAttributes = attributes.filter(attr => attr.IsConfigurator === true)
    
    if (configuratorAttributes.length === 0) return []
    
    const variationsMap = new Map<string, Array<{ id: string; name: string; image_url?: string }>>()
    
    configuratorAttributes.forEach(attr => {
      const propertyName = attr.PropertyName || attr.OriginalPropertyName || ''
      const vid = attr.Vid?.toString() || ''
      const value = attr.Value || attr.OriginalValue || ''
      const imageUrl = attr.ImageUrl || attr.MiniImageUrl || ''
      
      if (!propertyName || !vid || !value) return
      
      if (!variationsMap.has(propertyName)) {
        variationsMap.set(propertyName, [])
      }
      
      const existingValues = variationsMap.get(propertyName) || []
      const valueExists = existingValues.some(v => v.id === vid)
      
      if (!valueExists) {
        existingValues.push({
          id: vid,
          name: value,
          ...(imageUrl ? { image_url: this.normalizeImageUrl(imageUrl) } : {}),
        })
        variationsMap.set(propertyName, existingValues)
      }
    })
    
    return Array.from(variationsMap.entries()).map(([name, values]) => ({
      name,
      values,
    }))
  }

  private normalizeQuantityPrices(quantityRanges: any[]): Array<{ beginAmount: number; quantity: number; price: number }> {
    if (!Array.isArray(quantityRanges) || quantityRanges.length === 0) return []
    
    return quantityRanges.map(range => {
      const minQuantity = parseInt(range.MinQuantity?.toString() || '1', 10) || 1
      const priceObj = range.Price
      
      let price = 0
      if (priceObj && typeof priceObj === 'object') {
        price = this.parsePrice(
          priceObj.OriginalPrice || 
          priceObj.PriceWithoutDelivery?.OriginalPrice || 
          priceObj.OneItemPriceWithoutDelivery?.OriginalPrice ||
          priceObj.ConvertedPriceList?.Internal?.Price ||
          priceObj.ConvertedPriceList?.DisplayedMoneys?.[0]?.Price ||
          priceObj.MarginPrice ||
          0
        )
      }
      
      return {
        beginAmount: minQuantity,
        quantity: minQuantity,
        price,
      }
    }).sort((a, b) => a.beginAmount - b.beginAmount)
  }

  private normalizeProductProps(specifications: Array<{ name: string; value: string }>): Array<{ [key: string]: string }> {
    if (!Array.isArray(specifications) || specifications.length === 0) return []
    
    return specifications.map(spec => {
      const key = spec.name || 'Propriedade'
      const value = spec.value || ''
      return { [key]: value }
    })
  }

  private extractImagesFromDescription(descriptionHtml: string): string[] {
    if (!descriptionHtml || typeof descriptionHtml !== 'string') return []
    
    const imageUrls: string[] = []
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match
    
    while ((match = imgRegex.exec(descriptionHtml)) !== null) {
      const imageUrl = match[1]
      if (imageUrl) {
        const normalizedUrl = this.normalizeImageUrl(imageUrl)
        if (normalizedUrl && !imageUrls.includes(normalizedUrl)) {
          imageUrls.push(normalizedUrl)
        }
      }
    }
    
    return imageUrls
  }
}
