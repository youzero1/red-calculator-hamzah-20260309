'use client';

import { useState } from 'react';
import { calculatePricing, formatCurrency, formatPercent, type PricingResult } from '@/lib/calculations';

interface Props {
  onSave: () => void;
}

export default function PricingCalculator({ onSave }: Props) {
  const [costPrice, setCostPrice] = useState('');
  const [markupPercent, setMarkupPercent] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mode, setMode] = useState<'markup' | 'selling'>('markup');
  const [result, setResult] = useState<PricingResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    const cp = parseFloat(costPrice);
    if (isNaN(cp) || cp <= 0) {
      setError('Please enter a valid cost price.');
      return;
    }

    if (mode === 'markup') {
      const mp = parseFloat(markupPercent);
      if (isNaN(mp) || mp < 0) {
        setError('Please enter a valid markup percentage.');
        return;
      }
      setResult(calculatePricing({ costPrice: cp, markupPercent: mp }));
    } else {
      const sp = parseFloat(sellingPrice);
      if (isNaN(sp) || sp <= 0) {
        setError('Please enter a valid selling price.');
        return;
      }
      if (sp < cp) {
        setError('Selling price cannot be less than cost price.');
        return;
      }
      setResult(calculatePricing({ costPrice: cp, sellingPrice: sp }));
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const input = mode === 'markup'
        ? { costPrice: parseFloat(costPrice), markupPercent: parseFloat(markupPercent) }
        : { costPrice: parseFloat(costPrice), sellingPrice: parseFloat(sellingPrice) };

      await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pricing', input, result }),
      });
      onSave();
    } catch {
      setError('Failed to save calculation.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCostPrice('');
    setMarkupPercent('');
    setSellingPrice('');
    setResult(null);
    setError('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">💰 Pricing Calculator</h2>
      <p className="text-red-300 text-sm mb-6">Calculate selling price, profit margin, and markup</p>

      {/* Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === 'markup'}
            onChange={() => setMode('markup')}
            className="accent-red-600"
          />
          <span className="text-red-200">Calculate from Markup %</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === 'selling'}
            onChange={() => setMode('selling')}
            className="accent-red-600"
          />
          <span className="text-red-200">Calculate from Selling Price</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">Cost Price ($)</label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="e.g. 25.00"
            min="0"
            step="0.01"
            className="input-field"
          />
        </div>

        {mode === 'markup' ? (
          <div>
            <label className="block text-red-300 text-sm font-medium mb-2">Markup Percentage (%)</label>
            <input
              type="number"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(e.target.value)}
              placeholder="e.g. 40"
              min="0"
              step="0.1"
              className="input-field"
            />
          </div>
        ) : (
          <div>
            <label className="block text-red-300 text-sm font-medium mb-2">Selling Price ($)</label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="e.g. 45.00"
              min="0"
              step="0.01"
              className="input-field"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg p-3 mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleCalculate} className="btn-primary flex-1">
          Calculate
        </button>
        <button onClick={handleReset} className="btn-danger">
          Reset
        </button>
      </div>

      {result && (
        <div className="result-box">
          <h3 className="text-red-400 font-semibold mb-3 text-sm uppercase tracking-wider">Results</h3>
          <div className="result-item">
            <span className="result-label">Cost Price</span>
            <span className="result-value">{formatCurrency(result.costPrice)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Selling Price</span>
            <span className="result-value text-green-400">{formatCurrency(result.sellingPrice)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Profit</span>
            <span className="result-value text-green-400">{formatCurrency(result.profit)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Profit Margin</span>
            <span className="result-value">{formatPercent(result.profitMargin)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Markup %</span>
            <span className="result-value">{formatPercent(result.markupPercent)}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full mt-4 text-sm"
          >
            {saving ? 'Saving...' : '💾 Save to History'}
          </button>
        </div>
      )}
    </div>
  );
}
