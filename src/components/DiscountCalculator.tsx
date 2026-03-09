'use client';

import { useState } from 'react';
import { calculateDiscount, formatCurrency, formatPercent, type DiscountResult } from '@/lib/calculations';

interface Props {
  onSave: () => void;
}

export default function DiscountCalculator({ onSave }: Props) {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    const op = parseFloat(originalPrice);
    const dv = parseFloat(discountValue);

    if (isNaN(op) || op <= 0) { setError('Please enter a valid original price.'); return; }
    if (isNaN(dv) || dv < 0) { setError('Please enter a valid discount value.'); return; }
    if (discountType === 'percentage' && dv > 100) { setError('Percentage discount cannot exceed 100%.'); return; }
    if (discountType === 'fixed' && dv > op) { setError('Fixed discount cannot exceed the original price.'); return; }

    setResult(calculateDiscount({ originalPrice: op, discountType, discountValue: dv }));
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const input = { originalPrice: parseFloat(originalPrice), discountType, discountValue: parseFloat(discountValue) };
      await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'discount', input, result }),
      });
      onSave();
    } catch {
      setError('Failed to save calculation.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setOriginalPrice('');
    setDiscountValue('');
    setResult(null);
    setError('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">🏷️ Discount Calculator</h2>
      <p className="text-red-300 text-sm mb-6">Calculate percentage and fixed amount discounts</p>

      {/* Discount Type Toggle */}
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={discountType === 'percentage'}
            onChange={() => setDiscountType('percentage')}
            className="accent-red-600"
          />
          <span className="text-red-200">Percentage (%)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={discountType === 'fixed'}
            onChange={() => setDiscountType('fixed')}
            className="accent-red-600"
          />
          <span className="text-red-200">Fixed Amount ($)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">Original Price ($)</label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="e.g. 99.99"
            min="0"
            step="0.01"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">
            {discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount ($)'}
          </label>
          <input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 15.00'}
            min="0"
            step={discountType === 'percentage' ? '0.1' : '0.01'}
            className="input-field"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg p-3 mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleCalculate} className="btn-primary flex-1">Calculate</button>
        <button onClick={handleReset} className="btn-danger">Reset</button>
      </div>

      {result && (
        <div className="result-box">
          <h3 className="text-red-400 font-semibold mb-3 text-sm uppercase tracking-wider">Results</h3>
          <div className="result-item">
            <span className="result-label">Original Price</span>
            <span className="result-value">{formatCurrency(result.originalPrice)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Discount Amount</span>
            <span className="result-value text-red-400">- {formatCurrency(result.discountAmount)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Final Price</span>
            <span className="result-value text-green-400 text-xl">{formatCurrency(result.finalPrice)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">You Save</span>
            <span className="result-value text-yellow-400">{formatPercent(result.savingsPercent)}</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-4 text-sm">
            {saving ? 'Saving...' : '💾 Save to History'}
          </button>
        </div>
      )}
    </div>
  );
}
