import { useMemo, useState } from 'react';
import { GitCompare, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import type { Department } from '../types';

const BUDGET_RANGES = [
  { label: 'All Budgets', min: '', max: '' },
  { label: 'Under Rs. 20,000', min: '0', max: '20000' },
  { label: 'Rs. 20,000 – 50,000', min: '20000', max: '50000' },
  { label: 'Rs. 50,000 – 1,20,000', min: '50000', max: '120000' },
  { label: 'Above Rs. 1,20,000', min: '120000', max: '' },
];

export function CatalogPage({ mode }: { mode: 'mobiles' | 'laptops' | 'shop' }) {
  const { path, navigate, products, brands, categories, compareSlugs } = useStore();

  const searchParams = useMemo(() => {
    const queryStr = path.includes('?') ? path.split('?')[1] : '';
    return new URLSearchParams(queryStr);
  }, [path]);

  const [localSearch, setLocalSearch] = useState(() => searchParams.get('q') || '');

  const activeBrand = searchParams.get('brand') || '';
  const activeCategory = searchParams.get('category') || '';
  const activeDept = (searchParams.get('department') || '') as Department | '';
  const minPrice = searchParams.get('min') || '';
  const maxPrice = searchParams.get('max') || '';
  const only5G = searchParams.get('5g') === 'true';
  const onlyGaming = searchParams.get('gaming') === 'true';
  const sort = searchParams.get('sort') || 'latest';
  const urlQuery = searchParams.get('q') || '';

  const basePath = mode === 'mobiles' ? '/mobiles' : mode === 'laptops' ? '/laptops' : '/shop';

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    const qs = next.toString();
    navigate(qs ? `${basePath}?${qs}` : basePath);
  };

  const resetFilters = () => {
    setLocalSearch('');
    navigate(basePath);
  };

  const filteredProducts = useMemo(() => {
    const q = (urlQuery || localSearch).trim().toLowerCase();
    return products
      .filter((p) => {
        if (mode === 'mobiles' && p.productType !== 'smartphone') return false;
        if (mode === 'laptops' && p.productType !== 'laptop') return false;
        if (activeBrand && p.brandSlug !== activeBrand) return false;
        if (activeCategory && p.categorySlug !== activeCategory) return false;
        if (activeDept && p.department !== activeDept) return false;
        if (minPrice && p.basePrice < Number(minPrice)) return false;
        if (maxPrice && p.basePrice > Number(maxPrice)) return false;
        if (only5G && !p.specs?.supports5G) return false;
        if (onlyGaming && !p.specs?.isGaming) return false;
        if (q) {
          const haystack = [
            p.title,
            p.brandName,
            p.categoryName,
            p.summary || '',
            p.specs?.processor || '',
            p.specs?.gpu || '',
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'price_asc') return a.basePrice - b.basePrice;
        if (sort === 'price_desc') return b.basePrice - a.basePrice;
        return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
      });
  }, [
    products,
    mode,
    activeBrand,
    activeCategory,
    activeDept,
    minPrice,
    maxPrice,
    only5G,
    onlyGaming,
    urlQuery,
    localSearch,
    sort,
  ]);

  const relevantBrands = useMemo(() => {
    if (mode === 'mobiles') return brands.filter((b) => b.deviceTypes.includes('mobile'));
    if (mode === 'laptops') return brands.filter((b) => b.deviceTypes.includes('laptop'));
    return brands;
  }, [brands, mode]);

  const pageTitle =
    mode === 'mobiles'
      ? 'Mobile Price in Nepal'
      : mode === 'laptops'
        ? `${onlyGaming ? 'Gaming ' : ''}Laptop Price in Nepal`
        : activeCategory
          ? categories.find((c) => c.slug === activeCategory)?.name || 'All Electronics & Gear'
          : 'All Electronics, Accessories & Appliances';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Official Storefront · VAT Included
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {pageTitle}{' '}
            <span className="font-mono-num text-lg font-medium text-slate-500">
              ({filteredProducts.length})
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {mode === 'mobiles' && (
            <button
              type="button"
              onClick={() => navigate('/brands')}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] cursor-pointer whitespace-nowrap"
            >
              All 36 Mobile Brands
            </button>
          )}
          {mode === 'laptops' && (
            <button
              type="button"
              onClick={() => navigate('/laptop-brands')}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] cursor-pointer whitespace-nowrap"
            >
              All Laptop Brands
            </button>
          )}
          {mode === 'shop' && (
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] cursor-pointer whitespace-nowrap"
            >
              All Categories
            </button>
          )}
          {compareSlugs.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/compare')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer whitespace-nowrap"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare ({compareSlugs.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-5 bg-white border border-slate-200 rounded-xl p-5 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900">Filters</h2>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#1D4ED8] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Keyword</label>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                updateParams({ q: e.target.value });
              }}
              placeholder="Model, chip, wattage..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          {mode === 'shop' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Category</label>
              <select
                value={activeCategory}
                onChange={(e) => updateParams({ category: e.target.value, department: '' })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Brand</label>
            <select
              value={activeBrand}
              onChange={(e) => updateParams({ brand: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="">All Brands</option>
              {relevantBrands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">Price in Nepal</span>
            <div className="space-y-1">
              {BUDGET_RANGES.map((range) => {
                const active = minPrice === range.min && maxPrice === range.max;
                return (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => updateParams({ min: range.min, max: range.max })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#1D4ED8]/10 text-[#1D4ED8] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'mobiles' && (
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={only5G}
                onChange={(e) => updateParams({ '5g': e.target.checked ? 'true' : '' })}
                className="accent-[#1D4ED8] w-4 h-4"
              />
              <span>5G Phones Only</span>
            </label>
          )}

          {mode === 'laptops' && (
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={onlyGaming}
                onChange={(e) => updateParams({ gaming: e.target.checked ? 'true' : '' })}
                className="accent-[#1D4ED8] w-4 h-4"
              />
              <span>Gaming Series Only</span>
            </label>
          )}

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">Sort By</label>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="latest">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <p className="font-display text-lg font-semibold text-slate-900">
                No matching products in current filters
              </p>
              <p className="text-sm text-slate-500">
                Try clearing a price filter or switching brands—or add new models anytime from /admin.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg hover:bg-[#1E40AF] cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
