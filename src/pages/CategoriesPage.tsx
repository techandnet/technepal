import { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import type { Department } from '../types';

const DEPARTMENTS: { key: Department; title: string; subtitle: string }[] = [
  {
    key: 'mobile-accessories',
    title: 'Mobile Accessories',
    subtitle: 'Chargers · Phone Cases · Power Banks · Cables · Gimbals',
  },
  {
    key: 'audio-wearables',
    title: 'Audio, Speakers & Wearables',
    subtitle: 'Earbuds (TWS) · Bluetooth Speakers · Soundbars · Smartwatches',
  },
  {
    key: 'heating-cooling',
    title: 'Heating, Cooling & Climate Equipment',
    subtitle: 'Room Heaters · Air Conditioners (AC) · Air Coolers · Water Heaters & Geysers',
  },
  {
    key: 'home-kitchen',
    title: 'Home & Kitchen Electronics',
    subtitle: 'Smart TVs · Induction Cooktops · Mixer Grinders · Air Fryers · UPS',
  },
  {
    key: 'laptops-computing',
    title: 'Laptop & Computer Accessories',
    subtitle: 'Keyboards · Mice · Monitors · Wi-Fi 6 Routers · USB-C Hubs',
  },
];

export function CategoriesPage() {
  const { categories, products, navigate } = useStore();

  const countByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.categorySlug, (map.get(p.categorySlug) || 0) + 1);
    }
    return map;
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Storewide Departments
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Electronics, Accessories & Home Appliances
          </h1>
          <p className="text-sm text-slate-600">
            Chargers, phone cases, earbuds, Bluetooth speakers, room heaters, air coolers, ACs, water geysers, and kitchen electronics.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="text-sm font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
        >
          Browse All Products →
        </button>
      </div>

      {DEPARTMENTS.map((dept) => {
        const items = categories.filter((c) => c.department === dept.key);
        if (!items.length) return null;

        return (
          <section key={dept.key} className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">{dept.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{dept.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/shop?department=${dept.key}`)}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
              >
                View department →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((cat) => {
                const count = countByCat.get(cat.slug) || 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => navigate(`/shop?category=${cat.slug}`)}
                    className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-[#1D4ED8] hover:shadow-sm transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                  >
                    <div>
                      <h3 className="font-display text-sm font-semibold text-slate-900 group-hover:text-[#1D4ED8]">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <span className="font-mono-num text-xs font-medium text-[#1D4ED8]">
                      {count} {count === 1 ? 'item' : 'items'} →
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
