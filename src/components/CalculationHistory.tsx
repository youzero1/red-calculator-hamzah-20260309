'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/calculations';

interface CalculationEntry {
  id: number;
  type: string;
  input: string;
  result: string;
  createdAt: string;
}

interface Props {
  onClear: () => void;
}

function getBadgeClass(type: string): string {
  switch (type) {
    case 'pricing': return 'badge badge-pricing';
    case 'shipping': return 'badge badge-shipping';
    case 'discount': return 'badge badge-discount';
    case 'tax': return 'badge badge-tax';
    default: return 'badge badge-pricing';
  }
}

function getResultSummary(type: string, resultStr: string): string {
  try {
    const result = JSON.parse(resultStr);
    switch (type) {
      case 'pricing':
        return `Selling: ${formatCurrency(result.sellingPrice)} | Profit: ${formatCurrency(result.profit)} (${result.profitMargin.toFixed(1)}%)`;
      case 'shipping':
        return `Total Shipping: ${formatCurrency(result.totalShipping)} | Weight: ${result.weightKg}kg`;
      case 'discount':
        return `Final: ${formatCurrency(result.finalPrice)} | Saved: ${formatCurrency(result.discountAmount)} (${result.savingsPercent.toFixed(1)}%)`;
      case 'tax':
        return `After Tax: ${formatCurrency(result.priceAfterTax)} | Tax: ${formatCurrency(result.taxAmount)}`;
      default:
        return JSON.stringify(result);
    }
  } catch {
    return resultStr;
  }
}

function getInputSummary(type: string, inputStr: string): string {
  try {
    const input = JSON.parse(inputStr);
    switch (type) {
      case 'pricing':
        return `Cost: ${formatCurrency(input.costPrice)}`;
      case 'shipping':
        return `${input.destination || 'Unknown'} | ${input.weight || 0}kg`;
      case 'discount':
        return `Original: ${formatCurrency(input.originalPrice)} | ${input.discountType === 'percentage' ? input.discountValue + '%' : formatCurrency(input.discountValue)} off`;
      case 'tax':
        return `Price: ${formatCurrency(input.price)} @ ${input.taxRate}%`;
      default:
        return JSON.stringify(input);
    }
  } catch {
    return inputStr;
  }
}

export default function CalculationHistory({ onClear }: Props) {
  const [calculations, setCalculations] = useState<CalculationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');

  const fetchCalculations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/calculations');
      const data = await res.json();
      if (data.success) {
        setCalculations(data.data);
      }
    } catch {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalculations();
  }, [fetchCalculations]);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all calculation history?')) return;
    setClearing(true);
    try {
      await fetch('/api/calculations', { method: 'DELETE' });
      setCalculations([]);
      onClear();
    } catch {
      setError('Failed to clear history.');
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="calculator-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">📋 Calculation History</h2>
          <p className="text-red-400 text-sm">{calculations.length} saved calculation{calculations.length !== 1 ? 's' : ''}</p>
        </div>
        {calculations.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={clearing}
            className="btn-danger"
          >
            {clearing ? 'Clearing...' : '🗑️ Clear All'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg p-3 mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-red-400 mt-3">Loading history...</p>
        </div>
      ) : calculations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🧮</div>
          <p className="text-red-300 text-lg font-medium">No calculations yet</p>
          <p className="text-red-600 text-sm mt-1">Use the calculator above and save your results</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {calculations.map((calc) => (
            <div key={calc.id} className="history-item">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={getBadgeClass(calc.type)}>{calc.type}</span>
                    <span className="text-red-600 text-xs">{formatDate(calc.createdAt)}</span>
                  </div>
                  <p className="text-red-300 text-xs mb-1">
                    <span className="text-red-500 font-medium">Input: </span>
                    {getInputSummary(calc.type, calc.input)}
                  </p>
                  <p className="text-white text-sm font-medium">
                    {getResultSummary(calc.type, calc.result)}
                  </p>
                </div>
                <div className="text-red-600 text-lg font-bold shrink-0">#{calc.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
