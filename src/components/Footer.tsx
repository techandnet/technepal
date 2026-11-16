import { useStore } from '../context/StoreContext';

export function Footer() {
  const { navigate, settings } = useStore();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold text-slate-900">
            {settings.storeName || 'KtmTech'}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
            Official VAT-billed smartphones, laptops, home appliances, verified technical specs, and local reviews in Nepal.
          </p>
        </div>

        <div className="space-y-2.5 text-sm">
          <h4 className="font-display font-semibold text-slate-900">Directories</h4>
          <ul className="space-y-2 text-slate-600">
            <li>
              <button type="button" onClick={() => navigate('/brands')} className="hover:text-[#1D4ED8] cursor-pointer">
                All 36 Mobile Brands
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/laptop-brands')} className="hover:text-[#1D4ED8] cursor-pointer">
                All Laptop & Gaming Brands
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/categories')} className="hover:text-[#1D4ED8] cursor-pointer">
                Electronics, Heaters & Audio
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/shop')} className="hover:text-[#1D4ED8] cursor-pointer">
                Browse All Products
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5 text-sm">
          <h4 className="font-display font-semibold text-slate-900">Tools & Editorial</h4>
          <ul className="space-y-2 text-slate-600">
            <li>
              <button type="button" onClick={() => navigate('/compare')} className="hover:text-[#1D4ED8] cursor-pointer">
                Side-by-Side Spec Compare
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/exchange')} className="hover:text-[#1D4ED8] cursor-pointer">
                Phone Exchange / Trade-In
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/blog')} className="hover:text-[#1D4ED8] cursor-pointer">
                Tech News & Buying Guides
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/orders')} className="hover:text-[#1D4ED8] cursor-pointer">
                My Orders & Tracking
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5 text-sm">
          <h4 className="font-display font-semibold text-slate-900">Nepal Payments & CMS</h4>
          <p className="text-slate-600 leading-relaxed">
            eSewa · Khalti · Fonepay Bank QR · Cash on Delivery
          </p>
          <div className="pt-1 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="text-sm font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Staff & Admin Login →
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} {settings.storeName || 'KtmTech'} Nepal. All prices in NPR inclusive of VAT.</span>
          <span>Kathmandu Valley & Nationwide Delivery</span>
        </div>
      </div>
    </footer>
  );
}
