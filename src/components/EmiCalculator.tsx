import { useState } from 'react';

export function EmiCalculator({ price }: { price: number }) {
  const [downPercent, setDownPercent] = useState(40);
  const [months, setMonths] = useState(12);
  const [planType, setPlanType] = useState<'zero' | 'bank'>('zero');

  const annualRate = planType === 'zero' ? 0 : 12;
  const downPayment = Math.round((price * downPercent) / 100);
  const loanAmount = Math.max(0, price - downPayment);
  const monthlyRate = annualRate / 12 / 100;

  const monthlyEmi =
    monthlyRate === 0
      ? Math.round(loanAmount / months)
      : Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1),
        );

  return (
    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-slate-900">
          Nepal EMI Estimator
        </h3>
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setPlanType('zero')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              planType === 'zero' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            0% Credit Card
          </button>
          <button
            type="button"
            onClick={() => setPlanType('bank')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              planType === 'bank' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Partner Finance (12%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <label className="block space-y-1.5">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Down Payment</span>
            <span className="font-mono-num text-slate-900">{downPercent}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={70}
            step={10}
            value={downPercent}
            onChange={(e) => setDownPercent(Number(e.target.value))}
            className="w-full accent-[#1D4ED8] cursor-pointer"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-slate-600 font-medium block">Tenure</span>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 font-medium"
          >
            {[3, 6, 9, 12, 18].map((m) => (
              <option key={m} value={m}>
                {m} Months
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 text-xs">
        <span className="text-slate-600">
          Down payment:{' '}
          <strong className="font-mono-num text-slate-900">
            Rs. {downPayment.toLocaleString()}
          </strong>
        </span>
        <span className="font-mono-num text-base font-bold text-[#1D4ED8]">
          Rs. {monthlyEmi.toLocaleString()} / mo
        </span>
      </div>
    </div>
  );
}
