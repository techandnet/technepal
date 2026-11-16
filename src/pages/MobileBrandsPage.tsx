import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const MOBILE_TIERS = [
  {
    key: 'global-leaders',
    title: 'Global Market Leaders',
    subtitle: 'Top flagship and mainstream smartphone manufacturers worldwide',
  },
  {
    key: 'budget-emerging',
    title: 'Popular Budget & Emerging Brands',
    subtitle: 'High-value budget, mid-range, and fast-growing challengers',
  },
  {
    key: 'niche-gaming',
    title: 'Niche, Gaming & Regional Brands',
    subtitle: 'Dedicated gaming phones, rugged outdoor devices, and regional specialists',
  },
] as const;

export function MobileBrandsPage() {
  const { brands, products, navigate } = useStore();
  const [query, setQuery] = useState('');
  const [activeTier, setActiveTier] = useState<string>('all');

  const mobileBrands = useMemo(
    () => brands.filter((b) => b.deviceTypes.includes('mobile') && b.tier),
    [brands],
  );

  const countByBrand = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (p.productType === 'smartphone') {
        map.set(p.brandSlug, (map.get(p.brandSlug) || 0) + 1);
      }
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mobileBrands.filter((b) => {
      const textMatch =
        !q || b.name.toLowerCase().includes(q) || (b.subBrands || '').toLowerCase().includes(q);
      const tierMatch = activeTier === 'all' || b.tier === activeTier;
      return textMatch && tierMatch;
    });
  }, [mobileBrands, query, activeTier]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Mobile Brand Directory
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            All Mobile Phone Brands ({mobileBrands.length})
          </h1>
          <p className="text-sm text-slate-600">
            Search any manufacturer or sub-brand (Redmi, Poco, iQOO, CMF, Nubia, RedMagic, ROG) to browse models and Nepal prices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/mobiles')}
          className="text-sm font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
        >
          Browse All Smartphones →
        </button>
      </div>

      {/* Search + Segmented Tier Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand or sub-brand (Poco, iQOO, CMF, ROG)..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-full lg:w-auto">
          {[
            { id: 'all', label: `All (${mobileBrands.length})` },
            { id: 'global-leaders', label: 'Global Leaders' },
            { id: 'budget-emerging', label: 'Budget & Emerging' },
            { id: 'niche-gaming', label: 'Niche & Gaming' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTier(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTier === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {MOBILE_TIERS.map((section) => {
        const items = filtered.filter((b) => b.tier === section.key);
        if (!items.length) return null;

        return (
          <section key={section.key} className="space-y-4">
            <div className="border-b border-slate-200 pb-2.5">
              <h2 className="font-display text-xl font-bold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{section.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((brand) => {
                const count = countByBrand.get(brand.slug) || 0;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => navigate(`/mobiles?brand=${brand.slug}`)}
                    className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-[#1D4ED8] hover:shadow-sm transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F4F5F7] text-slate-800 font-display font-bold flex items-center justify-center text-sm shrink-0 group-hover:bg-[#1D4ED8]/10 group-hover:text-[#1D4ED8] transition-colors">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-sm font-semibold text-slate-900 group-hover:text-[#1D4ED8] truncate">
                          {brand.name}
                        </h3>
                        <p className="font-mono-num text-xs text-slate-500">
                          {count} {count === 1 ? 'model' : 'models'}
                        </p>
                      </div>
                    </div>

                    {brand.subBrands && (
                      <p className="text-xs text-slate-500 border-t border-slate-100 pt-2 line-clamp-1">
                        {brand.subBrands}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
          No mobile brands matched &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}
