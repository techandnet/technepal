import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const PRIMARY_LINKS = [
  { label: 'Mobiles', href: '/mobiles' },
  { label: 'Laptops', href: '/laptops' },
  { label: 'Electronics', href: '/categories' },
  { label: 'Tech Blog', href: '/blog' },
  { label: 'Admin', href: '/admin' },
];

export function Navbar() {
  const { path, navigate, settings, cart, setIsCartOpen } = useStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentBase = path.split('?')[0];

  return (
    <div className="sticky top-0 z-40">
      {!bannerDismissed && settings.announcementBar && (
        <div className="bg-[#0F172A] text-white h-9 px-4 flex items-center justify-center relative text-xs">
          <p className="truncate max-w-4xl pr-6 font-medium text-slate-200">
            {settings.announcementBar}
          </p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
            className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8] rounded"
          >
            {settings.storeName || 'KtmTech'}
          </button>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {PRIMARY_LINKS.map((link) => {
              const active =
                currentBase === link.href ||
                (link.href === '/mobiles' && currentBase === '/brands') ||
                (link.href === '/laptops' && currentBase === '/laptop-brands') ||
                (link.href === '/categories' && currentBase === '/shop');
              return (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => navigate(link.href)}
                  className={`whitespace-nowrap shrink-0 cursor-pointer py-1 transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#1D4ED8] rounded ${
                    active ? 'text-[#1D4ED8] font-semibold underline underline-offset-4' : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bag</span>
              <span className="font-mono-num">({itemCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {[
              ...PRIMARY_LINKS,
              { label: 'All Mobile Brands', href: '/brands' },
              { label: 'All Laptop Brands', href: '/laptop-brands' },
              { label: 'Compare Devices', href: '/compare' },
              { label: 'Phone Exchange', href: '/exchange' },
              { label: 'My Orders', href: '/orders' },
            ].map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  navigate(item.href);
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}
