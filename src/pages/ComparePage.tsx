import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';

const SPEC_ROWS: { label: string; get: (p: Product) => string }[] = [
  { label: 'Nepal Price', get: (p) => `Rs. ${p.basePrice.toLocaleString()}` },
  { label: 'Brand', get: (p) => p.brandName },
  { label: 'Display', get: (p) => p.specs?.display || '—' },
  { label: 'Processor / Chipset', get: (p) => p.specs?.processor || '—' },
  { label: 'Graphics (GPU)', get: (p) => p.specs?.gpu || 'Integrated / Mobile' },
  { label: 'Rear Camera', get: (p) => p.specs?.rearCamera || '—' },
  { label: 'Front Camera', get: (p) => p.specs?.frontCamera || '—' },
  { label: 'Battery & Charging', get: (p) => p.specs?.battery || '—' },
  { label: 'Operating System', get: (p) => p.specs?.os || '—' },
  {
    label: '5G / Gaming',
    get: (p) =>
      p.productType === 'smartphone'
        ? p.specs?.supports5G
          ? '5G Supported'
          : '4G LTE'
        : p.specs?.isGaming
          ? 'Dedicated Gaming Series'
          : 'Ultrabook / Productivity',
  },
  { label: 'Warranty', get: (p) => p.warrantyInfo || 'Official Brand Warranty' },
];

export function ComparePage() {
  const { products, compareSlugs, toggleCompare, navigate } = useStore();

  const comparableProducts = useMemo(
    () => products.filter((p) => p.productType === 'smartphone' || p.productType === 'laptop'),
    [products],
  );

  const selectedDevices = useMemo(() => {
    const matched = compareSlugs
      .map((slug) => comparableProducts.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
    if (matched.length === 0) return comparableProducts.slice(0, 2);
    return matched;
  }, [compareSlugs, comparableProducts]);

  const handleSelectSlot = (slotIdx: number, newSlug: string) => {
    if (!newSlug) return;
    const current = selectedDevices.map((d) => d.slug);
    const prevSlug = current[slotIdx];
    if (prevSlug && prevSlug !== newSlug) {
      toggleCompare(prevSlug);
    }
    if (!compareSlugs.includes(newSlug)) {
      toggleCompare(newSlug);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Specification Matrix
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Compare Smartphones & Laptops
          </h1>
          <p className="text-sm text-slate-600">
            Select up to 3 devices side by side to compare display, processor, battery, and official Nepal pricing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/mobiles')}
          className="text-sm font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
        >
          Browse Mobile Prices →
        </button>
      </div>

      {/* Device Picker Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((slotIdx) => {
          const device = selectedDevices[slotIdx];
          return (
            <div key={slotIdx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Device {slotIdx + 1}</span>
                {device && selectedDevices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => toggleCompare(device.slug)}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                    aria-label={`Remove ${device.title}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select
                value={device?.slug || ''}
                onChange={(e) => handleSelectSlot(slotIdx, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white font-medium"
              >
                <option value="">+ Add device to compare</option>
                {comparableProducts.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.title} (Rs. {p.basePrice.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] border-b border-slate-200">
              <tr>
                <th className="p-4 w-48 font-display font-semibold text-slate-600">Specification</th>
                {selectedDevices.map((p) => (
                  <th key={p.id} className="p-4 min-w-[220px]">
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${p.slug}`)}
                      className="font-display text-base font-bold text-slate-900 hover:text-[#1D4ED8] text-left cursor-pointer"
                    >
                      {p.title}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SPEC_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="p-4 font-medium text-slate-600 bg-[#FAFAFA]">{row.label}</td>
                  {selectedDevices.map((p) => (
                    <td key={p.id} className="p-4 text-slate-900 font-mono-num">
                      {row.get(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4 font-medium text-slate-600 bg-[#FAFAFA]">Action</td>
                {selectedDevices.map((p) => (
                  <td key={p.id} className="p-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${p.slug}`)}
                      className="px-4 py-2 bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg hover:bg-[#1E40AF] cursor-pointer whitespace-nowrap"
                    >
                      View & Buy
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
