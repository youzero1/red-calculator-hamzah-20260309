'use client';

import { useState } from 'react';
import PricingCalculator from './PricingCalculator';
import ShippingCalculator from './ShippingCalculator';
import DiscountCalculator from './DiscountCalculator';
import TaxCalculator from './TaxCalculator';
import CalculationHistory from './CalculationHistory';

type Tab = 'pricing' | 'shipping' | 'discount' | 'tax';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'pricing', label: 'Pricing', icon: '💰' },
  { id: 'shipping', label: 'Shipping', icon: '📦' },
  { id: 'discount', label: 'Discount', icon: '🏷️' },
  { id: 'tax', label: 'Tax / VAT', icon: '🧾' },
];

export default function Calculator() {
  const [activeTab, setActiveTab] = useState<Tab>('pricing');
  const [historyKey, setHistoryKey] = useState(0);

  const refreshHistory = () => setHistoryKey((k) => k + 1);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-0 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${
              activeTab === tab.id ? 'active' : 'inactive'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calculator Panel */}
      <div className="calculator-card p-6 mb-8">
        {activeTab === 'pricing' && <PricingCalculator onSave={refreshHistory} />}
        {activeTab === 'shipping' && <ShippingCalculator onSave={refreshHistory} />}
        {activeTab === 'discount' && <DiscountCalculator onSave={refreshHistory} />}
        {activeTab === 'tax' && <TaxCalculator onSave={refreshHistory} />}
      </div>

      {/* History */}
      <CalculationHistory key={historyKey} onClear={refreshHistory} />
    </div>
  );
}
