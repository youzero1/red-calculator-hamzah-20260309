'use client';

import { useState } from 'react';
import { calculateShipping, formatCurrency, type ShippingResult } from '@/lib/calculations';

interface Props {
  onSave: () => void;
}

const destinations = [
  { value: 'domestic', label: 'Domestic (Same Country)', baseRate: 5, ratePerKg: 1.5 },
  { value: 'regional', label: 'Regional (Nearby Countries)', baseRate: 12, ratePerKg: 3.0 },
  { value: 'international', label: 'International', baseRate: 25, ratePerKg: 6.5 },
  { value: 'custom', label: 'Custom Rates', baseRate: 0, ratePerKg: 0 },
];

export default function ShippingCalculator({ onSave }: Props) {
  const [weight, setWeight] = useState('');
  const [destination, setDestination] = useState('domestic');
  const [baseRate, setBaseRate] = useState('5');
  const [ratePerKg, setRatePerKg] = useState('1.5');
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    const dest = destinations.find((d) => d.value === val);
    if (dest && dest.value !== 'custom') {
      setBaseRate(dest.baseRate.toString());
      setRatePerKg(dest.ratePerKg.toString());
    }
  };

  const handleCalculate = () => {
    setError('');
    const w = parseFloat(weight);
    const br = parseFloat(baseRate);
    const rk = parseFloat(ratePerKg);

    if (isNaN(w) || w <= 0) { setError('Please enter a valid weight.'); return; }
    if (isNaN(br) || br < 0) { setError('Please enter a valid base rate.'); return; }
    if (isNaN(rk) || rk < 0) { setError('Please enter a valid rate per kg.'); return; }

    const destLabel = destinations.find((d) => d.value === destination)?.label || destination;
    setResult(calculateShipping({ weightKg: w, destination: destLabel, baseRate: br, ratePerKg: rk }));
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const input = { weight: parseFloat(weight), destination, baseRate: parseFloat(baseRate), ratePerKg: parseFloat(ratePerKg) };
      await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'shipping', input, result }),
      });
      onSave();
    } catch {
      setError('Failed to save calculation.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWeight('');
    setDestination('domestic');
    setBaseRate('5');
    setRatePerKg('1.5');
    setResult(null);
    setError('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">📦 Shipping Calculator</h2>
      <p className="text-red-300 text-sm mb-6">Calculate shipping costs based on weight and destination</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">Package Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 2.5"
            min="0"
            step="0.1"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">Destination</label>
          <select
            value={destination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            className="input-field"
          >
            {destinations.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">Base Rate ($)</label>
          <input
            type="number"
            value={baseRate}
            onChange={(e) => setBaseRate(e.target.value)}
            placeholder="e.g. 5.00"
            min="0"
            step="0.01"
            className="input-field"
            disabled={destination !== 'custom'}
          />
        </div>

        <div>
          <label className="block text-red-300 text-sm font-medium mb-2">Rate per kg ($)</label>
          <input
            type="number"
            value={ratePerKg}
            onChange={(e) => setRatePerKg(e.target.value)}
            placeholder="e.g. 1.50"
            min="0"
            step="0.01"
            className="input-field"
            disabled={destination !== 'custom'}
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
            <span className="result-label">Destination</span>
            <span className="result-value text-sm">{result.destination}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Weight</span>
            <span className="result-value">{result.weightKg} kg</span>
          </div>
          <div className="result-item">
            <span className="result-label">Base Rate</span>
            <span className="result-value">{formatCurrency(result.baseRate)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Weight Charge</span>
            <span className="result-value">{formatCurrency(result.weightCharge)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Total Shipping Cost</span>
            <span className="result-value text-yellow-400 text-xl">{formatCurrency(result.totalShipping)}</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-4 text-sm">
            {saving ? 'Saving...' : '💾 Save to History'}
          </button>
        </div>
      )}
    </div>
  );
}
