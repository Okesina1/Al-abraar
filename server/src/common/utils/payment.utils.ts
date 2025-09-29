export class PaymentUtils {
  static calculatePlatformFee(amount: number, feePercentage: number = 30): number {
    return Math.round(amount * (feePercentage / 100) * 100) / 100;
  }

  static calculateUstaadhEarning(amount: number, feePercentage: number = 30): number {
    return amount - this.calculatePlatformFee(amount, feePercentage);
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  static validateAmount(amount: number, minAmount: number = 0.5): boolean {
    return amount >= minAmount && amount <= 10000; // Max $10,000 per transaction
  }

  static convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    // In a real implementation, you would use a currency conversion API
    // For now, return the same amount
    return amount;
  }

  static generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static validatePaymentMethod(method: string): boolean {
    const supportedMethods = ['stripe', 'paypal', 'paystack', 'flutterwave'];
    return supportedMethods.includes(method.toLowerCase());
  }

  static getPaymentMethodDisplayName(method: string): string {
    const displayNames = {
      stripe: 'Credit/Debit Card',
      paypal: 'PayPal',
      paystack: 'Paystack',
      flutterwave: 'Flutterwave',
    };
    return displayNames[method.toLowerCase()] || method;
  }
}