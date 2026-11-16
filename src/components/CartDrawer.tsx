import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    navigate,
  } = useStore();

  if (!isCartOpen) return null;

  const threshold = 50000;
  const remaining = Math.max(0, threshold - cartSubtotal);
  const progress = Math.min(100, Math.round((cartSubtotal / threshold) * 100));
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div className="w-full max-w-md bg-white h-full flex flex-col border-l border-slate-200 shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#1D4ED8]" />
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Your Bag ({totalCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close bag"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 bg-[#F4F5F7] border-b border-slate-200 text-xs">
          <p className="text-slate-700 font-medium mb-2">
            {remaining === 0
              ? 'Free Kathmandu Valley delivery unlocked on this order.'
              : `Add Rs. ${remaining.toLocaleString()} more for free Kathmandu Valley delivery`}
          </p>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1D4ED8] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">Your shopping bag is empty</p>
                <p className="text-xs text-slate-500">
                  Browse smartphones, laptops, audio gear, or home electronics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/mobiles');
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#1D4ED8] text-white rounded-lg hover:bg-[#1E40AF] transition-colors cursor-pointer"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.productId}-${item.variantIndex ?? 'std'}`}
                className="flex gap-3.5 p-3 border border-slate-200 rounded-xl bg-white"
              >
                <div className="w-20 h-16 rounded-lg bg-[#F4F5F7] overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate(`/product/${item.slug}`);
                    }}
                    className="text-sm font-semibold text-slate-900 hover:text-[#1D4ED8] truncate block w-full text-left cursor-pointer"
                  >
                    {item.title}
                  </button>
                  {item.variantLabel && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.variantLabel}</p>
                  )}
                  <p className="font-mono-num text-sm font-semibold text-slate-900 mt-1.5">
                    Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => removeFromCart(idx)}
                    aria-label="Remove item"
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-slate-200 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => updateCartQty(idx, -1)}
                      aria-label="Decrease quantity"
                      className="p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 font-mono-num font-medium text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(idx, 1)}
                      aria-label="Increase quantity"
                      className="p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-[#F8FAFC] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-mono-num text-base font-bold text-slate-900">
                Rs. {cartSubtotal.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              className="w-full py-3 px-4 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
