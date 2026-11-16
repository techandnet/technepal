import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LaptopBrandCard {
  key: string;
  displayName: string;
  slug: string;
  section: 'major-global' | 'gaming' | 'budget-niche';
  lineups: string;
  href: string;
  count: number;
}

const SECTIONS = [
  {
    key: 'major-global',
    title: 'Major Global Laptop Brands',
    subtitle: 'Ultrabooks, business workstations, and everyday laptops',
  },
  {
    key: 'gaming',
    title: 'Top Gaming Laptop Brands',
    subtitle: 'High-refresh RTX gaming and creator powerhouses',
  },
  {
    key: 'budget-niche',
    title: 'Budget, Regional & Niche Brands',
    subtitle: 'Value notebooks, Linux, modular, and rugged Toughbooks',
  },
] as const;

export function LaptopBrandsPage() {
  const { brands, products, navigate } = useStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const cards = useMemo(() => {
    const laptopProducts = products.filter((p) => p.productType === 'laptop');
    const countAll = new Map<string, number>();
    const countGaming = new Map<string, number>();

    for (const p of laptopProducts) {
      countAll.set(p.brandSlug, (countAll.get(p.brandSlug) || 0) + 1);
      if (p.specs?.isGaming) {
        countGaming.set(p.brandSlug, (countGaming.get(p.brandSlug) || 0) + 1);
      }
    }

    const list: LaptopBrandCard[] = [];
    for (const b of brands) {
      if (!b.deviceTypes.includes('laptop')) continue;
      if (b.laptopTier) {
        list.push({
          key: `${b.slug}-main`,
          displayName: b.name === 'Xiaomi' ? 'Xiaomi / Redmi' : b.name,
          slug: b.slug,
          section: b.laptopTier,
          lineups: b.laptopLineups || '',
          href: `/laptops?brand=${b.slug}`,
          count: countAll.get(b.slug) || 0,
        });
      }
      if (b.gamingDivisionName) {
        list.push({
          key: `${b.slug}-gaming`,
          displayName: b.gamingDivisionName,
          slug: b.slug,
          section: 'gaming',
          lineups: b.gamingLineups || '',
          href: `/laptops?brand=${b.slug}&gaming=true`,
          count: countGaming.get(b.slug) || 0,
        });
      }
    }
    return list;
  }, [brands, products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      const textMatch =
        !q || c.displayName.toLowerCase().includes(q) || c.lineups.toLowerCase().includes(q);
      const tabMatch = activeTab === 'all' || c.section === activeTab;
      return textMatch && tabMatch;
    });
  }, [cards, query, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Laptop & Gaming Directory
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            All Laptop Brands ({cards.length})
          </h1>
          <p className="text-sm text-slate-600">
            Search any laptop brand or series (MacBook, ThinkPad, ROG, Alienware, Predator, Framework, Toughbook).
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/laptops')}
          className="text-sm font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
        >
          Browse All Laptops →
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand or series (MacBook, ThinkPad, ROG, Nitro)..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-full lg:w-auto">
          {[
            { id: 'all', label: `All (${cards.length})` },
            { id: 'major-global', label: 'Major Global' },
            { id: 'gaming', label: 'Gaming Brands' },
            { id: 'budget-niche', label: 'Budget & Niche' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {SECTIONS.map((section) => {
        const items = filtered.filter((c) => c.section === section.key);
        if (!items.length) return null;

        return (
          <section key={section.key} className="space-y-4">
            <div className="border-b border-slate-200 pb-2.5">
              <h2 className="font-display text-xl font-bold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{section.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => navigate(card.href)}
                  className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-[#1D4ED8] hover:shadow-sm transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F4F5F7] text-slate-800 font-display font-bold flex items-center justify-center text-sm shrink-0 group-hover:bg-[#1D4ED8]/10 group-hover:text-[#1D4ED8] transition-colors">
                      {card.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-semibold text-slate-900 group-hover:text-[#1D4ED8] truncate">
                        {card.displayName}
                      </h3>
                      <p className="font-mono-num text-xs text-slate-500">
                        {card.count} {card.count === 1 ? 'model' : 'models'}
                      </p>
                    </div>
                  </div>

                  {card.lineups && (
                    <p className="text-xs text-slate-500 border-t border-slate-100 pt-2 line-clamp-1">
                      {card.lineups}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
