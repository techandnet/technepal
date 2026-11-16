import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { ExchangeRequest } from '../types';

export function ExchangePage() {
  const { path, products, user, signInWithGoogle, createExchangeRequest, navigate } = useStore();

  const initialTarget = (() => {
    const qs = path.includes('?') ? path.split('?')[1] : '';
    return new URLSearchParams(qs).get('target') || '';
  })();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [currentDevice, setCurrentDevice] = useState('');
  const [condition, setCondition] =
    useState<ExchangeRequest['condition']>('Mint / Like New');
  const [targetProductSlug, setTargetProductSlug] = useState(initialTarget);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const smartphones = products.filter((p) => p.productType === 'smartphone');

  const estimatedBonus =
    condition === 'Mint / Like New' ? 42000 : condition === 'Good (Minor Wear)' ? 30000 : 18000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!user) {
      try {
        await signInWithGoogle();
      } catch {
        setErrorMsg('Please sign in with Google to submit a trade-in request.');
      }
      return;
    }

    setSubmitting(true);
    try {
      const id = await createExchangeRequest({
        customerName: customerName || user.displayName || 'Customer',
        customerPhone,
        currentDevice,
        condition,
        targetProductSlug: targetProductSlug || undefined,
        estimatedValue: estimatedBonus,
      });
      setSubmittedId(id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-14">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[#047857] mx-auto" />
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Trade-In Request Received
          </h1>
          <p className="text-sm text-slate-600">
            Reference ID: <span className="font-mono-num font-semibold">{submittedId}</span>. Our Kathmandu valuation desk will contact you on {customerPhone} within 24 hours.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-4 py-2.5 bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              View My Requests
            </button>
            <button
              type="button"
              onClick={() => navigate('/mobiles')}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Browse Smartphones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Trade-In Program · Kathmandu Valley
        </p>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Exchange Your Old Smartphone
        </h1>
        <p className="text-sm text-slate-600">
          Upgrade to a new VAT-billed phone with instant valuation credit toward your next device or 0% EMI down payment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        <div className="md:col-span-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Suman Karki"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Mobile Number
            </label>
            <input
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono-num"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Current Phone Model & Storage
            </label>
            <input
              required
              value={currentDevice}
              onChange={(e) => setCurrentDevice(e.target.value)}
              placeholder="e.g. iPhone 13 128GB or Galaxy A54 8/256GB"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Physical Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ExchangeRequest['condition'])}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="Mint / Like New">Mint / Like New</option>
              <option value="Good (Minor Wear)">Good (Minor Wear)</option>
              <option value="Fair (Visible Scratches)">Fair (Visible Scratches)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Upgrading To (Optional)
            </label>
            <select
              value={targetProductSlug}
              onChange={(e) => setTargetProductSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="">Decide later</option>
              {smartphones.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.title} (Rs. {s.basePrice.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}
        </div>

        <div className="md:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 h-fit space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            Preliminary Trade-In Guide
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Typical trade-in credit based on your selected condition tier before physical inspection at our New Road or Pulchowk counter:
          </p>
          <div className="py-3 border-y border-slate-200 flex items-baseline justify-between">
            <span className="text-xs text-slate-600">Indicative Value</span>
            <span className="font-mono-num text-xl font-bold text-[#1D4ED8]">
              ~ Rs. {estimatedBonus.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Bring your original box or citizenship copy for final verification.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {user
              ? submitting
                ? 'Submitting...'
                : 'Submit Trade-In Request'
              : 'Sign in with Google & Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
