export interface PricingInput {
  costPrice: number;
  markupPercent?: number;
  sellingPrice?: number;
}

export interface PricingResult {
  costPrice: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
  markupPercent: number;
}

export interface ShippingInput {
  weightKg: number;
  destination: string;
  baseRate: number;
  ratePerKg: number;
}

export interface ShippingResult {
  weightKg: number;
  destination: string;
  baseRate: number;
  weightCharge: number;
  totalShipping: number;
}

export interface DiscountInput {
  originalPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface DiscountResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  savingsPercent: number;
}

export interface TaxInput {
  priceBeforeTax: number;
  taxRate: number;
  includeTax: boolean;
}

export interface TaxResult {
  priceBeforeTax: number;
  taxAmount: number;
  priceAfterTax: number;
  taxRate: number;
}

export function calculatePricing(input: PricingInput): PricingResult {
  const { costPrice, markupPercent, sellingPrice } = input;

  if (sellingPrice !== undefined && sellingPrice > 0) {
    const profit = sellingPrice - costPrice;
    const profitMargin = (profit / sellingPrice) * 100;
    const markup = (profit / costPrice) * 100;
    return {
      costPrice,
      sellingPrice,
      profit,
      profitMargin,
      markupPercent: markup,
    };
  } else {
    const markup = markupPercent || 0;
    const sp = costPrice * (1 + markup / 100);
    const profit = sp - costPrice;
    const profitMargin = (profit / sp) * 100;
    return {
      costPrice,
      sellingPrice: sp,
      profit,
      profitMargin,
      markupPercent: markup,
    };
  }
}

export function calculateShipping(input: ShippingInput): ShippingResult {
  const { weightKg, destination, baseRate, ratePerKg } = input;
  const weightCharge = weightKg * ratePerKg;
  const totalShipping = baseRate + weightCharge;
  return {
    weightKg,
    destination,
    baseRate,
    weightCharge,
    totalShipping,
  };
}

export function calculateDiscount(input: DiscountInput): DiscountResult {
  const { originalPrice, discountType, discountValue } = input;
  let discountAmount: number;

  if (discountType === 'percentage') {
    discountAmount = (originalPrice * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const savingsPercent = (discountAmount / originalPrice) * 100;

  return {
    originalPrice,
    discountAmount,
    finalPrice,
    savingsPercent,
  };
}

export function calculateTax(input: TaxInput): TaxResult {
  const { priceBeforeTax, taxRate, includeTax } = input;

  if (includeTax) {
    // Price already includes tax, extract it
    const priceWithout = priceBeforeTax / (1 + taxRate / 100);
    const taxAmount = priceBeforeTax - priceWithout;
    return {
      priceBeforeTax: priceWithout,
      taxAmount,
      priceAfterTax: priceBeforeTax,
      taxRate,
    };
  } else {
    const taxAmount = (priceBeforeTax * taxRate) / 100;
    const priceAfterTax = priceBeforeTax + taxAmount;
    return {
      priceBeforeTax,
      taxAmount,
      priceAfterTax,
      taxRate,
    };
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
