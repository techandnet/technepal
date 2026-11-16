import { useState } from 'react';
import { CheckCircle2, PackageCheck, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { PaymentMethod } from '../types';

export function CheckoutPage({ showOrdersOnly = false }: { showOrdersOnly?: boolean }) {
  const {
    cart,
    cartSubtotal,
    clearCart,
    user,
    signInWithGoogle,
    createOrder,
    orders,
    exchangeRequests,
    settings,
    navigate,
  } = useStore();

  const [zone, setZone] = useState<'kathmandu-valley' | 'outside-valley'>('kathmandu-valley');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('esewa');
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    method: PaymentMethod;
    total: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (showOrdersOnly) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Account History
            </p>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              My Orders & Trade-In Requests
            </h1>
          </div>
          {!user && (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-4 py-2.5 bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg hover:bg-[#1E40AF] cursor-pointer"
            >
              Sign in with Google
            </button>
          )}
        </div>

        {!user ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <p className="font-display text-lg font-semibold text-slate-900">
              Sign in to view your orders
            </p>
            <p className="text-sm text-slate-500">
              Your orders and smartphone exchange valuations are tied securely to your Google account.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Purchase Orders ({orders.length})
              </h2>
              {orders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
                  You have not placed any orders yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="font-mono-num text-xs text-slate-500">
                          {ord.id} · {ord.paymentMethod.toUpperCase()}
                        </p>
                        <h3 className="font-display text-base font-semibold text-slate-900">
                          {ord.items.map((i) => `${i.title} × ${i.quantity}`).join(', ')}
                        </h3>
                        <p className="text-xs text-slate-600">{ord.shippingAddress}</p>
                      </div>
                      <div className="text-left sm:text-right space-y-1 shrink-0">
                        <p className="font-mono-num text-base font-bold text-slate-900">
                          Rs. {ord.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs font-semibold text-[#1D4ED8] capitalize">
                          Order: {ord.orderStatus} · Payment: {ord.paymentStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Trade-In Requests ({exchangeRequests.length})
              </h2>
              {exchangeRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
                  No smartphone exchange requests submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {exchangeRequests.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="font-mono-num text-xs text-slate-500">{ex.id}</p>
                        <h3 className="font-display text-base font-semibold text-slate-900">
                          {ex.currentDevice} ({ex.condition})
                        </h3>
                      </div>
                      <div className="text-left sm:text-right space-y-1 shrink-0">
                        {ex.estimatedValue !== undefined && (
                          <p className="font-mono-num text-sm font-bold text-slate-900">
                            Est. Rs. {ex.estimatedValue.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-[#047857] capitalize">
                          Status: {ex.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#047857] mx-auto" />
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Order #{confirmedOrder.id} Confirmed
            </h1>
            <p className="text-sm text-slate-600">
              Preparing shipment · Total payable:{' '}
              <strong className="font-mono-num text-slate-900">
                Rs. {confirmedOrder.total.toLocaleString()}
              </strong>
            </p>
          </div>

          {confirmedOrder.method === 'bank_transfer' && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 space-y-2 text-sm">
              <p className="font-display font-bold text-slate-900">
                Bank Transfer / Fonepay Settlement Details
              </p>
              <p className="text-slate-600">
                Bank: <strong className="text-slate-900">{settings.bankName}</strong>
              </p>
              <p className="text-slate-600">
                Account Name: <strong className="text-slate-900">{settings.accountName}</strong>
              </p>
              <p className="text-slate-600">
                Account No:{' '}
                <strong className="font-mono-num text-slate-900">{settings.accountNumber}</strong>
              </p>
              <p className="text-xs text-slate-500 pt-1">
                Include Order ID <span className="font-mono-num">{confirmedOrder.id}</span> in your Fonepay remarks for instant verification.
              </p>
            </div>
          )}

          {(confirmedOrder.method === 'esewa' || confirmedOrder.method === 'khalti') && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 space-y-2 text-sm">
              <p className="font-display font-bold text-slate-900">
                {confirmedOrder.method === 'esewa'
                  ? 'eSewa ePay v2 Checkout Queued'
                  : 'Khalti KPG-2 Checkout Queued'}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your order has been securely saved to Firestore in pending state. In live Vercel deployment with merchant keys configured, this redirects immediately to the official {confirmedOrder.method === 'esewa' ? 'eSewa HMAC-SHA256' : 'Khalti KPG-2'} gateway.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-5 py-2.5 bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg hover:bg-[#1E40AF] cursor-pointer"
            >
              View Order Receipt
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shippingFee =
    zone === 'kathmandu-valley' ? (cartSubtotal >= 50000 || cartSubtotal === 0 ? 0 : 100) : 250;
  const totalAmount = cartSubtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cart.length) {
      setErrorMsg('Your bag is empty.');
      return;
    }

    if (!user) {
      try {
        await signInWithGoogle();
      } catch {
        setErrorMsg('Please sign in with Google to place your order.');
      }
      return;
    }

    setSubmitting(true);
    try {
      const orderId = await createOrder({
        customerName: name || user.displayName || 'Customer',
        customerPhone: phone,
        customerEmail: email || user.email || '',
        deliveryZone: zone,
        shippingAddress: address,
        items: cart.map((c) => ({
          productId: c.productId,
          title: c.title,
          variantLabel: c.variantLabel || 'Standard',
          quantity: c.quantity,
          unitPrice: c.unitPrice,
        })),
        subtotal: cartSubtotal,
        shippingFee,
        totalAmount,
        paymentMethod,
      });
      clearCart();
      setConfirmedOrder({ id: orderId, method: paymentMethod, total: totalAmount });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Secure Nepal Checkout
        </p>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Delivery & Payment
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-slate-900">1. Customer & Delivery</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Thapa"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mobile Number
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono-num"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Delivery Zone
            </label>
            <select
              value={zone}
              onChange={(e) =>
                setZone(e.target.value as 'kathmandu-valley' | 'outside-valley')
              }
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="kathmandu-valley">
                Inside Kathmandu Valley (Rs. 100 · Free above Rs. 50,000)
              </option>
              <option value="outside-valley">
                Outside Kathmandu Valley (Rs. 250 nationwide courier)
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Full Address (Tole, Ward, City, District)
            </label>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jhamsikhel-3, Lalitpur"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-2 space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900">2. Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'esewa', label: 'eSewa Mobile Wallet', note: 'Instant wallet checkout' },
                { id: 'khalti', label: 'Khalti Digital Wallet', note: 'Khalti / ConnectIPS' },
                { id: 'bank_transfer', label: 'Fonepay QR / Bank Transfer', note: 'Zero gateway fee' },
                { id: 'cod', label: 'Cash on Delivery (COD)', note: 'Pay rider upon inspection' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`border rounded-xl p-3.5 cursor-pointer flex items-start gap-2.5 transition-colors ${
                    paymentMethod === m.id
                      ? 'border-[#1D4ED8] bg-[#1D4ED8]/5'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id as PaymentMethod)}
                    className="mt-1 accent-[#1D4ED8]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                    <p className="text-xs text-slate-500">{m.note}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {errorMsg && <p className="text-xs font-medium text-red-600">{errorMsg}</p>}
        </div>

        {/* Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">Order Summary</h2>
              <PackageCheck className="w-5 h-5 text-slate-400" />
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">
                Your bag is empty. Add items from the store before checking out.
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100">
                {cart.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.variantLabel ? `${item.variantLabel} · ` : ''}Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono-num font-semibold text-slate-900 shrink-0">
                      Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono-num">Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery ({zone === 'kathmandu-valley' ? 'Valley' : 'Nationwide'})</span>
                <span className="font-mono-num">
                  {shippingFee === 0 ? 'Free' : `Rs. ${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="font-mono-num text-[#1D4ED8]">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !cart.length}
              className="w-full py-3.5 px-4 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors disabled:opacity-40 cursor-pointer"
            >
              {user
                ? submitting
                  ? 'Confirming Order...'
                  : `Confirm Order (Rs. ${totalAmount.toLocaleString()})`
                : 'Sign in with Google & Confirm Order'}
            </button>

            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#047857] shrink-0" />
              <span>Includes official VAT invoice & brand warranty card.</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
