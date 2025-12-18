export class CurrencyHelper {
  static formatBR(value: number): string {
    return value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  static formatBRWithSymbol(value: number): string {
    return `R$ ${this.formatBR(value)}`;
  }
}
