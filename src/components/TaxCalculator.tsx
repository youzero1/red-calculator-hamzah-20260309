'use client';

import { useState } from 'react';
import { calculateTax, formatCurrency, formatPercent, type TaxResult } from '@/lib/calculations';

interface Props {
  onSave: () => void;
}

const commonTaxRates = [5, 7.5, 10, 12.5, 15, 18, 20, 21, 25];

export default function TaxCalculator({ onSave }: Props) {
  const [price, setPrice] = useState('');
  const [taxRate, setTaxRate] = useState('20');
  const [includeTax, setIncludeTax] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    const p = parseFloat(price);
    const tr = parseFloat(taxRate);

    if (isNaN(p) || p <= 0) { setError('Please enter a valid price.'); return; }
    if (isNaN(tr) || tr < 0 || tr > 100) { setError('Please enter a valid tax rate (0-100).'); return; }

    setResult(calculateTax({ priceBeforeTax: p, taxRate: tr, includeTax }));
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const input = { price: parseFloat(price), taxRate: parseFloat(taxRate), includeTax };
      await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tax', input, result }),
      });
      onSave();
    } catch {
      setError('Failed to save calculation.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPrice('');
    setTaxRate('20');
    setIncludeTax(false);
    setResult(null);
    setError('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">🧾 Tax / VAT Calculator</h2>
      <p className="text-red-300 text-sm mb-6">Calculate tax amounts and VAT on products</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">
            {includeTax ? 'Price (Tax Inclusive) ($)' : 'Price (Before Tax) ($)'}
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 100.00"
            min="0"
            step="0.01"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">Tax Rate (%)</label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            placeholder="e.g. 20"
            min="0"
            max="100"
            step="0.1"
            className="input-field"
          />
        </div>
      </div>

      {/* Quick Tax Rate Buttons */}
      <div className="mb-4">
        <p className="text-red-400 text-xs font-medium mb-2 uppercase tracking-wider">Quick Select Tax Rate</p>
        <div className="flex flex-wrap gap-2">
          {commonTaxRates.map((rate) => (
            <button
              key={rate}
              onClick={() => setTaxRate(rate.toString())}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                taxRate === rate.toString()
                  ? 'bg-red-600 text-white'
                  : 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900'
              }`}
            >
              {rate}%
            </button>
          ))}
        </div>
      </div>

      {/* Include Tax Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIncludeTax(!includeTax)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              includeTax ? 'bg-red-600' : 'bg-red-950 border border-red-800'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                includeTax ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-red-200">
            {includeTax ? 'Price includes tax (extract tax from total)' : 'Price excludes tax (add tax to price)'}
          </span>
        </label>
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
            <span className="result-label">Price Before Tax</span>
            <span className="result-value">{formatCurrency(result.priceBeforeTax)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Tax Rate</span>
            <span className="result-value">{formatPercent(result.taxRate)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Tax Amount</span>
            <span className="result-value text-red-400">{formatCurrency(result.taxAmount)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Price After Tax</span>
            <span className="result-value text-green-400 text-xl">{formatCurrency(result.priceAfterTax)}</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-4 text-sm">
            {saving ? 'Saving...' : '💾 Save to History'}
          </button>
        </div>
      )}
    </div>
  );
}
